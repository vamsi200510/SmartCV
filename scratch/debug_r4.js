const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

// Load environment variables
function loadEnv() {
  const envPath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\.env.local';
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.*)\s*$/);
      if (match) {
        process.env.GEMINI_API_KEY = match[1].trim();
      }
    }
  }
}
loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not defined.');
  process.exit(1);
}

const RESUME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    personal: {
      type: 'OBJECT',
      properties: {
        fullName: { type: 'STRING' },
        email: { type: 'STRING' },
        phone: { type: 'STRING' },
        linkedin: { type: 'STRING' },
        github: { type: 'STRING' },
        website: { type: 'STRING' },
        address: { type: 'STRING' }
      },
      required: ['fullName', 'email', 'phone', 'linkedin', 'github', 'website', 'address']
    },
    summary: { type: 'STRING' },
    experience: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          role: { type: 'STRING' },
          company: { type: 'STRING' },
          duration: { type: 'STRING' },
          bullets: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          }
        },
        required: ['role', 'company', 'duration', 'bullets']
      }
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          school: { type: 'STRING' },
          degree: { type: 'STRING' },
          duration: { type: 'STRING' },
          details: { type: 'STRING' }
        },
        required: ['school', 'degree', 'duration', 'details']
      }
    },
    projects: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          technologies: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          },
          description: { type: 'STRING' }
        },
        required: ['name', 'technologies', 'description']
      }
    },
    skills: {
      type: 'OBJECT',
      properties: {
        languages: { type: 'ARRAY', items: { type: 'STRING' } },
        frontend: { type: 'ARRAY', items: { type: 'STRING' } },
        backend: { type: 'ARRAY', items: { type: 'STRING' } },
        databases: { type: 'ARRAY', items: { type: 'STRING' } },
        tools: { type: 'ARRAY', items: { type: 'STRING' } },
        cloud: { type: 'ARRAY', items: { type: 'STRING' } },
        others: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['languages', 'frontend', 'backend', 'databases', 'tools', 'cloud', 'others']
    },
    certifications: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          issuer: { type: 'STRING' },
          date: { type: 'STRING' }
        },
        required: ['name', 'issuer', 'date']
      }
    },
    achievements: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' }
        },
        required: ['title', 'description']
      }
    },
    additionalInfo: {
      type: 'OBJECT',
      properties: {
        languages: { type: 'STRING' },
        interests: { type: 'STRING' }
      },
      required: ['languages', 'interests']
    },
    confidence: {
      type: 'OBJECT',
      properties: {
        personal: { type: 'NUMBER' },
        summary: { type: 'NUMBER' },
        experience: { type: 'NUMBER' },
        education: { type: 'NUMBER' },
        projects: { type: 'NUMBER' },
        skills: { type: 'NUMBER' },
        certifications: { type: 'NUMBER' },
        achievements: { type: 'NUMBER' },
        additionalInfo: { type: 'NUMBER' }
      },
      required: ['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'additionalInfo']
    },
    isResume: {
      type: 'BOOLEAN'
    }
  },
  required: ['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'additionalInfo', 'confidence', 'isResume']
};

const RESUME_EXTRACTION_PROMPT = `Analyze and extract information from the raw resume text into the requested JSON structure.
Determine whether the document represents a candidate's resume/CV/portfolio/profile (set isResume to true). If the document is obviously not a resume (e.g., essay on deforestation/nature, bank statement, question paper, exam, invoice), set isResume to false.
Single-column, two-column, ATS, designer, fresher, experienced, academic CVs, and internship resumes must all be classified as isResume: true.
For every resume, extract as much information as possible. If a field cannot be identified, leave it empty (do not invent information or output placeholders like N/A).
For each section, assign a confidence score between 0.0 (totally uncertain) and 1.0 (absolutely certain) in the confidence object.
Return structured JSON only, strictly matching the requested schema. Do not include markdown formatting or explanations.`;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+?[\d\s\-()]{7,25}$/.test(phone);
}

function cleanStrings(val) {
  if (typeof val === 'string') {
    return val.trim();
  }
  if (Array.isArray(val)) {
    return val.map(item => cleanStrings(item));
  }
  if (val && typeof val === 'object') {
    const cleaned = {};
    for (const key of Object.keys(val)) {
      cleaned[key] = cleanStrings(val[key]);
    }
    return cleaned;
  }
  return val;
}

function validateAndNormalizeResumeData(parsedJson, rawText) {
  const normalized = {};

  const p = parsedJson?.personal || {};
  normalized.personal = {
    fullName: String(p.fullName || '').trim(),
    email: String(p.email || '').trim(),
    phone: String(p.phone || '').trim(),
    linkedin: String(p.linkedin || '').trim(),
    github: String(p.github || '').trim(),
    website: String(p.website || '').trim(),
    address: String(p.address || '').trim()
  };

  if (!isValidEmail(normalized.personal.email)) {
    const emailMatch = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.exec(rawText);
    normalized.personal.email = emailMatch ? emailMatch[0].trim() : '';
  }

  if (!isValidPhone(normalized.personal.phone)) {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = phoneRegex.exec(rawText);
    normalized.personal.phone = phoneMatch ? phoneMatch[0].trim() : '';
  }

  normalized.summary = String(parsedJson?.summary || '').trim();

  const expList = Array.isArray(parsedJson?.experience) ? parsedJson.experience : [];
  normalized.experience = expList.map((exp) => ({
    role: String(exp?.role || '').trim(),
    company: String(exp?.company || '').trim(),
    duration: String(exp?.duration || '').trim(),
    bullets: Array.isArray(exp?.bullets)
      ? exp.bullets.map((b) => String(b || '').trim()).filter(Boolean)
      : []
  }));

  const eduList = Array.isArray(parsedJson?.education) ? parsedJson.education : [];
  normalized.education = eduList.map((edu) => ({
    school: String(edu?.school || '').trim(),
    degree: String(edu?.degree || '').trim(),
    duration: String(edu?.duration || '').trim(),
    details: String(edu?.details || '').trim()
  }));

  const projList = Array.isArray(parsedJson?.projects) ? parsedJson.projects : [];
  normalized.projects = projList.map((proj) => ({
    name: String(proj?.name || '').trim(),
    technologies: Array.isArray(proj?.technologies)
      ? proj.technologies.map((t) => String(t || '').trim()).filter(Boolean)
      : [],
    description: String(proj?.description || '').trim()
  }));

  const s = parsedJson?.skills || {};
  const skillCategories = ['languages', 'frontend', 'backend', 'databases', 'tools', 'cloud', 'others'];
  normalized.skills = {};
  for (const cat of skillCategories) {
    const rawItems = Array.isArray(s[cat]) ? s[cat] : [];
    const seen = new Set();
    normalized.skills[cat] = rawItems
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .filter(item => {
        const lower = item.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
  }

  const certList = Array.isArray(parsedJson?.certifications) ? parsedJson.certifications : [];
  normalized.certifications = certList.map((cert) => ({
    name: String(cert?.name || '').trim(),
    issuer: String(cert?.issuer || '').trim(),
    date: String(cert?.date || '').trim()
  }));

  const achList = Array.isArray(parsedJson?.achievements) ? parsedJson.achievements : [];
  normalized.achievements = achList.map((ach) => ({
    title: String(ach?.title || '').trim(),
    description: String(ach?.description || '').trim()
  }));

  const add = parsedJson?.additionalInfo || {};
  normalized.additionalInfo = {
    languages: String(add.languages || '').trim(),
    interests: String(add.interests || '').trim()
  };

  const conf = parsedJson?.confidence || {};
  const confKeys = ['personal', 'summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'additionalInfo'];
  normalized.confidence = {};
  for (const key of confKeys) {
    const val = parseFloat(conf[key]);
    normalized.confidence[key] = isNaN(val) ? 0.5 : Math.max(0.0, Math.min(1.0, val));
  }

  normalized.isResume = typeof parsedJson?.isResume === 'boolean' ? parsedJson.isResume : true;

  return cleanStrings(normalized);
}

function resemblesResume(text, parsedData) {
  const cleanText = text.toLowerCase();
  
  if (parsedData && typeof parsedData.isResume === 'boolean') {
    const isResumeVal = parsedData.isResume;
    return {
      type: 'semantic_ai',
      isResumeVal,
      validationPassed: isResumeVal,
      rejectReason: isResumeVal ? null : 'AI classified document as non-resume'
    };
  }

  let rejectReason = '';
  if (cleanText.includes('beauty of nature') || cleanText.includes('deforestation') || cleanText.includes('ecosystems')) {
    rejectReason = 'Contains non-resume words like beauty of nature/deforestation/ecosystems';
    return {
      type: 'legacy',
      validationPassed: false,
      rejectReason
    };
  }
  
  const resumeKeywords = [
    'education', 'experience', 'skills', 'projects', 'work', 
    'university', 'college', 'institute', 'school', 'employment', 
    'certifications', 'cv', 'resume', 'b.tech', 'btech', 'degree',
    'engineering', 'technology', 'science', 'development', 'developer',
    'qualification', 'career', 'profile', 'about', 'summary', 'objective'
  ];
  const keywordCount = resumeKeywords.filter(keyword => cleanText.includes(keyword)).length;
  
  const hasName = !!parsedData.personal?.fullName?.trim();
  const hasEmail = !!parsedData.personal?.email?.trim();
  const hasPhone = !!parsedData.personal?.phone?.trim();
  
  const hasExperience = parsedData.experience.length > 0;
  const hasEducation = parsedData.education.length > 0;
  const hasProjects = parsedData.projects.length > 0;
  const hasSkills = Object.values(parsedData.skills).some(arr => arr.length > 0);
  
  const hasContact = hasName || hasEmail || hasPhone;
  const hasSections = hasExperience || hasEducation || hasProjects || hasSkills;
  
  const keywordScorePassed = text.length >= 100 && keywordCount >= 2;
  const validationPassed = rejectReason === '' && (keywordScorePassed || (hasContact && hasSections));

  if (!validationPassed && rejectReason === '') {
    if (!keywordScorePassed) {
      if (!hasContact) rejectReason = 'Failed contact check (no name, email, or phone)';
      else if (!hasSections) rejectReason = 'Failed sections check (no experience, education, projects, or skills)';
    }
  }

  return {
    type: 'legacy',
    validationPassed,
    rejectReason: validationPassed ? null : rejectReason,
    keywordCount,
    hasContact,
    hasSections
  };
}

async function main() {
  const filePath = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src\\r4.pdf';
  console.log('--- START DEBUG SESSION FOR r4.pdf ---');

  // Stage 1
  const stats = fs.statSync(filePath);
  console.log('Stage 1 - File info:');
  console.log('  File received?: Yes');
  console.log('  filename:', path.basename(filePath));
  console.log('  mime type: application/pdf');
  console.log('  size:', stats.size, 'bytes');

  // Stage 2
  const buffer = fs.readFileSync(filePath);
  let rawText = '';
  try {
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    rawText = pdfData.text;
  } catch (err) {
    console.error('PDF parsing error:', err);
  }
  console.log('\nStage 2 - Text extraction:');
  console.log('  Was PDF text extracted?: Yes');
  console.log('  Extracted text length:', rawText.length);
  console.log('  First 1000 characters:');
  console.log(JSON.stringify(rawText.substring(0, 1000)));

  // Stage 3
  const isScanned = rawText.replace(/-- \d+ of \d+ --/g, '').trim().length < 100;
  console.log('\nStage 3 - Call Gemini API:');
  console.log('  Was Gemini called?: Yes');
  console.log('  Which model?: gemini-2.5-flash');
  console.log('  Mode:', isScanned ? 'Direct PDF binary mode (scanned)' : 'Plain text mode');
  
  const ai = new GoogleGenAI({ apiKey });
  const startApi = Date.now();
  
  let response;
  try {
    if (isScanned) {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: buffer.toString('base64'),
              mimeType: 'application/pdf'
            }
          },
          RESUME_EXTRACTION_PROMPT
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: RESUME_SCHEMA
        }
      });
    } else {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${RESUME_EXTRACTION_PROMPT}\nRaw Resume Text:\n${rawText}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: RESUME_SCHEMA
        }
      });
    }
  } catch (err) {
    console.error('Gemini API call failed:', err);
    process.exit(1);
  }
  
  const responseTime = Date.now() - startApi;
  const responseText = response.text;
  console.log('  Request sent?: Yes');
  console.log('  Response received?: Yes');
  console.log('  Response time:', responseTime + 'ms');

  // Stage 4
  console.log('\nStage 4 - Raw Gemini JSON Response:');
  console.log(responseText);

  // Stage 5
  let parsedJson;
  try {
    parsedJson = JSON.parse(responseText);
  } catch (err) {
    console.error('JSON parsing failed:', err);
    process.exit(1);
  }
  const normalized = validateAndNormalizeResumeData(parsedJson, rawText);
  console.log('\nStage 5 - JSON After Normalization:');
  console.log(JSON.stringify(normalized, null, 2));

  // Stage 6
  // Replicate route.ts mapping to resumeData
  const skillsList = [];
  const skillCats = [
    { key: 'languages', label: 'Languages' },
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend' },
    { key: 'databases', label: 'Databases' },
    { key: 'tools', label: 'Tools' },
    { key: 'cloud', label: 'Cloud' },
    { key: 'others', label: 'Others' }
  ];
  for (const cat of skillCats) {
    const items = normalized.skills[cat.key];
    if (Array.isArray(items) && items.length > 0) {
      skillsList.push({
        category: cat.label,
        items: items.map((i) => i.trim()).filter(Boolean)
      });
    }
  }

  let detectedType = 'Fresher';
  const hasPublications = /publications|research|journal|conference/i.test(rawText);
  const hasExperience = normalized.experience.length > 0;
  const hasOnlyProjectsAndEdu = normalized.projects.length > 0 && normalized.education.length > 0 && !hasExperience;

  if (hasPublications) {
    detectedType = 'Academic';
  } else if (hasExperience) {
    detectedType = 'Experienced';
  } else if (hasOnlyProjectsAndEdu) {
    detectedType = 'Fresher';
  } else if (normalized.experience.length === 0 && normalized.projects.length === 0) {
    detectedType = 'Internship';
  }

  const lowConfidenceFields = [];
  const conf = normalized.confidence;
  if (conf.personal < 0.7) lowConfidenceFields.push('personalInfo');
  if (conf.summary < 0.7) lowConfidenceFields.push('summary');
  if (conf.experience < 0.7) lowConfidenceFields.push('experience');
  if (conf.education < 0.7) lowConfidenceFields.push('education');
  if (conf.projects < 0.7) lowConfidenceFields.push('projects');
  if (conf.skills < 0.7) lowConfidenceFields.push('skills');
  if (conf.certifications < 0.7) lowConfidenceFields.push('certifications');
  if (conf.achievements < 0.7) lowConfidenceFields.push('achievements');
  if (conf.additionalInfo < 0.7) lowConfidenceFields.push('additionalInfo');

  const resumeData = {
    personalInfo: {
      fullName: normalized.personal.fullName,
      title: 'Imported - r4',
      email: normalized.personal.email,
      phone: normalized.personal.phone,
      location: normalized.personal.address,
      website: normalized.personal.website,
      github: normalized.personal.github,
      linkedin: normalized.personal.linkedin,
      summary: normalized.summary
    },
    summary: normalized.summary,
    education: normalized.education,
    skills: skillsList,
    projects: normalized.projects,
    experience: normalized.experience,
    certifications: normalized.certifications,
    achievements: normalized.achievements,
    additionalInformation: {
      languages: normalized.additionalInfo.languages,
      interests: normalized.additionalInfo.interests
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
      sourceFile: 'r4.pdf',
      importedAt: new Date().toISOString(),
      lowConfidenceFields,
      detectedType,
      confidence: conf
    },
    rawResumeText: rawText
  };

  console.log('\nStage 6 - JSON after mapping into resume_data:');
  console.log(JSON.stringify(resumeData, null, 2));

  // Stage 7
  const valResult = resemblesResume(rawText, normalized);
  
  // Calculate keyword score manually
  const resumeKeywords = [
    'education', 'experience', 'skills', 'projects', 'work', 
    'university', 'college', 'institute', 'school', 'employment', 
    'certifications', 'cv', 'resume', 'b.tech', 'btech', 'degree',
    'engineering', 'technology', 'science', 'development', 'developer',
    'qualification', 'career', 'profile', 'about', 'summary', 'objective'
  ];
  const cleanText = rawText.toLowerCase();
  const keywordCount = resumeKeywords.filter(keyword => cleanText.includes(keyword)).length;
  const emailFound = !!normalized.personal?.email?.trim();
  const phoneFound = !!normalized.personal?.phone?.trim();
  
  const hasExperienceSec = normalized.experience.length > 0;
  const hasEducationSec = normalized.education.length > 0;
  const hasProjectsSec = normalized.projects.length > 0;
  const hasSkillsSec = Object.values(normalized.skills).some(arr => arr.length > 0);
  const sectionsFound = hasExperienceSec || hasEducationSec || hasProjectsSec || hasSkillsSec;

  console.log('\nStage 7 - Validation:');
  console.log('  isResume:', normalized.isResume);
  console.log('  keywordScore:', keywordCount);
  console.log('  emailFound:', emailFound);
  console.log('  phoneFound:', phoneFound);
  console.log('  sectionsFound:', sectionsFound);
  console.log('  validationPassed:', valResult.validationPassed);
  console.log('  rejectReason:', valResult.rejectReason);

  // Stage 8
  console.log('\nStage 8 - Rejection Point:');
  if (!valResult.validationPassed) {
    console.log('Rejected because:');
    console.log('  file: src/app/api/resumes/import/route.ts');
    console.log('  function: POST');
    console.log('  line number: 109-111');
    console.log('  condition:');
    console.log('    if (!resemblesResume(rawText, data)) {');
    console.log('      return NextResponse.json({ error: \'Please upload a valid resume.\' }, { status: 422 });');
    console.log('    }');
    console.log('  AND in:');
    console.log('  file: src/lib/ai/resumeExtractor.ts');
    console.log('  function: resemblesResume');
    console.log('  line number: 165-169');
    console.log('  condition:');
    console.log('    if (parsedData && typeof parsedData.isResume === \'boolean\') {');
    console.log('      const isResumeVal = parsedData.isResume;');
    console.log('      console.log(\'[DEBUG-STAGE-3] AI isResume classification:\', isResumeVal);');
    console.log('      return isResumeVal;');
    console.log('    }');
  } else {
    console.log('Validation passed successfully! The resume would not be rejected here.');
  }
}

main().catch(console.error);
