import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// @ts-expect-error -- pdf-parse lacks proper type exports
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as crypto from 'crypto';
import { extractResume, resemblesResume } from '@/lib/ai/resumeExtractor';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
      return NextResponse.json({ error: 'Unauthorized. Please sign in to import resumes.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

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

    // --- SHA-256 Content-Hash Caching ---
    try {
      const { data: cachedResume } = await supabaseAdmin
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('file_hash', fileHash)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cachedResume && cachedResume.resume_data) {
        console.log('[API-IMPORT] Cache HIT! Reusing previously extracted resume_data.');
        
        const cachedData = cachedResume.resume_data;
        const cachedDetectedType = cachedResume.category || 'Fresher';
        const cachedRole = cachedResume.role || '';

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
        let newResume = null;
        const insertPayload: any = {
          user_id: user.id,
          title: `Imported - ${file.name.replace(/\.[^/.]+$/, '')}`,
          category: cachedDetectedType,
          role: cachedRole,
          status: 'draft',
          template_id: cachedResume.template_id || 'ats-professional',
          template_version: '1.0.0',
          resume_data: updatedResumeData
        };

        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from('resumes')
          .insert({ ...insertPayload, file_hash: fileHash })
          .select()
          .single();

        if (insertErr) {
          const { data: retryInsert, error: retryErr } = await supabaseAdmin
            .from('resumes')
            .insert(insertPayload)
            .select()
            .single();

          if (retryErr) throw retryErr;
          newResume = retryInsert;
        } else {
          newResume = inserted;
        }

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
    } catch (cacheErr: any) {
      console.warn('[API-IMPORT] Cache lookup bypassed:', cacheErr?.message);
    }

    // --- Extract Document Content ---
    let rawText = '';

    if (file.name.endsWith('.pdf')) {
      try {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        rawText = pdfData?.text || '';
      } catch (parseErr: any) {
        console.warn('[API-IMPORT] PDFParse text extraction warning:', parseErr?.message);
      }
    } else if (file.name.endsWith('.docx')) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        rawText = docxResult.value || '';
      } catch (docxErr: any) {
        console.error('[API-IMPORT] DOCX parsing error:', docxErr?.message);
        return NextResponse.json({ error: 'Please upload a valid DOCX file.' }, { status: 422 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload PDF or DOCX only.' }, { status: 400 });
    }

    console.log('[DEBUG-STAGE-2] PDF/DOCX text extraction completed. Length:', rawText.length);

    // Call AI Extractor (falls back to local regex extraction if Gemini is unreachable)
    const result = await extractResume(rawText, buffer);
    const { data, stats } = result;

    // Strict non-resume rejection for text documents (and successfully processed scanned files)
    const isDocResume = data.classification?.isResume !== false && (data as any).isResume !== false;
    if (!isDocResume && !resemblesResume(rawText, data)) {
      return NextResponse.json({ error: 'Please upload a valid resume or CV document.' }, { status: 422 });
    }

    // Process Skills Categories
    const skillsList: { category: string; items: string[] }[] = [];
    const skillCats = [
      { key: 'languages', label: 'Languages' },
      { key: 'frontend', label: 'Frontend' },
      { key: 'backend', label: 'Backend' },
      { key: 'frameworks', label: 'Frameworks' },
      { key: 'databases', label: 'Databases' },
      { key: 'devops', label: 'DevOps & Cloud' },
      { key: 'tools', label: 'Tools' },
      { key: 'softSkills', label: 'Soft Skills' },
      { key: 'others', label: 'Others' }
    ] as const;

    if (data.skills && typeof data.skills === 'object') {
      if (Array.isArray(data.skills)) {
        for (const sk of data.skills) {
          if (sk.category && Array.isArray(sk.items)) {
            skillsList.push({ category: sk.category, items: sk.items });
          }
        }
      } else {
        for (const cat of skillCats) {
          const items = (data.skills as any)[cat.key];
          if (Array.isArray(items) && items.length > 0) {
            skillsList.push({
              category: cat.label,
              items: items.map((i: string) => i.trim()).filter(Boolean)
            });
          }
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

    const extractedHeadline = (stats.aiSuccess && data.personal?.headline?.confidence && data.personal.headline.confidence >= 0.60)
      ? data.personal.headline.value
      : (data.personal?.headline?.value || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'Software Engineer');

    // Standardized Resume Data structure
    const resumeData = {
      personalInfo: {
        fullName: data.personal?.fullName || user.user_metadata?.full_name || '',
        title: extractedHeadline,
        email: data.personal?.email || user.email || '',
        phone: data.personal?.phone || '',
        location: data.personal?.address || '',
        website: data.personal?.website || '',
        github: data.personal?.github || '',
        linkedin: data.personal?.linkedin || '',
        summary: data.summary || ''
      },
      summary: data.summary || '',
      education: (data.education || []).map((edu: any, i: number) => ({
        id: `edu-${i + 1}`,
        institution: edu.school || edu.institution || '',
        degree: edu.degree || '',
        field: edu.details || edu.field || '',
        startDate: edu.duration?.split('-')[0]?.trim() || '',
        endDate: edu.duration?.split('-')[1]?.trim() || '',
        gpa: '',
        courses: []
      })),
      skills: skillsList.length > 0 ? skillsList : [
        { category: 'Technical Skills', items: ['JavaScript', 'TypeScript', 'React', 'Git'] }
      ],
      projects: (data.projects || []).map((proj: any, i: number) => ({
        id: `proj-${i + 1}`,
        name: proj.name || '',
        description: proj.description || '',
        techStack: Array.isArray(proj.technologies) ? proj.technologies : [],
        url: '',
        github: '',
        bullets: proj.description ? [proj.description] : []
      })),
      experience: (data.experience || []).map((exp: any, i: number) => ({
        id: `exp-${i + 1}`,
        role: exp.role || '',
        company: exp.company || '',
        location: '',
        startDate: exp.duration?.split('-')[0]?.trim() || '',
        endDate: exp.duration?.split('-')[1]?.trim() || '',
        current: (exp.duration || '').toLowerCase().includes('present'),
        bullets: Array.isArray(exp.bullets) ? exp.bullets : []
      })),
      certifications: ((data as any).certifications || []).map((cert: any, i: number) => ({
        id: `cert-${i + 1}`,
        name: cert.name || cert.title || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        url: cert.url || ''
      })),
      achievements: ((data as any).achievements || []).map((ach: any, i: number) => ({
        id: `ach-${i + 1}`,
        title: ach.title || '',
        description: ach.description || ''
      })),
      customization: {
        fontFamily: 'Inter',
        fontSize: 'medium',
        density: 'comfortable',
        primaryColor: '#C2600E',
        sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'],
        visibleSections: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'],
        sectionTypography: {}
      },
      importMetadata: {
        importedAt: new Date().toISOString(),
        sourceFile: file.name,
        detectedType,
        telemetry: {
          importSource: stats.parser || 'upload',
          processingMode: stats.processingMode || 'text',
          cacheHit: false,
          parserVersion: 'v3',
          model: stats.geminiModel || 'none',
          classificationConfidence: data.classification?.confidence || 0.5,
          extractionConfidence: stats.extractionConfidence || 0.5,
          processingTime: stats.extractorTimeMs || (Date.now() - extractionStart)
        }
      },
      rawResumeText: rawText 
    };

    // Insert record into resumes table
    const basePayload = {
      user_id: user.id,
      title: `Imported - ${file.name.replace(/\.[^/.]+$/, '')}`,
      category: detectedType,
      role: resumeData.personalInfo.title,
      status: 'draft',
      template_id: 'ats-professional',
      template_version: '1.0.0',
      resume_data: resumeData
    };

    let resumeRecord: any = null;
    const { data: insertedDoc, error: insertError } = await supabaseAdmin
      .from('resumes')
      .insert({ ...basePayload, file_hash: fileHash })
      .select()
      .single();

    if (insertError) {
      console.warn('[API-IMPORT] Standard insert failed, retrying without file_hash:', insertError.message);
      const { data: retryDoc, error: retryErr } = await supabaseAdmin
        .from('resumes')
        .insert(basePayload)
        .select()
        .single();

      if (retryErr) {
        console.error('[API-IMPORT] Failed to insert resume draft:', retryErr.message);
        return NextResponse.json({ error: `Database error: ${retryErr.message}` }, { status: 500 });
      }
      resumeRecord = retryDoc;
    } else {
      resumeRecord = insertedDoc;
    }

    return NextResponse.json({
      success: true,
      id: resumeRecord.id,
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
    return NextResponse.json({ error: err?.message || 'An unexpected error occurred while processing your resume.' }, { status: 500 });
  }
}
