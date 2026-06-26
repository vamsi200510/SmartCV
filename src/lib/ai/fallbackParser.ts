export interface LegacyParsedData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
    address: string;
  };
  summary: string;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    duration: string;
    details: string;
  }>;
  projects: Array<{
    name: string;
    technologies: string[];
    description: string;
  }>;
  skills: {
    languages: string[];
    frontend: string[];
    backend: string[];
    databases: string[];
    tools: string[];
    cloud: string[];
    others: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
  }>;
  additionalInfo: {
    languages: string;
    interests: string;
  };
  confidence: {
    personal: number;
    summary: number;
    experience: number;
    education: number;
    projects: number;
    skills: number;
    certifications: number;
    achievements: number;
    additionalInfo: number;
  };
  isResume?: boolean;
}

export function parseWithLegacyRegex(rawText: string): LegacyParsedData {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);
  
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

  // Location Extraction
  let location = '';
  for (const line of sections.header) {
    if (/location|address|city/i.test(line) || /\b[A-Z][a-z]+,\s*[A-Z][a-z]+\b/.test(line)) {
      location = line.replace(/location|address|city\s*:\s*/i, '').trim();
      break;
    }
  }

  // Summary
  const summaryText = sections.summary.join(' ').trim();

  // Skills
  const skillsLanguages: string[] = [];
  const skillsFrontend: string[] = [];
  const skillsBackend: string[] = [];
  const skillsDatabases: string[] = [];
  const skillsTools: string[] = [];
  const skillsCloud: string[] = [];
  const skillsOthers: string[] = [];

  for (const line of sections.skills) {
    let items: string[] = [];
    let cat = 'others';
    if (line.includes(':')) {
      const parts = line.split(':');
      const catLabel = parts[0].toLowerCase();
      items = parts[1].split(',').map(item => item.trim()).filter(Boolean);
      if (catLabel.includes('lang')) cat = 'languages';
      else if (catLabel.includes('front')) cat = 'frontend';
      else if (catLabel.includes('back')) cat = 'backend';
      else if (catLabel.includes('data')) cat = 'databases';
      else if (catLabel.includes('tool')) cat = 'tools';
      else if (catLabel.includes('cloud')) cat = 'cloud';
    } else {
      items = line.split(',').map(item => item.trim()).filter(Boolean);
    }

    if (cat === 'languages') skillsLanguages.push(...items);
    else if (cat === 'frontend') skillsFrontend.push(...items);
    else if (cat === 'backend') skillsBackend.push(...items);
    else if (cat === 'databases') skillsDatabases.push(...items);
    else if (cat === 'tools') skillsTools.push(...items);
    else if (cat === 'cloud') skillsCloud.push(...items);
    else skillsOthers.push(...items);
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
        currentProj.technologies = techMatch[1].split(',').map((t: any) => t.trim()).filter(Boolean);
      } else {
        const cleanLine = line.replace(/\b(technologies|tech|stack):\b/i, '').trim();
        currentProj.technologies = cleanLine.split(',').map((t: any) => t.trim()).filter(Boolean);
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
      date: dateMatch ? dateMatch[0] : ''
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

  return {
    personal: {
      fullName,
      email,
      phone,
      linkedin,
      github,
      website: '',
      address: location
    },
    summary: summaryText,
    experience: experienceList,
    education: educationList,
    projects: projectsList,
    skills: {
      languages: skillsLanguages,
      frontend: skillsFrontend,
      backend: skillsBackend,
      databases: skillsDatabases,
      tools: skillsTools,
      cloud: skillsCloud,
      others: skillsOthers
    },
    certifications: certificationsList,
    achievements: achievementsList,
    additionalInfo: {
      languages: '',
      interests: ''
    },
    confidence: {
      personal: 0.5,
      summary: 0.5,
      experience: 0.5,
      education: 0.5,
      projects: 0.5,
      skills: 0.5,
      certifications: 0.5,
      achievements: 0.5,
      additionalInfo: 0.5
    }
  };
}
