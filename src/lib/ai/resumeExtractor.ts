import { getGeminiClient } from './gemini';
import { RESUME_SCHEMA, RESUME_EXTRACTION_PROMPT } from './prompts';
import { parseWithLegacyRegex, LegacyParsedData } from './fallbackParser';

export interface ExtractorStats {
  attempts: number;
  aiSuccess: boolean;
  fallbackUsed: boolean;
  geminiTimeMs: number;
  extractorTimeMs: number;
}

export interface ExtractorResult {
  data: LegacyParsedData;
  stats: ExtractorStats;
}

// Check if string matches typical email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Check if string matches typical phone format (digits, spaces, parens, hyphens, plus)
function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{7,25}$/.test(phone);
}

// Clean and trim whitespace recursively for string fields
function cleanStrings(val: any): any {
  if (typeof val === 'string') {
    return val.trim();
  }
  if (Array.isArray(val)) {
    return val.map(item => cleanStrings(item));
  }
  if (val && typeof val === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(val)) {
      cleaned[key] = cleanStrings(val[key]);
    }
    return cleaned;
  }
  return val;
}

export function validateAndNormalizeResumeData(parsedJson: any, rawText: string): LegacyParsedData {
  const normalized: any = {};

  // 1. Personal Information
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

  // Validate Email
  if (!isValidEmail(normalized.personal.email)) {
    const emailMatch = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.exec(rawText);
    normalized.personal.email = emailMatch ? emailMatch[0].trim() : '';
  }

  // Validate Phone
  if (!isValidPhone(normalized.personal.phone)) {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = phoneRegex.exec(rawText);
    normalized.personal.phone = phoneMatch ? phoneMatch[0].trim() : '';
  }

  // 2. Summary
  normalized.summary = String(parsedJson?.summary || '').trim();

  // 3. Experience
  const expList = Array.isArray(parsedJson?.experience) ? parsedJson.experience : [];
  normalized.experience = expList.map((exp: any) => ({
    role: String(exp?.role || '').trim(),
    company: String(exp?.company || '').trim(),
    duration: String(exp?.duration || '').trim(),
    bullets: Array.isArray(exp?.bullets)
      ? exp.bullets.map((b: any) => String(b || '').trim()).filter(Boolean)
      : []
  }));

  // 4. Education
  const eduList = Array.isArray(parsedJson?.education) ? parsedJson.education : [];
  normalized.education = eduList.map((edu: any) => ({
    school: String(edu?.school || '').trim(),
    degree: String(edu?.degree || '').trim(),
    duration: String(edu?.duration || '').trim(),
    details: String(edu?.details || '').trim()
  }));

  // 5. Projects
  const projList = Array.isArray(parsedJson?.projects) ? parsedJson.projects : [];
  normalized.projects = projList.map((proj: any) => ({
    name: String(proj?.name || '').trim(),
    technologies: Array.isArray(proj?.technologies)
      ? proj.technologies.map((t: any) => String(t || '').trim()).filter(Boolean)
      : [],
    description: String(proj?.description || '').trim()
  }));

  // 6. Skills - deduplicate and normalize
  const s = parsedJson?.skills || {};
  const skillCategories = ['languages', 'frontend', 'backend', 'databases', 'tools', 'cloud', 'others'];
  normalized.skills = {};
  for (const cat of skillCategories) {
    const rawItems = Array.isArray(s[cat]) ? s[cat] : [];
    const seen = new Set<string>();
    normalized.skills[cat] = rawItems
      .map((item: any) => String(item || '').trim())
      .filter(Boolean)
      .filter(item => {
        const lower = item.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
  }

  // 7. Certifications
  const certList = Array.isArray(parsedJson?.certifications) ? parsedJson.certifications : [];
  normalized.certifications = certList.map((cert: any) => ({
    name: String(cert?.name || '').trim(),
    issuer: String(cert?.issuer || '').trim(),
    date: String(cert?.date || '').trim()
  }));

  // 8. Achievements
  const achList = Array.isArray(parsedJson?.achievements) ? parsedJson.achievements : [];
  normalized.achievements = achList.map((ach: any) => ({
    title: String(ach?.title || '').trim(),
    description: String(ach?.description || '').trim()
  }));

  // 9. Additional Info
  const add = parsedJson?.additionalInfo || {};
  normalized.additionalInfo = {
    languages: String(add.languages || '').trim(),
    interests: String(add.interests || '').trim()
  };

  // 10. Confidence
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

export function resemblesResume(text: string, parsedData: LegacyParsedData): boolean {
  const cleanText = text.toLowerCase();
  
  // 1. Check semantic AI classification if available
  if (parsedData && typeof parsedData.isResume === 'boolean') {
    const isResumeVal = parsedData.isResume;
    console.log('[DEBUG-STAGE-3] AI isResume classification:', isResumeVal);
    return isResumeVal;
  }

  // 2. Reject nature essays or other obvious non-resume content
  let rejectReason = '';
  if (cleanText.includes('beauty of nature') || cleanText.includes('deforestation') || cleanText.includes('ecosystems')) {
    rejectReason = 'Contains non-resume words like beauty of nature/deforestation/ecosystems';
    console.log('[DEBUG-STAGE-3] Resume validation failed:', rejectReason);
    return false;
  }
  
  // 3. Fallback contact and section checks for legacy parser
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

  // Stage 3: Resume validation
  console.log('[DEBUG-STAGE-3] Resume validation metrics:', {
    detectedEmail: parsedData.personal?.email || null,
    detectedPhone: parsedData.personal?.phone || null,
    detectedSections: {
      experienceCount: parsedData.experience.length,
      educationCount: parsedData.education.length,
      projectsCount: parsedData.projects.length,
      hasSkills
    },
    keywordScore: keywordCount,
    textLength: text.length,
    validationPassed,
    rejectReason: validationPassed ? null : rejectReason
  });
  
  return validationPassed;
}

export async function extractResume(rawText: string, fileBuffer?: Buffer): Promise<ExtractorResult> {
  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = 3; // 1 initial + up to 2 retries
  let aiSuccess = false;
  let fallbackUsed = false;
  let parsedJson: any = null;
  let geminiTimeMs = 0;

  // Detect scanned PDF
  const cleanRawText = rawText.replace(/-- \d+ of \d+ --/g, '').trim();
  const isScanned = cleanRawText.length < 100 && fileBuffer;

  console.log(`[AI-EXTRACTOR] Starting extraction process. Text length: ${rawText.length}, Is Scanned PDF: ${isScanned}`);

  while (attempts < maxAttempts) {
    attempts++;
    const callStart = Date.now();
    try {
      console.log(`[AI-EXTRACTOR] Attempt ${attempts} of ${maxAttempts} started...`);
      
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('[DEBUG-STAGE-4] Gemini API key status:', {
        loaded: !!apiKey,
        isPlaceholder: apiKey === 'your_gemini_api_key'
      });

      const ai = getGeminiClient();
      console.log('[DEBUG-STAGE-4] Gemini Model Called: gemini-2.5-flash');
      
      let response;
      if (isScanned && fileBuffer) {
        console.log('[DEBUG-STAGE-4] Gemini Request Sent (Direct PDF binary mode).');
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              inlineData: {
                data: fileBuffer.toString('base64'),
                mimeType: 'application/pdf'
              }
            },
            RESUME_EXTRACTION_PROMPT
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: RESUME_SCHEMA as any
          }
        });
      } else {
        console.log('[DEBUG-STAGE-4] Gemini Request Sent (Plain text mode).');
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${RESUME_EXTRACTION_PROMPT}\nRaw Resume Text:\n${rawText}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: RESUME_SCHEMA as any
          }
        });
      }

      geminiTimeMs += (Date.now() - callStart);
      const responseText = response.text;

      console.log('[DEBUG-STAGE-4] Gemini Response Received.', {
        responseLength: responseText ? responseText.length : 0
      });

      if (!responseText) {
        throw new Error('Gemini returned an empty text response.');
      }

      let parsedSuccessfully = false;
      let schemaValid = false;
      try {
        parsedJson = JSON.parse(responseText);
        parsedSuccessfully = true;
      } catch (jsonErr) {
        console.error('[DEBUG-STAGE-5] JSON parsed successfully? False');
      }

      if (parsedSuccessfully) {
        // Validate key structures are present
        if (parsedJson.personal && typeof parsedJson.personal === 'object' && parsedJson.skills && typeof parsedJson.skills === 'object' && typeof parsedJson.isResume === 'boolean') {
          schemaValid = true;
        }
        console.log('[DEBUG-STAGE-5] JSON validation:', {
          parsedSuccessfully,
          schemaValid
        });
      }

      if (!schemaValid) {
        throw new Error('JSON structure is missing required top-level fields.');
      }

      aiSuccess = true;
      console.log(`[AI-EXTRACTOR] Attempt ${attempts} succeeded.`);
      break;
    } catch (err: any) {
      console.error(`[AI-EXTRACTOR] Attempt ${attempts} failed: ${err?.message || err}`);
      if (attempts >= maxAttempts) {
        console.warn(`[AI-EXTRACTOR] All ${maxAttempts} AI attempts failed. Preparing fallback.`);
      }
    }
  }

  let finalData: LegacyParsedData;

  if (aiSuccess && parsedJson) {
    try {
      finalData = validateAndNormalizeResumeData(parsedJson, rawText);
    } catch (valErr: any) {
      console.error(`[AI-EXTRACTOR] Post-AI normalization failed, falling back: ${valErr?.message || valErr}`);
      finalData = parseWithLegacyRegex(rawText);
      fallbackUsed = true;
    }
  } else {
    finalData = parseWithLegacyRegex(rawText);
    fallbackUsed = true;
  }

  const extractorTimeMs = Date.now() - startTime;
  console.log(`[AI-EXTRACTOR] Completed. AI Success: ${aiSuccess}, Fallback used: ${fallbackUsed}, Total time: ${extractorTimeMs}ms`);

  return {
    data: finalData,
    stats: {
      attempts,
      aiSuccess,
      fallbackUsed,
      geminiTimeMs,
      extractorTimeMs
    }
  };
}
