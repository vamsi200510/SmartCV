const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { GoogleGenAI } = require('c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\node_modules\\@google\\genai');

// Load env
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
  console.error('No GEMINI_API_KEY found!');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

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

function cleanValue(val) {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  const lower = s.toLowerCase();
  if (
    lower === 'n/a' || 
    lower === 'n/a.' ||
    lower === 'unknown' || 
    lower === 'null' || 
    lower === 'undefined' || 
    lower === '--' ||
    lower === 'n / a' ||
    lower === 'n-a' ||
    lower === 'none'
  ) {
    return '';
  }
  return s;
}

function currentResemblesResume(text, parsedData) {
  if (parsedData && typeof parsedData.isResume === 'boolean') {
    return {
      passed: parsedData.isResume,
      rejectReason: parsedData.isResume ? null : 'AI classified document as non-resume'
    };
  }
  
  const cleanText = text.toLowerCase();
  
  let rejectReason = '';
  if (cleanText.includes('beauty of nature') || cleanText.includes('deforestation') || cleanText.includes('ecosystems')) {
    rejectReason = 'Contains non-resume words like beauty of nature/deforestation/ecosystems';
  }
  
  const resumeKeywords = [
    'education', 'experience', 'skills', 'projects', 'work', 
    'university', 'college', 'institute', 'school', 'employment', 
    'certifications', 'cv', 'resume', 'b.tech', 'btech', 'degree',
    'engineering', 'technology', 'science', 'development', 'developer'
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
    passed: validationPassed,
    rejectReason: validationPassed ? null : rejectReason
  };
}

async function evaluateAll() {
  const results = [];
  const srcDir = 'c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\src';
  
  for (let i = 0; i <= 8; i++) {
    const filename = `r${i}.pdf`;
    const filePath = path.join(srcDir, filename);
    console.log(`Evaluating ${filename}...`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File ${filePath} not found!`);
      continue;
    }
    
    // Rate limit delay: Wait 12 seconds if not the first request to prevent RESOURCE_EXHAUSTED
    if (i > 0) {
      console.log('Sleeping for 12 seconds to prevent API rate limiting...');
      await new Promise(r => setTimeout(r, 12000));
    }
    
    try {
      const buffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      const rawText = pdfData.text;
      
      const cleanRawText = rawText.replace(/-- \d+ of \d+ --/g, '').trim();
      const isScanned = cleanRawText.length < 100;
      
      console.log(`- Extracted Text Length: ${rawText.length}, Is Scanned PDF: ${isScanned}`);
      
      const startTime = Date.now();
      let response;
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
      
      const duration = Date.now() - startTime;
      
      let parsed = null;
      let parseErr = null;
      try {
        parsed = JSON.parse(response.text);
      } catch (err) {
        parseErr = err.message;
      }
      
      let validation = null;
      if (parsed) {
        validation = currentResemblesResume(rawText, parsed);
      }
      
      // Calculate missing fields
      const missing = [];
      let totalFields = 0;
      let filledFields = 0;
      
      if (parsed) {
        const pName = cleanValue(parsed.personal?.fullName);
        const pEmail = cleanValue(parsed.personal?.email);
        const pPhone = cleanValue(parsed.personal?.phone);
        const pSummary = cleanValue(parsed.summary);
        
        if (!pName) missing.push('fullName'); else filledFields++;
        if (!pEmail) missing.push('email'); else filledFields++;
        if (!pPhone) missing.push('phone'); else filledFields++;
        totalFields += 3;
        
        if (!pSummary) missing.push('summary'); else filledFields++;
        totalFields++;
        
        const hasExp = Array.isArray(parsed.experience) && parsed.experience.length > 0;
        if (!hasExp) missing.push('experience'); else filledFields++;
        totalFields++;
        
        const hasEdu = Array.isArray(parsed.education) && parsed.education.length > 0;
        if (!hasEdu) missing.push('education'); else filledFields++;
        totalFields++;
        
        const hasSkills = Object.values(parsed.skills || {}).some(arr => Array.isArray(arr) && arr.length > 0);
        if (!hasSkills) missing.push('skills'); else filledFields++;
        totalFields++;
      }
      
      const accuracy = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
      
      results.push({
        resume: filename,
        textLength: rawText.length,
        geminiSuccess: !!parsed,
        parseError: parseErr,
        validationPassed: validation ? validation.passed : false,
        rejectReason: validation ? validation.rejectReason : 'Gemini Parsing Failed',
        confidence: parsed && parsed.confidence ? parsed.confidence : null,
        accuracy,
        missingFields: missing,
        durationMs: duration
      });
      
    } catch (err) {
      console.error(`Error processing ${filename}:`, err);
      results.push({
        resume: filename,
        textLength: 0,
        geminiSuccess: false,
        parseError: err.message,
        validationPassed: false,
        rejectReason: `Crash: ${err.message}`,
        accuracy: 0,
        missingFields: ['all'],
        durationMs: 0
      });
    }
  }
  
  console.log('\n--- EVALUATION RESULTS TABLE ---');
  console.table(results.map(r => ({
    Resume: r.resume,
    Length: r.textLength,
    'Gemini Success': r.geminiSuccess ? 'Yes' : 'No',
    'Old Rules Approved': r.validationPassed ? 'Yes' : 'No',
    'Rejection Reason': r.rejectReason || 'N/A',
    Accuracy: `${r.accuracy}%`,
    'Missing Fields': r.missingFields.join(', ') || 'None',
    'Duration (ms)': r.durationMs
  })));
  
  fs.writeFileSync('c:\\Users\\Dell\\OneDrive\\Desktop\\SmartCV\\scratch\\eval_results.json', JSON.stringify(results, null, 2));
  console.log('Results written to scratch/eval_results.json');
}

evaluateAll();
