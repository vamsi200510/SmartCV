import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import * as mammoth from 'mammoth';
import * as crypto from 'crypto';
import { extractResume, resemblesResume } from '@/lib/ai/resumeExtractor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Pure JavaScript PDF text extraction using pdfjs-dist legacy build
 * Safe for serverless environments (no native Rust/C++ binary addons)
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const uint8 = new Uint8Array(buffer);
    const doc = await pdfjs.getDocument({
      data: uint8,
      isEvalSupported: false,
      useSystemFonts: true,
      disableFontFace: true,
    }).promise;

    let fullText = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str || '');
      fullText += strings.join(' ') + '\n';
    }
    return fullText.trim();
  } catch (err: any) {
    console.warn('[API-IMPORT] PDF.js extraction warning/error:', err?.message || err);
    // Fallback: scan for standard text streams if pdfjs encounters an unhandled structure
    try {
      const latin1 = buffer.toString('latin1');
      const textMatches = latin1.match(/\(([^()]{2,})\)[\s]*Tj/g) || latin1.match(/\[([^\[\]]+)\][\s]*TJ/g);
      if (textMatches && textMatches.length > 5) {
        return textMatches.map(m => m.replace(/[\(\)\[\]]|Tj|TJ/g, '').trim()).filter(Boolean).join(' ');
      }
    } catch {
      // ignore
    }
    return '';
  }
}

/**
 * DOCX text extraction using mammoth
 */
async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const docxResult = await mammoth.extractRawText({ buffer });
    return docxResult.value || '';
  } catch (docxErr: any) {
    console.error('[API-IMPORT] DOCX extraction error:', docxErr?.message || docxErr);
    return '';
  }
}

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

    let user = null;
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      user = userData?.user || null;
    }

    if (!user) {
      const { data: cookieUserData } = await supabase.auth.getUser();
      user = cookieUserData?.user || null;
    }

    if (!user) {
      console.warn('[API-IMPORT] Unauthorized upload attempt');
      return NextResponse.json({
        success: false,
        code: 'UNAUTHORIZED',
        error: 'Unauthorized. Please sign in to import resumes.'
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        code: 'NO_FILE',
        error: 'No file was uploaded. Please select a PDF or DOCX file.'
      }, { status: 400 });
    }

    console.log('[DEBUG-STAGE-1] Received upload:', {
      filename: file.name,
      mimeType: file.type,
      size: file.size
    });

    // 10MB size limit validation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        code: 'FILE_TOO_LARGE',
        error: 'File exceeds maximum size limit of 10MB.'
      }, { status: 400 });
    }

    const extractionStart = Date.now();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Calculate SHA-256 file hash for caching
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
        let newResume: any = null;
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
    const lowerFilename = file.name.toLowerCase();

    if (lowerFilename.endsWith('.pdf')) {
      rawText = await extractTextFromPdf(buffer);
    } else if (lowerFilename.endsWith('.docx') || lowerFilename.endsWith('.doc')) {
      rawText = await extractTextFromDocx(buffer);
      if (!rawText.trim()) {
        return NextResponse.json({
          success: false,
          code: 'UNREADABLE_DOCX',
          error: 'We could not extract readable text from this DOCX file. Please verify the document format.'
        }, { status: 422 });
      }
    } else {
      return NextResponse.json({
        success: false,
        code: 'UNSUPPORTED_FORMAT',
        error: 'Unsupported file format. Please upload PDF or DOCX only.'
      }, { status: 400 });
    }

    console.log('[DEBUG-STAGE-2] PDF/DOCX text extraction completed. Length:', rawText.length);

    // Call AI Extractor (falls back to local regex extraction if Gemini is unreachable)
    const result = await extractResume(rawText, buffer);
    const { data, stats } = result;

    // Check if extraction produced any valid resume content
    const hasAnyContent = !!(
      data.personal?.fullName ||
      (data.experience && data.experience.length > 0) ||
      (data.education && data.education.length > 0) ||
      (data.skills && Object.keys(data.skills).length > 0) ||
      (data.projects && data.projects.length > 0)
    );

    if (!rawText.trim() && !hasAnyContent) {
      return NextResponse.json({
        success: false,
        code: 'UNREADABLE_FILE',
        error: 'We could not extract readable text from this document. Please make sure the PDF has selectable text or try a DOCX file.'
      }, { status: 422 });
    }

    // Strict non-resume rejection for text documents (and successfully processed scanned files)
    const isDocResume = data.classification?.isResume !== false && (data as any).isResume !== false;
    if (!isDocResume && !resemblesResume(rawText, data)) {
      return NextResponse.json({
        success: false,
        code: 'NOT_A_RESUME',
        error: 'We could not detect resume content in this file. Please make sure you have uploaded a standard resume or CV document.'
      }, { status: 422 });
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
      console.warn('[API-IMPORT] Standard insert with file_hash failed, retrying without file_hash:', insertError.message);
      const { data: retryDoc, error: retryErr } = await supabaseAdmin
        .from('resumes')
        .insert(basePayload)
        .select()
        .single();

      if (retryErr) {
        console.error('[API-IMPORT] Failed to insert resume draft in DB:', retryErr.message);
        return NextResponse.json({
          success: false,
          code: 'DATABASE_ERROR',
          error: `Database save error: ${retryErr.message}`
        }, { status: 500 });
      }
      resumeRecord = retryDoc;
    } else {
      resumeRecord = insertedDoc;
    }

    console.log('[API-IMPORT] Successfully imported resume:', resumeRecord.id);

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
    console.error('[API-IMPORT] Unexpected error caught in import handler:', err?.message || err, err?.stack);
    return NextResponse.json({
      success: false,
      code: 'SERVER_ERROR',
      error: err?.message || 'An unexpected error occurred while processing your resume. Please try another file.'
    }, { status: 500 });
  }
}
