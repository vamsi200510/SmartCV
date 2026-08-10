import { getGeminiClient } from './gemini';
import { RESUME_SCHEMA, RESUME_EXTRACTION_PROMPT } from './prompts';
import { parseWithLegacyRegex, LegacyParsedData } from './fallbackParser';

export interface ExtractorStats {
  attempts: number;
  aiSuccess: boolean;
  fallbackUsed: boolean;
  geminiTimeMs: number;
  extractorTimeMs: number;
  
  // Telemetry fields
  parser?: 'gemini-text' | 'gemini-vision' | 'cache' | 'fallback';
  processingMode?: 'text' | 'vision' | 'cache' | 'fallback';
  aiUsed?: boolean;
  cacheHit?: boolean;
  classificationConfidence?: number;
  extractionConfidence?: number;
  geminiModel?: string;
}

export interface ExtractorResult {
  data: LegacyParsedData;
  stats: ExtractorStats;
  errorType?: 'quota' | 'timeout' | 'network' | 'unknown' | 'rejected';
  errorMessage?: string;
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

  // Classification
  const cl = parsedJson?.classification || {};
  normalized.classification = {
    documentType: String(cl.documentType || 'resume').trim(),
    isResume: typeof cl.isResume === 'boolean' ? cl.isResume : true,
    confidence: typeof cl.confidence === 'number' ? cl.confidence : 0.5
  };

  // 1. Personal Information
  const p = parsedJson?.personal || {};
  const hl = p.headline || {};
  normalized.personal = {
    fullName: String(p.fullName || '').trim(),
    email: String(p.email || '').trim(),
    phone: String(p.phone || '').trim(),
    linkedin: String(p.linkedin || '').trim(),
    github: String(p.github || '').trim(),
    website: String(p.website || '').trim(),
    address: String(p.address || '').trim(),
    headline: {
      value: String(hl.value || '').trim(),
      confidence: typeof hl.confidence === 'number' ? hl.confidence : 0.0
    }
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

  normalized.isResume = typeof parsedJson?.isResume === 'boolean' ? parsedJson.isResume : normalized.classification.isResume;

  return cleanStrings(normalized);
}

// Conservative local pre-rejection check to avoid false positives on resumes mentioning blacklist items
function isClearlyNotAResumeLocal(text: string): boolean {
  const cleanText = text.toLowerCase();
  
  // Non-resume signals
  const nonResumeSignals = [
    'tax invoice', 'utility bill', 'bank statement', 
    'purchase order', 'receipt number', 'amount due'
  ];
  const hasNonResumeSignal = nonResumeSignals.some(kw => cleanText.includes(kw));

  // Resume validation signals
  const resumeSignals = [
    'experience', 'education', 'skills', 'projects', 
    'work history', 'curriculum vitae', 'employment history'
  ];
  const hasResumeSignal = resumeSignals.some(kw => cleanText.includes(kw));

  // Email format check
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleanText);

  // If it has a non-resume indicator AND completely lacks both email and typical resume sections,
  // we can safely conclude with high confidence that it is NOT a resume.
  if (hasNonResumeSignal && !hasResumeSignal && !hasEmail) {
    console.log('[LOCAL-PRE-REJECT] File clearly classified as non-resume locally.');
    return true;
  }

  return false;
}

export function resemblesResume(text: string, parsedData: LegacyParsedData): boolean {
  // 1. Check semantic AI classification if available
  if (parsedData && parsedData.classification && typeof parsedData.classification.isResume === 'boolean') {
    const isResumeVal = parsedData.classification.isResume;
    console.log('[DEBUG-STAGE-3] AI classification matches isResume:', isResumeVal);
    return isResumeVal;
  }
  if (parsedData && typeof parsedData.isResume === 'boolean') {
    return parsedData.isResume;
  }

  // 2. Reject obvious non-resume documents in fallback mode
  const cleanText = text.toLowerCase();
  const nonResumeIndicators = [
    'beauty of nature', 'deforestation', 'ecosystems',
    'invoice', 'bill to', 'amount due', 'aadhaar', 'permanent account number', 
    'pan card', 'driving license', 'driver license', 'question paper', 'bank statement'
  ];
  if (nonResumeIndicators.some(ind => cleanText.includes(ind))) {
    console.log('[DEBUG-STAGE-3] Fallback validation failed: Contains obvious non-resume indicators');
    return false;
  }
  
  // 3. Fallback checks for legacy parser
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
  
  const hasExperience = parsedData.experience?.length > 0;
  const hasEducation = parsedData.education?.length > 0;
  const hasProjects = parsedData.projects?.length > 0;
  const hasSkills = parsedData.skills && Object.values(parsedData.skills).some(arr => Array.isArray(arr) && arr.length > 0);
  
  const hasContact = hasName || hasEmail || hasPhone;
  const hasSections = hasExperience || hasEducation || hasProjects || hasSkills;

  const validationPassed = text.length >= 50 && (keywordCount >= 1 || hasContact || hasSections);

  console.log('[DEBUG-STAGE-3] Fallback resume validation metrics:', {
    keywordScore: keywordCount,
    textLength: text.length,
    validationPassed
  });
  
  return validationPassed;
}

export async function extractResume(rawText: string, fileBuffer?: Buffer): Promise<ExtractorResult> {
  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = 3; 
  let aiSuccess = false;
  let fallbackUsed = false;
  let parsedJson: any = null;
  let geminiTimeMs = 0;
  let errorType: 'quota' | 'timeout' | 'network' | 'unknown' | 'rejected' | undefined = undefined;
  let errorMessage: string | undefined = undefined;

  // Detect scanned PDF
  const cleanRawText = rawText.replace(/-- \d+ of \d+ --/g, '').trim();
  const isScanned = cleanRawText.length < 100 && fileBuffer;

  console.log(`[AI-EXTRACTOR] Starting v3 import pipeline. Text length: ${rawText.length}, Is Scanned: ${isScanned}`);

  // 1. Local Pre-rejection Check (Only for text-based resumes)
  if (!isScanned && isClearlyNotAResumeLocal(rawText)) {
    console.warn('[AI-EXTRACTOR] Local pre-rejection triggered. Bypassing Gemini.');
    return {
      data: parseWithLegacyRegex(''),
      stats: {
        attempts: 0,
        aiSuccess: false,
        fallbackUsed: false,
        geminiTimeMs: 0,
        extractorTimeMs: Date.now() - startTime,
        parser: 'fallback',
        processingMode: 'fallback',
        aiUsed: false,
        cacheHit: false
      },
      errorType: 'rejected',
      errorMessage: 'Please upload a valid resume.'
    };
  }

  // 2. Gemini Extraction attempts
  while (attempts < maxAttempts) {
    attempts++;
    const callStart = Date.now();
    try {
      console.log(`[AI-EXTRACTOR] Attempt ${attempts} of ${maxAttempts}...`);
      const ai = getGeminiClient();
      
      let response;
      if (isScanned && fileBuffer) {
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

      if (!responseText) {
        throw new Error('Gemini returned an empty text response.');
      }

      let parsedSuccessfully = false;
      let schemaValid = false;
      try {
        parsedJson = JSON.parse(responseText);
        parsedSuccessfully = true;
      } catch (_jsonErr) {
        console.error('[AI-EXTRACTOR] JSON parsing failed.');
      }

      if (parsedSuccessfully) {
        // Validate key structures are present
        if (parsedJson.classification && parsedJson.personal && parsedJson.skills) {
          schemaValid = true;
        }
      }

      if (!schemaValid) {
        throw new Error('JSON structure is missing required v3 schema fields.');
      }

      aiSuccess = true;
      break;
    } catch (err: any) {
      errorMessage = err?.message || String(err);
      console.error(`[AI-EXTRACTOR] Attempt ${attempts} error: ${errorMessage}`);
      
      const lowerMsg = (errorMessage || '').toLowerCase();
      if (
        err?.status === 429 ||
        lowerMsg.includes('429') ||
        lowerMsg.includes('quota') ||
        lowerMsg.includes('rate limit') ||
        lowerMsg.includes('exhausted')
      ) {
        errorType = 'quota';
      } else if (
        err?.name === 'TimeoutError' ||
        lowerMsg.includes('timeout') ||
        lowerMsg.includes('timed out') ||
        lowerMsg.includes('deadline')
      ) {
        errorType = 'timeout';
      } else if (
        lowerMsg.includes('fetch') ||
        lowerMsg.includes('network') ||
        lowerMsg.includes('connect') ||
        lowerMsg.includes('econn') ||
        err?.code === 'ENOTFOUND'
      ) {
        errorType = 'network';
      } else {
        errorType = 'unknown';
      }
    }
  }

  let finalData: LegacyParsedData;
  let processingMode: 'text' | 'vision' | 'fallback' = isScanned ? 'vision' : 'text';
  let parser: 'gemini-text' | 'gemini-vision' | 'fallback' = isScanned ? 'gemini-vision' : 'gemini-text';

  if (aiSuccess && parsedJson) {
    try {
      finalData = validateAndNormalizeResumeData(parsedJson, rawText);
    } catch (valErr: any) {
      console.error(`[AI-EXTRACTOR] Normalization error, falling back: ${valErr?.message}`);
      if (!isScanned) {
        finalData = parseWithLegacyRegex(rawText);
        fallbackUsed = true;
        parser = 'fallback';
        processingMode = 'fallback';
      } else {
        finalData = parseWithLegacyRegex('');
        parser = 'fallback';
        processingMode = 'fallback';
      }
    }
  } else {
    if (!isScanned) {
      finalData = parseWithLegacyRegex(rawText);
      fallbackUsed = true;
      parser = 'fallback';
      processingMode = 'fallback';
    } else {
      finalData = parseWithLegacyRegex('');
      parser = 'fallback';
      processingMode = 'fallback';
    }
  }

  // Calculate average confidence for telemetry if AI succeeded
  let avgConfidence = 0.5;
  if (aiSuccess && finalData && finalData.confidence) {
    const values = Object.values(finalData.confidence) as number[];
    avgConfidence = values.reduce((a, b) => a + b, 0) / values.length;
  }

  const extractorTimeMs = Date.now() - startTime;
  console.log(`[AI-EXTRACTOR] Complete. AI: ${aiSuccess}, Fallback: ${fallbackUsed}, Time: ${extractorTimeMs}ms`);

  return {
    data: finalData,
    stats: {
      attempts,
      aiSuccess,
      fallbackUsed,
      geminiTimeMs,
      extractorTimeMs,
      parser,
      processingMode,
      aiUsed: aiSuccess,
      cacheHit: false,
      classificationConfidence: finalData.classification?.confidence || 0.5,
      extractionConfidence: avgConfidence,
      geminiModel: aiSuccess ? 'gemini-2.5-flash' : undefined
    },
    errorType,
    errorMessage
  };
}
