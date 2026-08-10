import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface ATSAnalysisResult {
  score: number; // 0 - 100 overall score
  keywordMatchScore: number; // 0 - 100
  formattingScore: number; // 0 - 100
  impactScore: number; // 0 - 100
  jobRoleMatch: 'Strong Match' | 'Moderate Match' | 'Needs Improvement';
  matchedKeywords: string[];
  missingKeywords: string[];
  hardSkillsFound: string[];
  hardSkillsMissing: string[];
  softSkillsFound: string[];
  softSkillsMissing: string[];
  actionableSuggestions: string[];
  evaluatedRole: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeId, resumeData: incomingResumeData, jobRole, jobDescription } = body;

    let resumeData = incomingResumeData;
    let targetRole = jobRole || '';

    // If resumeId provided, fetch from DB
    if (resumeId && (!resumeData || Object.keys(resumeData).length === 0)) {
      const { data: dbResume, error } = await supabaseAdmin
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error || !dbResume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      resumeData = dbResume.resume_data;
      if (!targetRole) {
        targetRole = dbResume.role || dbResume.category || '';
      }
    }

    if (!resumeData) {
      return NextResponse.json({ error: 'No resume data provided for ATS analysis.' }, { status: 400 });
    }

    // Extract text from resumeData
    const personalInfo = resumeData.personalInfo || {};
    const summaryText = personalInfo.summary || resumeData.summary || '';
    const skillsList = (resumeData.skills || []).flatMap((s: any) => 
      Array.isArray(s.items) ? s.items : (typeof s === 'string' ? [s] : [])
    );
    const expText = (resumeData.experience || []).map((e: any) => 
      `${e.position || e.role || ''} ${e.company || ''} ${e.description || ''} ${(e.bullets || []).join(' ')}`
    ).join(' ');
    const projText = (resumeData.projects || []).map((p: any) => 
      `${p.title || p.name || ''} ${p.description || ''} ${(p.techStack || []).join(' ')} ${(p.bullets || []).join(' ')}`
    ).join(' ');
    const eduText = (resumeData.education || []).map((ed: any) => 
      `${ed.degree || ''} ${ed.fieldOfStudy || ed.field || ''} ${ed.institution || ed.school || ''}`
    ).join(' ');
    const certText = (resumeData.certifications || []).map((c: any) => 
      typeof c === 'string' ? c : `${c.name || ''} ${c.issuer || ''}`
    ).join(' ');

    const fullResumeText = [
      personalInfo.fullName,
      personalInfo.title,
      summaryText,
      ...skillsList,
      expText,
      projText,
      eduText,
      certText,
      resumeData.rawResumeText || ''
    ].filter(Boolean).join('\n');

    const effectiveRole = targetRole || personalInfo.title || 'Software Engineer';
    const effectiveJD = jobDescription || `Target Role: ${effectiveRole}. Evaluate standard industry competencies, technical skills, domain tools, action verbs, and quantifiable metrics for this role.`;

    // Attempt Gemini AI Analysis first
    try {
      const ai = getGeminiClient();
      const systemPrompt = `
You are an enterprise Applicant Tracking System (ATS) evaluation engine used by Fortune 500 recruiters (like Lever, Greenhouse, Workday).
Your job is to perform a rigorous, accurate, and objective ATS analysis of a resume against a target Job Role and Job Description.

DO NOT output fake hardcoded numbers like 99%, 98%, 97%. Calculate true ratings based on actual keyword overlap, skill match, metric presence, and formatting completeness.

Return ONLY a valid JSON object matching this schema:
{
  "score": number (0 to 100 overall score based on criteria),
  "keywordMatchScore": number (0 to 100),
  "formattingScore": number (0 to 100),
  "impactScore": number (0 to 100),
  "jobRoleMatch": "Strong Match" | "Moderate Match" | "Needs Improvement",
  "matchedKeywords": string[] (actual keywords from JD present in resume),
  "missingKeywords": string[] (critical keywords/skills from JD missing from resume),
  "hardSkillsFound": string[] (technical skills found),
  "hardSkillsMissing": string[] (technical skills required by role but missing),
  "softSkillsFound": string[] (relevant soft skills found),
  "softSkillsMissing": string[] (soft skills required but missing),
  "actionableSuggestions": string[] (3-5 specific, actionable tips to increase ATS score),
  "evaluatedRole": string (name of role evaluated against)
}
`;

      const userContent = `
TARGET ROLE: ${effectiveRole}

JOB DESCRIPTION:
${effectiveJD}

RESUME DATA:
${fullResumeText}
`;

      const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
      let aiResponseText: string | null = null;

      for (const m of models) {
        try {
          const res = await ai.models.generateContent({
            model: m,
            contents: userContent,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
            }
          });
          if (res.text) {
            aiResponseText = res.text;
            break;
          }
        } catch (e: any) {
          console.warn(`[ATS Analysis API] Model ${m} warning:`, e?.message);
        }
      }

      if (aiResponseText) {
        const parsed = JSON.parse(aiResponseText);
        return NextResponse.json({
          success: true,
          analysis: {
            score: Math.min(100, Math.max(0, Math.round(parsed.score || 70))),
            keywordMatchScore: Math.min(100, Math.max(0, Math.round(parsed.keywordMatchScore || 70))),
            formattingScore: Math.min(100, Math.max(0, Math.round(parsed.formattingScore || 85))),
            impactScore: Math.min(100, Math.max(0, Math.round(parsed.impactScore || 65))),
            jobRoleMatch: parsed.jobRoleMatch || (parsed.score >= 75 ? 'Strong Match' : parsed.score >= 50 ? 'Moderate Match' : 'Needs Improvement'),
            matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
            missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
            hardSkillsFound: Array.isArray(parsed.hardSkillsFound) ? parsed.hardSkillsFound : [],
            hardSkillsMissing: Array.isArray(parsed.hardSkillsMissing) ? parsed.hardSkillsMissing : [],
            softSkillsFound: Array.isArray(parsed.softSkillsFound) ? parsed.softSkillsFound : [],
            softSkillsMissing: Array.isArray(parsed.softSkillsMissing) ? parsed.softSkillsMissing : [],
            actionableSuggestions: Array.isArray(parsed.actionableSuggestions) ? parsed.actionableSuggestions : [],
            evaluatedRole: parsed.evaluatedRole || effectiveRole
          }
        });
      }
    } catch (aiErr: any) {
      console.warn('[ATS Analysis API] AI fallback triggered:', aiErr?.message);
    }

    // Fallback: Advanced NLP Algorithm for ATS analysis
    const nlpResult = performNLPATSAnalysis(fullResumeText, effectiveRole, effectiveJD, resumeData);
    return NextResponse.json({
      success: true,
      analysis: nlpResult
    });

  } catch (err: any) {
    console.error('[ATS Analysis API Error]', err);
    return NextResponse.json({ error: err.message || 'ATS Analysis failed.' }, { status: 500 });
  }
}

// Fallback NLP ATS Engine
function performNLPATSAnalysis(
  fullText: string,
  targetRole: string,
  jdText: string,
  resumeData: any
): ATSAnalysisResult {
  const lowerResume = fullText.toLowerCase();
  const lowerJD = jdText.toLowerCase();

  // Extract keywords from JD
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'are', 'from', 'will', 'have', 'been', 'your', 'you',
    'our', 'can', 'all', 'any', 'but', 'not', 'was', 'has', 'had', 'its', 'also', 'may', 'per', 'than',
    'work', 'team', 'must', 'should', 'about', 'more', 'their', 'such', 'into', 'over', 'after'
  ]);

  const words = lowerJD
    .replace(/[^a-z0-9\s\+#\.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const uniqueKw = [...new Set(words)];

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of uniqueKw) {
    if (lowerResume.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordMatchScore = uniqueKw.length > 0
    ? Math.round((matchedKeywords.length / uniqueKw.length) * 100)
    : 70;

  // Check section completeness
  let formattingScore = 60;
  if (resumeData.personalInfo?.fullName) formattingScore += 10;
  if (resumeData.personalInfo?.email) formattingScore += 5;
  if (resumeData.summary) formattingScore += 10;
  if (resumeData.skills && resumeData.skills.length > 0) formattingScore += 10;
  if (resumeData.education && resumeData.education.length > 0) formattingScore += 5;
  formattingScore = Math.min(100, formattingScore);

  // Check impact / quantifiable metrics
  const metricCount = (fullText.match(/\d+[\%\+\$kKmM]?/g) || []).length;
  const actionVerbCount = (fullText.match(/led|built|developed|designed|implemented|optimized|increased|reduced|managed|created/gi) || []).length;
  const impactScore = Math.min(100, (metricCount * 10) + (actionVerbCount * 8) + 30);

  const overallScore = Math.round((keywordMatchScore * 0.5) + (formattingScore * 0.25) + (impactScore * 0.25));

  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add key missing terms: ${missingKeywords.slice(0, 5).join(', ')}`);
  }
  if (metricCount < 3) {
    suggestions.push('Include more quantifiable numbers and metrics (e.g. "Increased speed by 25%").');
  }
  if (!resumeData.summary || resumeData.summary.length < 30) {
    suggestions.push(`Write a targeted 2-3 sentence summary highlighting your experience for ${targetRole}.`);
  }
  if (actionVerbCount < 4) {
    suggestions.push('Start bullet points with strong action verbs (e.g. Led, Built, Engineered, Optimized).');
  }

  return {
    score: overallScore,
    keywordMatchScore,
    formattingScore,
    impactScore,
    jobRoleMatch: overallScore >= 75 ? 'Strong Match' : overallScore >= 50 ? 'Moderate Match' : 'Needs Improvement',
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingKeywords: missingKeywords.slice(0, 15),
    hardSkillsFound: matchedKeywords.filter(k => k.length > 3).slice(0, 10),
    hardSkillsMissing: missingKeywords.filter(k => k.length > 3).slice(0, 10),
    softSkillsFound: ['Communication', 'Problem Solving', 'Teamwork'].filter(s => lowerResume.includes(s.toLowerCase())),
    softSkillsMissing: ['Agile', 'Leadership', 'Cross-functional Collaboration'].filter(s => !lowerResume.includes(s.toLowerCase())),
    actionableSuggestions: suggestions,
    evaluatedRole: targetRole
  };
}
