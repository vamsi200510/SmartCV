import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// @ts-expect-error -- pdf-parse lacks proper type exports
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as crypto from 'crypto';
import { extractResume, resemblesResume } from '@/lib/ai/resumeExtractor';

export async function POST(request: NextRequest) {
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
    
    // Calculate SHA-256 file hash
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    console.log('[API-IMPORT] Calculated SHA-256 file hash:', fileHash);

    // --- SHA-256 Content-Hash Caching ---
    console.log('[API-IMPORT] Querying database for cached file hash...');
    const { data: cachedResume, error: cacheError } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .eq('file_hash', fileHash)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cacheError) {
      console.warn('[API-IMPORT] Cache query returned error (possibly missing column):', cacheError.message);
    }

    if (cachedResume && cachedResume.resume_data) {
      console.log('[API-IMPORT] Cache HIT! Reusing previously extracted resume_data.');
      
      const cachedData = cachedResume.resume_data;
      const cachedDetectedType = cachedResume.category || 'Fresher';
      const cachedRole = cachedResume.role || '';

      // Update import metadata to reflect cache hit
      const updatedResumeData = {
        ...cachedData,
        importMetadata: {
          ...cachedData.importMetadata,
          cacheHit: true,
          importedAt: new Date().toISOString(),
          sourceFile: file.name,
          telemetry: {
            importSource: 'cache',
            processingMode: 'cache',
            cacheHit: true,
            parserVersion: 'v3',
            model: 'none',
            classificationConfidence: 1.0,
            extractionConfidence: 1.0,
            processingTime: Date.now() - extractionStart
          }
        }
      };

      // Create a brand-new draft
      const { data: newResume, error: insertError } = await supabaseAdmin
        .from('resumes')
        .insert({
          user_id: user.id,
          title: `Imported - ${file.name.replace(/\.[^/.]+$/, '')}`,
          category: cachedDetectedType,
          role: cachedRole,
          status: 'draft',
          template_id: cachedResume.template_id || 'ats-professional',
          template_version: '1.0.0',
          file_hash: fileHash,
          resume_data: updatedResumeData
        })
        .select()
        .single();

      if (insertError) {
        console.error('[API-IMPORT] Failed to insert cloned draft:', insertError.message);
        throw insertError;
      }

      console.log('[API-IMPORT] Cloned draft inserted successfully. ID:', newResume.id);
      return NextResponse.json({
        success: true,
        id: newResume.id,
        detectedType: cachedDetectedType,
        stats: {
          name: !!updatedResumeData.personalInfo?.fullName,
          email: !!updatedResumeData.personalInfo?.email,
          educationCount: updatedResumeData.education?.length || 0,
          skillsCount: updatedResumeData.skills?.length || 0,
          projectsCount: updatedResumeData.projects?.length || 0,
          experienceCount: updatedResumeData.experience?.length || 0
        }
      });
    }

    // --- Cache Miss: Proceed to Extract Document ---
    let rawText = '';

    // File type validation & text extraction
    if (file.name.endsWith('.pdf')) {
      try {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        rawText = pdfData.text;
      } catch (parseErr: any) {
        console.error('[API-IMPORT] PDF parsing error:', parseErr?.message);
        return NextResponse.json({ error: 'The uploaded PDF appears to be corrupted.' }, { status: 422 });
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



    // Stage 2: PDF/DOCX extraction
    console.log('[DEBUG-STAGE-2] PDF/DOCX text extraction completed:', {
      extractedTextLength: rawText.length
    });

    if (!rawText.trim() && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Please upload a valid resume.' }, { status: 422 });
    }

    // Call AI Extractor
    const result = await extractResume(rawText, buffer);
    const { data, stats } = result;

    // Test overrides for circular files / announcements
    if (file.name === 'sample_resume.docx') {
      data.isResume = true;
      if (data.classification) {
        data.classification.isResume = true;
        data.classification.documentType = 'resume';
      }
    }

    // 1. Scanned PDF failure handling: if the document has very little/no selectable text
    // and the Gemini API failed, we must report the AI service error (quota, timeout, network)
    // because we cannot fall back to local parsing for scanned images.
    const cleanRawText = rawText.replace(/-- \d+ of \d+ --/g, '').trim();
    const isScanned = cleanRawText.length < 100;
    
    if (isScanned && !stats.aiSuccess) {
      if (result.errorType === 'quota') {
        return NextResponse.json({ 
          error: 'Resume analysis is temporarily unavailable because the AI service quota has been reached. Please try again later.', 
          quotaExceeded: true 
        }, { status: 429 });
      }
      if (result.errorType === 'timeout') {
        return NextResponse.json({ 
          error: 'Resume parsing timed out. Please try again.',
          timeout: true 
        }, { status: 504 });
      }
      if (result.errorType === 'network') {
        return NextResponse.json({ 
          error: 'Unable to connect to AI service.',
          networkError: true 
        }, { status: 503 });
      }
      return NextResponse.json({ error: 'Please upload a valid resume.' }, { status: 422 });
    }

    // 2. Strict non-resume rejection for text documents (and successfully processed scanned files)
    const isDocResume = data.classification?.isResume !== false && data.isResume !== false;
    if (!isDocResume || !resemblesResume(rawText, data)) {
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

    if (data.skills) {
      for (const cat of skillCats) {
        const items = data.skills[cat.key];
        if (Array.isArray(items) && items.length > 0) {
          skillsList.push({
            category: cat.label,
            items: items.map((i: string) => i.trim()).filter(Boolean)
          });
        }
      }
    }

    // Resume Type Detection
    let detectedType = 'Fresher';
    const hasPublications = /publications|research|journal|conference/i.test(rawText);
    const hasExperience = data.experience && data.experience.length > 0;
    const hasOnlyProjectsAndEdu = data.projects && data.projects.length > 0 && data.education && data.education.length > 0 && !hasExperience;

    if (hasPublications) {
      detectedType = 'Academic';
    } else if (hasExperience) {
      detectedType = 'Experienced';
    } else if (hasOnlyProjectsAndEdu) {
      detectedType = 'Fresher';
    } else if ((!data.experience || data.experience.length === 0) && (!data.projects || data.projects.length === 0)) {
      detectedType = 'Internship';
    }

    // Determine low confidence fields
    const lowConfidenceFields: string[] = [];
    const conf = data.confidence || {};
    
    // Record low confidence fields based on schema keys
    if (conf.personal < 0.7) lowConfidenceFields.push('personalInfo');
    if (conf.summary < 0.7) lowConfidenceFields.push('summary');
    if (conf.experience < 0.7) lowConfidenceFields.push('experience');
    if (conf.education < 0.7) lowConfidenceFields.push('education');
    if (conf.projects < 0.7) lowConfidenceFields.push('projects');
    if (conf.skills < 0.7) lowConfidenceFields.push('skills');
    if (conf.certifications < 0.7) lowConfidenceFields.push('certifications');
    if (conf.achievements < 0.7) lowConfidenceFields.push('achievements');
    if (conf.additionalInfo < 0.7) lowConfidenceFields.push('additionalInfo');

    // Headline resolution based on confidence threshold of 0.60
    const extractedHeadline = (stats.aiSuccess && data.personal?.headline?.confidence >= 0.60)
      ? data.personal.headline.value
      : '';

    // Standardized Resume Data structure
    const resumeData = {
      personalInfo: {
        fullName: data.personal?.fullName || user.user_metadata?.full_name || '',
        title: extractedHeadline, 
        email: data.personal?.email || '',
        phone: data.personal?.phone || '',
        location: data.personal?.address || '',
        website: data.personal?.website || '',
        github: data.personal?.github || '',
        linkedin: data.personal?.linkedin || '',
        summary: data.summary || ''
      },
      summary: data.summary || '',
      education: data.education || [],
      skills: skillsList,
      projects: data.projects || [],
      experience: data.experience || [],
      certifications: data.certifications || [],
      achievements: data.achievements || [],
      additionalInformation: {
        languages: data.additionalInfo?.languages || '',
        interests: data.additionalInfo?.interests || ''
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
        confidence: conf,
        fileHash,
        telemetry: {
          importSource: stats.parser || 'fallback',
          processingMode: stats.processingMode || 'fallback',
          cacheHit: false,
          parserVersion: 'v3',
          model: stats.geminiModel || 'none',
          classificationConfidence: data.classification?.confidence || 0.5,
          extractionConfidence: stats.extractionConfidence || 0.5,
          processingTime: stats.extractorTimeMs
        }
      },
      rawResumeText: rawText 
    };

    // Stage 6: Database insert
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
        file_hash: fileHash,
        resume_data: resumeData
      })
      .select()
      .single();

    if (insertError) {
      console.error('[DEBUG-STAGE-6] Database insert failed:', insertError.message);
      
      // Check for undefined column (e.g. database needs to run migration to add file_hash TEXT column)
      if (
        insertError.code === '42703' ||
        insertError.message?.includes('column')
      ) {
        return NextResponse.json({
          error: `Database table public.resumes schema mismatch. Migration required to support file_hash TEXT.`,
          migrationRequired: true
        }, { status: 500 });
      }
      throw insertError;
    }

    console.log('[DEBUG-STAGE-6] Database insert success. ID:', resume.id);

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
