import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// @ts-ignore
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

// Standardized resume sections partitioning
interface ParsedSections {
  header: string[];
  summary: string[];
  experience: string[];
  education: string[];
  skills: string[];
  projects: string[];
  certifications: string[];
  achievements: string[];
}

function partitionText(text: string): ParsedSections {
  const lines = text.split(/\r?\n/).map(line => line.trim());
  const sections: ParsedSections = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: []
  };

  let currentSection: keyof ParsedSections = 'header';

  const headingPatterns: Array<{ key: keyof ParsedSections; regex: RegExp }> = [
    { key: 'summary', regex: /^(professional\s+)?summary|objective|profile|about\s+me$/i },
    { key: 'experience', regex: /^(work\s+)?experience|employment(\s+history)?|professional\s+experience|work\s+history$/i },
    { key: 'education', regex: /^education|academic(\s+profile|\s+details)?|qualifications$/i },
    { key: 'skills', regex: /^skills|technical\s+skills|core\s+competencies|expertise$/i },
    { key: 'projects', regex: /^projects|key\s+projects|academic\s+projects|personal\s+projects$/i },
    { key: 'certifications', regex: /^certifications|licenses|courses$/i },
    { key: 'achievements', regex: /^achievements|awards|honors|key\s+achievements$/i }
  ];

  for (const line of lines) {
    if (!line) continue;

    let matchedHeading = false;
    if (line.length < 40) {
      for (const pattern of headingPatterns) {
        if (pattern.regex.test(line)) {
          currentSection = pattern.key;
          matchedHeading = true;
          break;
        }
      }
    }

    if (!matchedHeading) {
      sections[currentSection].push(line);
    }
  }

  return sections;
}

export async function POST(request: NextRequest) {
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
    const importAgain = formData.get('importAgain') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 10MB size limit validation
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds maximum size limit of 10MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let rawText = '';

    // File type validation & text extraction
    if (file.name.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      rawText = pdfData.text;
    } else if (file.name.endsWith('.docx')) {
      const docxResult = await mammoth.extractRawText({ buffer });
      rawText = docxResult.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload PDF or DOCX only.' }, { status: 400 });
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'Unable to extract resume data. Please complete fields manually.' }, { status: 422 });
    }

    // Partition and parse raw text
    const sections = partitionText(rawText);

    // Email regex
    const emailMatch = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.exec(rawText);
    const email = emailMatch ? emailMatch[0] : '';

    // Phone regex
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = phoneRegex.exec(rawText);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // URL detections
    const githubMatch = /github\.com\/[a-zA-Z0-9_-]+/i.exec(rawText);
    const github = githubMatch ? githubMatch[0] : '';

    const linkedinMatch = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.exec(rawText);
    const linkedin = linkedinMatch ? linkedinMatch[0] : '';

    // Name Extraction
    let fullName = '';
    for (const line of sections.header) {
      if (!line.includes('@') && !phoneRegex.test(line) && !line.includes('http') && line.length < 50) {
        fullName = line;
        break;
      }
    }
    if (!fullName && user.user_metadata?.full_name) {
      fullName = user.user_metadata.full_name;
    }

    // Location Extraction
    let location = '';
    const locMatch = /location|address|city/i.test(rawText);
    if (locMatch) {
      for (const line of sections.header) {
        if (/location|address|city/i.test(line) || /\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b/.test(line)) {
          location = line.replace(/location|address|city\s*:\s*/i, '').trim();
          break;
        }
      }
    }

    // Summary
    const summaryText = sections.summary.join(' ').trim();

    // Skills
    const skillsList: Array<{ category: string; items: string[] }> = [];
    for (const line of sections.skills) {
      if (line.includes(':')) {
        const parts = line.split(':');
        const cat = parts[0].trim();
        const items = parts[1].split(',').map(item => item.trim()).filter(Boolean);
        if (cat && items.length > 0) {
          skillsList.push({ category: cat, items });
        }
      } else {
        const items = line.split(',').map(item => item.trim()).filter(Boolean);
        if (items.length > 0) {
          skillsList.push({ category: 'Skills', items });
        }
      }
    }

    // Education
    const educationList: any[] = [];
    let currentEdu: any = null;
    for (const line of sections.education) {
      const isSchool = /university|institute|college|school|iit|nit/i.test(line);
      const isDegree = /bachelor|master|b\.tech|m\.s\.|ph\.d\.|b\.s\.|b\.a\.|degree|graduate/i.test(line);
      const dateMatch = /(\d{4}\s*-\s*(\d{4}|present)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4})/i.exec(line);

      if (isSchool || isDegree || dateMatch) {
        if (currentEdu && (isSchool && currentEdu.school || isDegree && currentEdu.degree)) {
          educationList.push(currentEdu);
          currentEdu = null;
        }

        if (!currentEdu) {
          currentEdu = { school: '', degree: '', duration: '', details: '' };
        }

        if (isSchool) currentEdu.school = line;
        else if (isDegree) currentEdu.degree = line;
        
        if (dateMatch) currentEdu.duration = dateMatch[0];
      } else if (currentEdu) {
        currentEdu.details = currentEdu.details ? `${currentEdu.details}; ${line}` : line;
      }
    }
    if (currentEdu) {
      educationList.push(currentEdu);
    }

    // Experience
    const experienceList: any[] = [];
    let currentJob: any = null;
    for (const line of sections.experience) {
      const dateMatch = /(\d{4}\s*-\s*(\d{4}|present)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4})/i.exec(line);
      const isBullet = /^[-•*+]\s+/.test(line);

      if (dateMatch && !isBullet) {
        if (currentJob) experienceList.push(currentJob);
        currentJob = { role: '', company: '', duration: dateMatch[0], bullets: [] };

        const textWithoutDate = line.replace(dateMatch[0], '').trim().replace(/^[,\-–—\s]+|[,\-–—\s]+$/g, '');
        if (textWithoutDate.includes('@') || textWithoutDate.includes(' at ')) {
          const parts = textWithoutDate.split(/@|\bat\b/);
          currentJob.role = parts[0].trim();
          currentJob.company = parts[1].trim();
        } else if (textWithoutDate.includes('-') || textWithoutDate.includes('|')) {
          const parts = textWithoutDate.split(/-|\|/);
          currentJob.role = parts[0].trim();
          currentJob.company = parts[1].trim();
        } else {
          currentJob.role = textWithoutDate;
        }
      } else if (isBullet && currentJob) {
        currentJob.bullets.push(line.replace(/^[-•*+]\s+/, '').trim());
      } else if (currentJob) {
        if (!currentJob.role) currentJob.role = line;
        else if (!currentJob.company) currentJob.company = line;
        else currentJob.bullets.push(line);
      }
    }
    if (currentJob) experienceList.push(currentJob);

    // Projects
    const projectsList: any[] = [];
    let currentProj: any = null;
    for (const line of sections.projects) {
      const isTechLine = /\[(.*?)\]|\b(technologies|tech|stack):\b/i.test(line);
      const isBullet = /^[-•*+]\s+/.test(line);

      if (!isBullet && !isTechLine && line.length < 60 && !currentProj) {
        currentProj = { name: line, technologies: [], description: '' };
      } else if (isTechLine && currentProj) {
        const techMatch = /\[(.*?)\]/.exec(line);
        if (techMatch) {
          currentProj.technologies = techMatch[1].split(',').map(t => t.trim()).filter(Boolean);
        } else {
          const cleanLine = line.replace(/\b(technologies|tech|stack):\b/i, '').trim();
          currentProj.technologies = cleanLine.split(',').map(t => t.trim()).filter(Boolean);
        }
      } else if (currentProj) {
        currentProj.description = currentProj.description ? `${currentProj.description} ${line}` : line;
      }

      if (currentProj && currentProj.description.length > 250) {
        projectsList.push(currentProj);
        currentProj = null;
      }
    }
    if (currentProj) projectsList.push(currentProj);

    // Certifications
    const certificationsList: any[] = [];
    for (const line of sections.certifications) {
      const dateMatch = /\b((19|20)\d{2})\b|((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*\d{4})/i.exec(line);
      const parts = line.split(/—|-|\|/);
      certificationsList.push({
        name: parts[0]?.trim() || line,
        issuer: parts[1]?.trim() || 'Certified',
        date: dateMatch ? dateMatch[0] : '2026'
      });
    }

    // Achievements
    const achievementsList: any[] = [];
    for (const line of sections.achievements) {
      const parts = line.split(/—|-|\|/);
      achievementsList.push({
        title: parts[0]?.trim() || 'Key Achievement',
        description: parts[1]?.trim() || line
      });
    }

    // Duplicate Check
    if (!importAgain) {
      const { data: existingResumes } = await supabaseAdmin
        .from('resumes')
        .select('id, title, resume_data')
        .eq('user_id', user.id);

      if (existingResumes) {
        const isDuplicate = existingResumes.some(r => {
          const metadata = r.resume_data?.importMetadata || {};
          const pi = r.resume_data?.personalInfo || {};
          const isSameFile = metadata.sourceFile === file.name;
          const isSameCandidate = pi.email === email && pi.fullName === fullName;
          return isSameFile || (email && fullName && isSameCandidate);
        });

        if (isDuplicate) {
          return NextResponse.json({
            duplicateDetected: true,
            sourceFile: file.name,
            email,
            fullName
          });
        }
      }
    }

    // Resume Type Detection
    let detectedType = 'Internship';
    const hasPublications = /publications|research|journal|conference/i.test(rawText);
    const hasExperience = experienceList.length > 0;
    const hasOnlyProjectsAndEdu = projectsList.length > 0 && educationList.length > 0 && !hasExperience;

    if (hasPublications) {
      detectedType = 'Academic';
    } else if (hasExperience) {
      detectedType = 'Experienced';
    } else if (hasOnlyProjectsAndEdu) {
      detectedType = 'Fresher';
    }

    // Confidence / Missing fields warnings
    const lowConfidenceFields: string[] = [];
    if (!fullName || fullName.length < 3) lowConfidenceFields.push('fullName');
    if (!email) lowConfidenceFields.push('email');
    if (!phone) lowConfidenceFields.push('phone');
    if (skillsList.length === 0) lowConfidenceFields.push('skills');
    if (educationList.length === 0) lowConfidenceFields.push('education');
    if (experienceList.length === 0) lowConfidenceFields.push('experience');

    // Standardized Resume Data structure
    const resumeData = {
      personalInfo: {
        fullName: fullName || user.user_metadata?.full_name || '',
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'Candidate Profile',
        email,
        phone,
        location,
        website: '',
        github,
        linkedin,
        summary: summaryText
      },
      summary: summaryText,
      education: educationList,
      skills: skillsList,
      projects: projectsList,
      experience: experienceList,
      certifications: certificationsList,
      achievements: achievementsList,
      additionalInformation: {
        languages: '',
        interests: ''
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
        detectedType
      }
    };

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
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      id: resume.id,
      detectedType,
      stats: {
        name: !!fullName,
        email: !!email,
        educationCount: educationList.length,
        skillsCount: skillsList.length,
        projectsCount: projectsList.length,
        experienceCount: experienceList.length
      }
    });
  } catch (err: any) {
    console.error('[IMPORT-RESUME] Server error:', err);
    return NextResponse.json({ error: 'Unable to extract resume data. Please complete fields manually.' }, { status: 500 });
  }
}
