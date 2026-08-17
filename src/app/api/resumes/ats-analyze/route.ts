import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getGeminiClient } from '@/lib/ai/gemini';
import { evaluateResumeATS, ATSAnalysisOutput } from '@/lib/ai/atsEngine';

export type { ATSAnalysisOutput };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeId, resumeData: incomingResumeData, jobRole, jobDescription } = body;

    let resumeData = incomingResumeData;
    let targetRole = jobRole || '';

    // If resumeId provided and no resumeData passed, fetch from DB
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

    const effectiveRole = (targetRole || resumeData?.personalInfo?.title || 'Software Engineer').trim();
    const effectiveJD = (jobDescription || '').trim();

    // 1. Calculate deterministic, verifiable scores with zero baselines
    const deterministicAnalysis = evaluateResumeATS(resumeData, effectiveRole, effectiveJD);

    // 2. Optional: Query Gemini strictly for actionable qualitative suggestions and critical feedback
    let criticalSuggestions: string[] = deterministicAnalysis.actionableSuggestions;

    // Only query AI if there is actual resume content to evaluate
    if (deterministicAnalysis.score > 0) {
      try {
        const ai = getGeminiClient();
        const systemPrompt = `
You are a senior technical recruiter and critical ATS audit specialist at a top tier company.
Your goal is to provide honest, critical, and candid feedback on resume bullets, skills, and match for the target role.
RULES:
1. Do NOT soften feedback or give generic praise.
2. A generic or weak resume should be clearly critiqued with actionable gaps identified.
3. Every suggestion must cite specific missing skills or concrete ways to improve bullet impact.
4. Return ONLY a JSON object:
{
  "actionableSuggestions": string[] (3 to 5 critical, evidence-based recommendations)
}
`;

        const fullResumeText = JSON.stringify(resumeData);
        const userPrompt = `
TARGET ROLE: ${effectiveRole}
JOB DESCRIPTION: ${effectiveJD || 'Not specified (Standard role criteria apply)'}
DETERMINISTIC ATS SCORE: ${deterministicAnalysis.score}%
KEYWORD MATCH: ${deterministicAnalysis.keywordMatchScore}%
CONTENT IMPACT: ${deterministicAnalysis.impactScore}%
FORMATTING: ${deterministicAnalysis.formattingScore}%
COMPLETENESS: ${deterministicAnalysis.completenessScore}%

MISSING KEYWORDS DETECTED: ${deterministicAnalysis.missingKeywords.slice(0, 10).join(', ')}

RESUME DATA:
${fullResumeText}
`;

        const models = ['gemini-2.5-flash', 'gemini-2.0-flash'];
        for (const m of models) {
          try {
            const res = await ai.models.generateContent({
              model: m,
              contents: userPrompt,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                temperature: 0.2
              }
            });
            if (res.text) {
              const parsed = JSON.parse(res.text);
              if (Array.isArray(parsed.actionableSuggestions) && parsed.actionableSuggestions.length > 0) {
                criticalSuggestions = parsed.actionableSuggestions.slice(0, 5);
                break;
              }
            }
          } catch (_e) {
            // Ignore AI failure and fallback smoothly to deterministic suggestions
          }
        }
      } catch (_aiErr) {
        // AI service unavailable; deterministic suggestions remain active
      }
    }

    const finalResult: ATSAnalysisOutput = {
      ...deterministicAnalysis,
      actionableSuggestions: criticalSuggestions
    };

    return NextResponse.json({
      success: true,
      analysis: finalResult
    });

  } catch (err: any) {
    console.error('[ATS Analysis API Error]', err);
    return NextResponse.json({ error: err.message || 'ATS Analysis failed.' }, { status: 500 });
  }
}
