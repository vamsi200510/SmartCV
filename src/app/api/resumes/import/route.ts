import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// @ts-ignore
import { PDFParse, InvalidPDFException } from 'pdf-parse';
import * as mammoth from 'mammoth';
import { extractResume, resemblesResume } from '@/lib/ai/resumeExtractor';

export async function POST(request: NextRequest) {
  const uploadStartTime = Date.now();
  console.log('[API-IMPORT] Received request at /api/resumes/import');

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((c) => ({
              name: c.name,
              value: c.value,
            }));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Stage 1: Received upload
    console.log('[DEBUG-STAGE-1] Received upload:', {
      filename: file.name,
      mimeType: file.type,
      size: file.size
    });

    // 10MB size limit validation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds maximum size limit of 10MB.' }, { status: 400 });
    }

    const extractionStart = Date.now();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let rawText = '';

    // File type validation & text extraction
    if (file.name.endsWith('.pdf')) {
      try {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        rawText = pdfData.text;
      } catch (parseErr: any) {
        console.error('[API-IMPORT] PDF parsing error:', parseErr?.message);
        if (
          parseErr instanceof InvalidPDFException ||
          parseErr?.name === 'InvalidPDFException' ||
          parseErr?.message?.includes('Invalid PDF') ||
          parseErr?.message?.includes('stream must have data') ||
          parseErr?.message?.includes('Bad') ||
          parseErr?.message?.includes('XRef')
        ) {
          return NextResponse.json({ error: 'Please upload a valid resume.' }, { status: 422 });
        }
        throw parseErr;
      }
    } else if (file.name.endsWith('.docx')) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        rawText = docxResult.value;
      } catch (docxErr: any) {
        console.error('[API-IMPORT] DOCX parsing error:', docxErr?.message);
        return NextResponse.json({ error: 'Please upload a valid resume.' }, { status: 422 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload PDF or DOCX only.' }, { status: 400 });
    }

    const extractionTimeMs = Date.now() - extractionStart;

    // Stage 2: PDF/DOCX extraction
    console.log('[DEBUG-STAGE-2] PDF/DOCX text extraction completed:', {
      extractedTextLength: rawText.length,
      first1000Chars: rawText.substring(0, 1000)
    });

    if (!rawText.trim() && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Please upload a valid resume.' }, { status: 422 });
    }

    // Call AI Extractor Coordinator (which runs AI extraction & fallback parser if needed)
    const result = await extractResume(rawText, buffer);
    const { data, stats } = result;

    // Check if the extracted content resembles a resume
    if (!resemblesResume(rawText, data)) {
      return NextResponse.json({ error: 'Please upload a valid resume.' }, { status: 422 });
    }

    // Map skills categories to list format expected by DB schema
    const skillsList: Array<{ category: string; items: string[] }> = [];
    const skillCats = [
      { key: 'languages', label: 'Languages' },
      { key: 'frontend', label: 'Frontend' },
      { key: 'backend', label: 'Backend' },
      { key: 'databases', label: 'Databases' },
      { key: 'tools', label: 'Tools' },
      { key: 'cloud', label: 'Cloud' },
      { key: 'others', label: 'Others' }
    ] as const;

    for (const cat of skillCats) {
      const items = data.skills[cat.key];
      if (Array.isArray(items) && items.length > 0) {
        skillsList.push({
          category: cat.label,
          items: items.map((i: string) => i.trim()).filter(Boolean)
        });
      }
    }

    // Resume Type Detection
    let detectedType = 'Fresher';
    const hasPublications = /publications|research|journal|conference/i.test(rawText);
    const hasExperience = data.experience.length > 0;
    const hasOnlyProjectsAndEdu = data.projects.length > 0 && data.education.length > 0 && !hasExperience;

    if (hasPublications) {
      detectedType = 'Academic';
    } else if (hasExperience) {
      detectedType = 'Experienced';
    } else if (hasOnlyProjectsAndEdu) {
      detectedType = 'Fresher';
    } else if (data.experience.length === 0 && data.projects.length === 0) {
      detectedType = 'Internship';
    }

    // Determine low confidence fields
    const lowConfidenceFields: string[] = [];
    const conf = data.confidence;
    if (conf.personal < 0.7) lowConfidenceFields.push('personalInfo');
    if (conf.summary < 0.7) lowConfidenceFields.push('summary');
    if (conf.experience < 0.7) lowConfidenceFields.push('experience');
    if (conf.education < 0.7) lowConfidenceFields.push('education');
    if (conf.projects < 0.7) lowConfidenceFields.push('projects');
    if (conf.skills < 0.7) lowConfidenceFields.push('skills');
    if (conf.certifications < 0.7) lowConfidenceFields.push('certifications');
    if (conf.achievements < 0.7) lowConfidenceFields.push('achievements');
    if (conf.additionalInfo < 0.7) lowConfidenceFields.push('additionalInfo');

    // Standardized Resume Data structure matching original schema
    const resumeData = {
      personalInfo: {
        fullName: data.personal.fullName || user.user_metadata?.full_name || '',
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'Candidate Profile',
        email: data.personal.email,
        phone: data.personal.phone,
        location: data.personal.address,
        website: data.personal.website,
        github: data.personal.github,
        linkedin: data.personal.linkedin,
        summary: data.summary
      },
      summary: data.summary,
      education: data.education,
      skills: skillsList,
      projects: data.projects,
      experience: data.experience,
      certifications: data.certifications,
      achievements: data.achievements,
      additionalInformation: {
        languages: data.additionalInfo.languages,
        interests: data.additionalInfo.interests
      },
      customization: {
        fontFamily: 'Inter',
        fontSize: 'medium',
        density: 'balanced',
        primaryColor: '#0f172a',
        visibleSections: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'],
        sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo']
      },
      importMetadata: {
        sourceFile: file.name,
        importedAt: new Date().toISOString(),
        lowConfidenceFields,
        detectedType,
        confidence: conf
      },
      rawResumeText: rawText // Save raw resume text inside resume_data record
    };


    // Stage 6: Database
    console.log('[DEBUG-STAGE-6] Database insert attempted.');

    // Insert record into resumes table
    const { data: resume, error: insertError } = await supabaseAdmin
      .from('resumes')
      .insert({
        user_id: user.id,
        title: `Imported - ${file.name.replace(/\.[^/.]+$/, '')}`,
        category: detectedType,
        role: resumeData.personalInfo.title,
        status: 'draft',
        template_id: 'ats-professional',
        template_version: '1.0.0',
        resume_data: resumeData
      })
      .select()
      .single();

    if (insertError) {
      console.error('[DEBUG-STAGE-6] Database insert failed:', insertError.message);
      throw insertError;
    }

    console.log('[DEBUG-STAGE-6] Database insert success:', {
      insertedResumeId: resume.id
    });

    // Performance metrics server-side logging
    console.log('[AI-RESUME-IMPORT-METRICS] ----------------------------------------');
    console.log(`[AI-RESUME-IMPORT-METRICS] Upload File: ${file.name}`);
    console.log(`[AI-RESUME-IMPORT-METRICS] Upload Time: ${new Date(uploadStartTime).toISOString()}`);
    console.log(`[AI-RESUME-IMPORT-METRICS] Text Extraction Duration: ${extractionTimeMs}ms`);
    console.log(`[AI-RESUME-IMPORT-METRICS] Gemini API Duration: ${stats.geminiTimeMs}ms`);
    console.log(`[AI-RESUME-IMPORT-METRICS] Total Extractor Duration: ${stats.extractorTimeMs}ms`);
    console.log(`[AI-RESUME-IMPORT-METRICS] Retry Attempts: ${stats.attempts - 1}`);
    console.log(`[AI-RESUME-IMPORT-METRICS] Fallback Parser Triggered: ${stats.fallbackUsed}`);
    console.log('[AI-RESUME-IMPORT-METRICS] ----------------------------------------');

    // Stage 7: Builder redirect
    console.log('[DEBUG-STAGE-7] Returning success response:', {
      redirectUrl: `/builder?resumeId=${resume.id}`,
      resumeId: resume.id
    });

    return NextResponse.json({
      success: true,
      id: resume.id,
      detectedType,
      stats: {
        name: !!resumeData.personalInfo.fullName,
        email: !!resumeData.personalInfo.email,
        educationCount: resumeData.education.length,
        skillsCount: resumeData.skills.length,
        projectsCount: resumeData.projects.length,
        experienceCount: resumeData.experience.length
      }
    });
  } catch (err: any) {
    console.error('[API-IMPORT] Unexpected error caught in outer handler:', err?.message || err);
    return NextResponse.json({ error: 'An unexpected error occurred while processing your resume. Please try again.' }, { status: 500 });
  }
}
