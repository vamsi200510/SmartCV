/**
 * Honest, Evidence-Based ATS Scoring Engine
 * 
 * Strict deterministic calculations with ZERO score floors / baselines.
 * Sub-scores:
 * 1. Keyword / Skill Match (40%)
 * 2. Content Quality & Impact (25%)
 * 3. Formatting & Parseability (20%)
 * 4. Completeness (15%)
 */

export interface ATSSubScores {
  keywordMatchScore: number; // 0 - 100
  impactScore: number;       // 0 - 100 (Content Quality)
  formattingScore: number;   // 0 - 100
  completenessScore: number; // 0 - 100
}

export interface ATSAnalysisOutput {
  score: number; // 0 - 100 overall weighted score
  keywordMatchScore: number;
  formattingScore: number;
  impactScore: number;
  completenessScore: number;
  jobRoleMatch: 'Strong Match' | 'Moderate Match' | 'Needs Improvement' | 'Poor Match';
  matchedKeywords: string[];
  missingKeywords: string[];
  hardSkillsFound: string[];
  hardSkillsMissing: string[];
  softSkillsFound: string[];
  softSkillsMissing: string[];
  actionableSuggestions: string[];
  evaluatedRole: string;
  metricsDetectedCount: number;
  actionVerbsDetectedCount: number;
  totalBulletsAnalyzed: number;
}

// ── 1. Comprehensive Stop-Words (160+ tokens + resume filler) ────
export const EXTENDED_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
  'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t',
  'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s',
  'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is',
  'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should',
  'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they',
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to',
  'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
  'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re',
  'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Resume filler / generic job posting fluff words:
  'responsible', 'responsibility', 'responsibilities', 'duties', 'work', 'working',
  'team', 'candidate', 'experience', 'years', 'job', 'description', 'requirements',
  'preferred', 'required', 'qualifications', 'plus', 'must', 'should', 'will',
  'ability', 'skill', 'skills', 'including', 'opportunity', 'company', 'role',
  'standard', 'industry', 'evaluate', 'competencies', 'etc', 'various', 'daily',
  'assigned', 'help', 'assist', 'knowledge', 'understanding', 'hands', 'seeking',
  'looking', 'successful', 'ideal', 'passionate', 'proven', 'track', 'record'
]);

// ── 2. Strong Action Verbs ─────────────────────────────────────────
export const ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'administered', 'advised', 'allocated', 'analyzed',
  'architected', 'assembled', 'audited', 'authored', 'automated', 'boosted',
  'built', 'calculated', 'centralized', 'championed', 'coached', 'collaborated',
  'commissioned', 'communicated', 'composed', 'computed', 'conceived', 'conceptualized',
  'configured', 'consolidated', 'constructed', 'consulted', 'contracted', 'converted',
  'coordinated', 'created', 'customized', 'debugged', 'decreased', 'delegated',
  'delivered', 'demonstrated', 'deployed', 'designed', 'developed', 'devised',
  'diagnosed', 'directed', 'dispatched', 'diversified', 'documented', 'doubled',
  'drafted', 'earned', 'eliminated', 'engineered', 'enhanced', 'enlarged',
  'established', 'evaluated', 'examined', 'executed', 'expanded', 'expedited',
  'fabricated', 'facilitated', 'finalized', 'forecasted', 'formulated', 'fostered',
  'founded', 'generated', 'governed', 'guided', 'halved', 'headed', 'identified',
  'implemented', 'improved', 'increased', 'influenced', 'initiated', 'inspected',
  'installed', 'instituted', 'instructed', 'integrated', 'intensified', 'interpreted',
  'interviewed', 'introduced', 'invented', 'investigated', 'launched', 'lead',
  'led', 'leveraged', 'maintained', 'managed', 'mapped', 'maximized', 'mentored',
  'migrated', 'minimized', 'modeled', 'modernized', 'monitored', 'motivated',
  'negotiated', 'obtained', 'operated', 'optimized', 'orchestrated', 'organized',
  'originated', 'overhauled', 'oversaw', 'partnered', 'performed', 'piloted',
  'pioneered', 'planned', 'prevented', 'produced', 'programmed', 'projected',
  'promoted', 'proposed', 'published', 're-architected', 'rebuilt', 'recruited',
  'redesigned', 'reduced', 'refactored', 'reformed', 'regulated', 'remodeled',
  'reorganized', 'repaired', 'replaced', 'represented', 'researched', 'resolved',
  'restructured', 'revamped', 'reviewed', 'revitalized', 'saved', 'scaled',
  'scheduled', 'screened', 'secured', 'simplified', 'solved', 'spearheaded',
  'specialized', 'standardized', 'steered', 'strategized', 'streamlined', 'strengthened',
  'structured', 'supervised', 'synthesized', 'systematized', 'targeted', 'tested',
  'tracked', 'trained', 'transformed', 'translated', 'tripled', 'troubleshot',
  'unified', 'upgraded', 'validated', 'visualized', 'won', 'yielded'
]);

// ── 3. Role-Specific Skill Taxonomy (Fallback when no JD text) ──
export const ROLE_TAXONOMY: Record<string, { hardSkills: string[]; softSkills: string[] }> = {
  'software engineer': {
    hardSkills: ['data structures', 'algorithms', 'git', 'ci/cd', 'rest api', 'sql', 'unit testing', 'docker', 'system design', 'microservices', 'typescript', 'python', 'java'],
    softSkills: ['problem solving', 'code review', 'agile', 'cross-functional collaboration', 'technical communication']
  },
  'frontend developer': {
    hardSkills: ['react', 'next.js', 'typescript', 'javascript', 'html5', 'css3', 'tailwind css', 'redux', 'web performance', 'responsive design', 'rest api', 'graphql', 'jest'],
    softSkills: ['ui/ux sensibility', 'attention to detail', 'collaboration', 'cross-browser testing', 'accessibility']
  },
  'backend developer': {
    hardSkills: ['node.js', 'python', 'java', 'golang', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'microservices', 'graphql', 'rest api', 'database indexing'],
    softSkills: ['api design', 'system scalability', 'troubleshooting', 'security best practices', 'root cause analysis']
  },
  'full stack developer': {
    hardSkills: ['react', 'node.js', 'typescript', 'sql', 'nosql', 'docker', 'aws', 'rest api', 'git', 'tailwind css', 'ci/cd', 'state management', 'testing'],
    softSkills: ['end-to-end ownership', 'agile', 'product mindset', 'communication', 'adaptability']
  },
  'data scientist': {
    hardSkills: ['python', 'r', 'machine learning', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'sql', 'data visualization', 'statistical analysis', 'jupyter', 'nlp'],
    softSkills: ['data storytelling', 'critical thinking', 'business acumen', 'hypothesis testing', 'stakeholder presentation']
  },
  'ai / ml engineer': {
    hardSkills: ['python', 'pytorch', 'tensorflow', 'transformers', 'llms', 'langchain', 'huggingface', 'model deployment', 'mlops', 'docker', 'cuda', 'onnx', 'vector databases'],
    softSkills: ['research paper comprehension', 'experimentation', 'problem formulation', 'collaboration', 'ethical ai']
  },
  'devops engineer': {
    hardSkills: ['docker', 'kubernetes', 'terraform', 'aws', 'gcp', 'azure', 'ci/cd', 'github actions', 'linux', 'bash', 'prometheus', 'grafana', 'ansible', 'helm'],
    softSkills: ['incident response', 'automation mindset', 'disaster recovery', 'on-call management', 'cross-team alignment']
  },
  'product manager': {
    hardSkills: ['product roadmap', 'user stories', 'wireframing', 'a/b testing', 'sql', 'google analytics', 'jira', 'market research', 'okrs', 'kpi tracking', 'customer discovery'],
    softSkills: ['stakeholder management', 'prioritization', 'user empathy', 'strategic thinking', 'presentation']
  },
  'ui ux designer': {
    hardSkills: ['figma', 'wireframing', 'prototyping', 'design systems', 'user research', 'usability testing', 'information architecture', 'visual design', 'responsive design', 'interaction design'],
    softSkills: ['user empathy', 'creative problem solving', 'design critique', 'collaboration', 'presentation']
  },
  'qa engineer': {
    hardSkills: ['selenium', 'cypress', 'playwright', 'api testing', 'postman', 'jest', 'regression testing', 'test automation', 'jira', 'ci/cd', 'sql', 'performance testing'],
    softSkills: ['attention to detail', 'bug reporting', 'quality advocacy', 'analytical thinking', 'methodical testing']
  },
  'cybersecurity analyst': {
    hardSkills: ['network security', 'siem', 'incident response', 'vulnerability assessment', 'wireshark', 'penetration testing', 'soc', 'firewalls', 'identity management', 'compliance (gdpr/soc2)'],
    softSkills: ['threat analysis', 'crisis management', 'discretion', 'investigative mindset', 'communication']
  },
  'mobile developer': {
    hardSkills: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'mobile ui', 'state management', 'app store deployment', 'push notifications', 'offline storage'],
    softSkills: ['mobile ux design', 'performance optimization', 'cross-platform testing', 'collaboration', 'debugging']
  }
};

/**
 * Normalizes text and extracts alphanumeric terms and key multi-word phrases.
 */
export function extractKeywords(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  const lower = text.toLowerCase();
  
  // Extract multi-word tech terms first
  const multiWordTechs = [
    'next.js', 'react native', 'tailwind css', 'machine learning', 'deep learning',
    'system design', 'rest api', 'ci/cd', 'unit testing', 'data structures',
    'object oriented', 'node.js', 'vue.js', 'ruby on rails', 'spring boot',
    'design systems', 'user experience', 'user interface', 'user research',
    'cloud computing', 'pull requests', 'code reviews', 'microservices architecture',
    'relational database', 'nosql database', 'vector database', 'web performance',
    'responsive design', 'a/b testing', 'test automation', 'incident response',
    'cross-functional', 'problem solving', 'project management'
  ];

  const extracted = new Set<string>();

  for (const mwt of multiWordTechs) {
    if (lower.includes(mwt)) {
      extracted.add(mwt);
    }
  }

  // Tokenize single words
  const rawWords = lower
    .replace(/[/\\[\](){},;:"'|<>?!=*&^%$#@~`]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^[.\-_]+|[.\-_]+$/g, ''))
    .filter(w => w.length > 1 && !EXTENDED_STOP_WORDS.has(w) && !/^\d+$/.test(w));

  for (const w of rawWords) {
    if (w.length > 1) {
      extracted.add(w);
    }
  }

  return Array.from(extracted);
}

/**
 * Finds the closest role in our taxonomy based on string match.
 */
export function matchRoleTaxonomy(roleName: string) {
  const clean = (roleName || '').toLowerCase().trim();
  if (!clean) return null;

  for (const [roleKey, taxonomy] of Object.entries(ROLE_TAXONOMY)) {
    if (clean.includes(roleKey) || roleKey.includes(clean)) {
      return { role: roleKey, ...taxonomy };
    }
  }
  return null;
}

/**
 * Evaluates full resume data strictly and returns verifiable sub-scores and breakdown.
 */
export function evaluateResumeATS(
  resumeData: any,
  targetRole: string = '',
  jobDescription: string = ''
): ATSAnalysisOutput {
  const pi = resumeData?.personalInfo || {};
  const summary = (pi.summary || resumeData?.summary || '').trim();
  const skillsList: string[] = (resumeData?.skills || []).flatMap((s: any) =>
    Array.isArray(s.items) ? s.items : (typeof s === 'string' ? [s] : [])
  ).filter(Boolean);

  const experience: any[] = resumeData?.experience || [];
  const projects: any[] = resumeData?.projects || [];
  const education: any[] = resumeData?.education || [];
  const certifications: any[] = resumeData?.certifications || [];

  // Collect all text
  const expBullets: string[] = experience.flatMap((e: any) => (e.bullets || []).filter(Boolean));
  const projBullets: string[] = projects.flatMap((p: any) => (p.bullets || []).filter(Boolean));
  const allBullets = [...expBullets, ...projBullets];

  const fullResumeText = [
    pi.fullName,
    pi.title,
    summary,
    ...skillsList,
    experience.map((e: any) => `${e.role || e.position || ''} ${e.company || ''} ${e.description || ''} ${(e.bullets || []).join(' ')}`).join(' '),
    projects.map((p: any) => `${p.name || p.title || ''} ${p.description || ''} ${(p.technologies || p.techStack || []).join(' ')} ${(p.bullets || []).join(' ')}`).join(' '),
    education.map((ed: any) => `${ed.degree || ''} ${ed.field || ed.fieldOfStudy || ''} ${ed.school || ed.institution || ''} ${ed.details || ''}`).join(' '),
    certifications.map((c: any) => typeof c === 'string' ? c : `${c.name || ''} ${c.issuer || ''}`).join(' '),
    resumeData?.rawResumeText || ''
  ].filter(Boolean).join('\n').toLowerCase();

  const isCompletelyEmpty = fullResumeText.trim().length === 0 && skillsList.length === 0 && experience.length === 0;

  if (isCompletelyEmpty) {
    return {
      score: 0,
      keywordMatchScore: 0,
      formattingScore: 0,
      impactScore: 0,
      completenessScore: 0,
      jobRoleMatch: 'Poor Match',
      matchedKeywords: [],
      missingKeywords: [],
      hardSkillsFound: [],
      hardSkillsMissing: [],
      softSkillsFound: [],
      softSkillsMissing: [],
      actionableSuggestions: [
        'Add your contact details (Full Name, Email, Phone, Location).',
        'Add a targeted Summary section summarizing your background and career goals.',
        'List your technical skills and relevant tools.',
        'Add experience or project entries detailing achievements.'
      ],
      evaluatedRole: targetRole || 'Target Role',
      metricsDetectedCount: 0,
      actionVerbsDetectedCount: 0,
      totalBulletsAnalyzed: 0
    };
  }

  // ── SUB-SCORE 1: Keyword / Skill Match (Weight: 40%) ─────────────
  let targetKeywords: string[] = [];
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const hardSkillsFound: string[] = [];
  const hardSkillsMissing: string[] = [];
  const softSkillsFound: string[] = [];
  const softSkillsMissing: string[] = [];

  const hasJD = !!(jobDescription && jobDescription.trim().length > 15);
  const effectiveRole = targetRole || pi.title || 'Software Engineer';
  const roleTaxonomy = matchRoleTaxonomy(effectiveRole);

  if (hasJD) {
    targetKeywords = extractKeywords(jobDescription);
  } else if (roleTaxonomy) {
    targetKeywords = [...roleTaxonomy.hardSkills, ...roleTaxonomy.softSkills];
  } else {
    // If no JD and unknown role, derive target keywords from user's listed role and standard competencies
    targetKeywords = extractKeywords(effectiveRole);
  }

  if (targetKeywords.length > 0) {
    for (const kw of targetKeywords) {
      const lowerKw = kw.toLowerCase();
      // Test exact keyword or root in resume
      if (fullResumeText.includes(lowerKw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }
  }

  // Detect hard vs soft skills from matched / missing
  if (roleTaxonomy) {
    for (const hs of roleTaxonomy.hardSkills) {
      if (fullResumeText.includes(hs.toLowerCase())) hardSkillsFound.push(hs);
      else hardSkillsMissing.push(hs);
    }
    for (const ss of roleTaxonomy.softSkills) {
      if (fullResumeText.includes(ss.toLowerCase())) softSkillsFound.push(ss);
      else softSkillsMissing.push(ss);
    }
  } else {
    // Partition matched keywords
    matchedKeywords.slice(0, 10).forEach(k => hardSkillsFound.push(k));
    missingKeywords.slice(0, 10).forEach(k => hardSkillsMissing.push(k));
  }

  const keywordMatchRatio = targetKeywords.length > 0
    ? (matchedKeywords.length / targetKeywords.length)
    : (skillsList.length > 0 ? Math.min(1, skillsList.length / 8) : 0);

  const keywordMatchScore = Math.min(100, Math.max(0, Math.round(keywordMatchRatio * 100)));

  // ── SUB-SCORE 2: Formatting & Parseability (Weight: 20%) ──────────
  // Starts strictly at 0
  let formattingPoints = 0;
  if (pi.fullName && pi.fullName.trim().length > 2) formattingPoints += 25;
  if (pi.email && /\S+@\S+\.\S+/.test(pi.email.trim())) formattingPoints += 25;
  if (pi.phone && pi.phone.trim().length >= 7) formattingPoints += 25;
  if (pi.location && pi.location.trim().length > 2) formattingPoints += 25;
  const formattingScore = Math.min(100, Math.max(0, formattingPoints));

  // ── SUB-SCORE 3: Content Quality & Impact (Weight: 25%) ───────────
  // Starts strictly at 0
  let impactScore = 0;
  let metricsDetectedCount = 0;
  let actionVerbsDetectedCount = 0;
  const totalBullets = allBullets.length;

  if (totalBullets > 0) {
    let actionVerbBullets = 0;
    let metricBullets = 0;
    let validLengthBullets = 0;

    for (const bullet of allBullets) {
      const cleanBullet = bullet.trim();
      const firstWord = cleanBullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
      
      if (ACTION_VERBS.has(firstWord)) {
        actionVerbBullets++;
        actionVerbsDetectedCount++;
      }

      // Check numbers / metrics (e.g. 20%, $50k, 10x, 150ms, 400+, 2.5m)
      if (/\b\d+(\.\d+)?([%kKmMxX\+]|\s?(ms|seconds|minutes|hours|users|clients|dollars|usd))?\b|\$\d+/i.test(cleanBullet)) {
        metricBullets++;
        metricsDetectedCount++;
      }

      // Check length sanity (35 to 250 characters is sweet spot for ATS readability)
      if (cleanBullet.length >= 35 && cleanBullet.length <= 250) {
        validLengthBullets++;
      }
    }

    const actionVerbRatio = actionVerbBullets / totalBullets; // 0 to 1
    const metricRatio = metricBullets / totalBullets;         // 0 to 1
    const validLengthRatio = validLengthBullets / totalBullets; // 0 to 1

    // Weighted quality calculation (Action Verbs 40%, Metrics 40%, Length 20%)
    impactScore = Math.round((actionVerbRatio * 40) + (metricRatio * 40) + (validLengthRatio * 20));
  } else if (summary.length >= 100) {
    // If no bullets but good summary, grant modest partial credit
    impactScore = Math.min(30, Math.round(summary.length / 10));
  }
  impactScore = Math.min(100, Math.max(0, impactScore));

  // ── SUB-SCORE 4: Completeness (Weight: 15%) ────────────────────────
  // Starts strictly at 0
  let completenessPoints = 0;
  if (summary.length >= 40) completenessPoints += 25;
  if (experience.length > 0 && expBullets.length > 0) completenessPoints += 25;
  if (education.length > 0 && education.some((e: any) => e.school || e.institution || e.degree)) completenessPoints += 25;
  if (skillsList.length >= 3) completenessPoints += 25;
  const completenessScore = Math.min(100, Math.max(0, completenessPoints));

  // ── Weighted Overall Score ─────────────────────────────────────────
  const weightedScore = Math.round(
    (keywordMatchScore * 0.40) +
    (impactScore * 0.25) +
    (formattingScore * 0.20) +
    (completenessScore * 0.15)
  );
  const finalScore = Math.min(100, Math.max(0, weightedScore));

  // Match Level Rating
  const jobRoleMatch: ATSAnalysisOutput['jobRoleMatch'] =
    finalScore >= 80 ? 'Strong Match' :
    finalScore >= 60 ? 'Moderate Match' :
    finalScore >= 35 ? 'Needs Improvement' : 'Poor Match';

  // ── 4. Actionable Suggestions (Honest, gap-specific) ──────────────
  const actionableSuggestions: string[] = [];

  if (missingKeywords.length > 0) {
    actionableSuggestions.push(
      `Add critical role keywords from the job description: ${missingKeywords.slice(0, 6).join(', ')}.`
    );
  }
  if (totalBullets === 0) {
    actionableSuggestions.push('Add detailed achievement bullet points under your work experience and projects.');
  } else {
    if (metricsDetectedCount < Math.ceil(totalBullets * 0.4)) {
      actionableSuggestions.push('Quantify your impact with concrete metrics (e.g. "% reduction in load time", "$ revenue increased", "number of active users").');
    }
    if (actionVerbsDetectedCount < Math.ceil(totalBullets * 0.6)) {
      actionableSuggestions.push('Begin every bullet point with a powerful past-tense action verb (e.g. "Architected", "Accelerated", "Automated", "Engineered").');
    }
  }
  if (!summary || summary.length < 50) {
    actionableSuggestions.push(`Write a targeted 3-4 sentence professional summary highlighting your core expertise in ${effectiveRole}.`);
  }
  if (skillsList.length < 5) {
    actionableSuggestions.push('Expand your Skills section with key frameworks, tools, databases, and libraries.');
  }
  if (!pi.email || !pi.phone || !pi.location) {
    actionableSuggestions.push('Ensure complete contact information (Email, Phone number, City/Location) for ATS parsers.');
  }

  return {
    score: finalScore,
    keywordMatchScore,
    formattingScore,
    impactScore,
    completenessScore,
    jobRoleMatch,
    matchedKeywords: matchedKeywords.slice(0, 25),
    missingKeywords: missingKeywords.slice(0, 25),
    hardSkillsFound: hardSkillsFound.slice(0, 15),
    hardSkillsMissing: hardSkillsMissing.slice(0, 15),
    softSkillsFound: softSkillsFound.slice(0, 8),
    softSkillsMissing: softSkillsMissing.slice(0, 8),
    actionableSuggestions: actionableSuggestions.slice(0, 5),
    evaluatedRole: effectiveRole,
    metricsDetectedCount,
    actionVerbsDetectedCount,
    totalBulletsAnalyzed: totalBullets
  };
}
