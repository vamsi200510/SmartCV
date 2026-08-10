export const RESUME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    classification: {
      type: 'OBJECT',
      description: 'Unified document classification details',
      properties: {
        documentType: {
          type: 'STRING',
          description: 'Type of the document. Must be one of: resume, cv, cover_letter, project_report, research_paper, certificate, invoice, aadhaar, passport, pan, notes, assignment, book, other'
        },
        isResume: {
          type: 'BOOLEAN',
          description: 'Set to true if the document represents a candidate\'s resume, CV, or portfolio profile. Set to false if it is a non-resume document.'
        },
        confidence: {
          type: 'NUMBER',
          description: 'Confidence score from 0.0 to 1.0 representing classification certainty.'
        }
      },
      required: ['documentType', 'isResume', 'confidence']
    },
    personal: {
      type: 'OBJECT',
      properties: {
        fullName: { type: 'STRING' },
        email: { type: 'STRING' },
        phone: { type: 'STRING' },
        linkedin: { type: 'STRING' },
        github: { type: 'STRING' },
        website: { type: 'STRING' },
        address: { type: 'STRING' },
        headline: {
          type: 'OBJECT',
          description: 'Candidate\'s professional job title/headline extracted from the resume content.',
          properties: {
            value: {
              type: 'STRING',
              description: 'Professional title like "Software Engineer", "React Developer", etc. MUST be empty string if none is explicitly found in the resume.'
            },
            confidence: {
              type: 'NUMBER',
              description: 'Extraction confidence score from 0.0 to 1.0.'
            }
          },
          required: ['value', 'confidence']
        }
      },
      required: ['fullName', 'email', 'phone', 'linkedin', 'github', 'website', 'address', 'headline']
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
        personal: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for personal info extraction' },
        summary: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for summary extraction' },
        experience: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for experience extraction' },
        education: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for education extraction' },
        projects: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for projects extraction' },
        skills: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for skills extraction' },
        certifications: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for certifications extraction' },
        achievements: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for achievements extraction' },
        additionalInfo: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0 for additionalInfo extraction' }
      },
      required: [
        'personal',
        'summary',
        'experience',
        'education',
        'projects',
        'skills',
        'certifications',
        'achievements',
        'additionalInfo'
      ]
    },
    isResume: {
      type: 'BOOLEAN',
      description: 'Set to true if the document represents a candidate\'s resume, CV, or portfolio profile. Must match classification.isResume.'
    }
  },
  required: [
    'classification',
    'personal',
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'achievements',
    'additionalInfo',
    'confidence',
    'isResume'
  ]
};

export const RESUME_EXTRACTION_PROMPT = `Analyze and extract information from the raw resume document into the requested JSON structure.

CRITICAL EXTRACTION RULES:
1. COPY TEXT EXACTLY: Copy the text exactly as it appears in the document. Never rewrite, rephrase, or improve grammar in any extracted text.
2. NO SUMMARIZATION: Extract the full text for professional summary, experience bullets, and project descriptions. Never summarize, condense, or shorten the details.
3. NO INVENTION / HALLUCINATION: Never invent, assume, or extrapolate any information. If a field cannot be identified, leave it empty (do not output "N/A", "Unknown", "-", "--", "None", or null strings).
4. PRESERVE ORIGINAL FORMATTING AND CAPITALIZATION: Retain the original phrasing, capitalization, spelling, and dates exactly.
5. PRESERVE BULLET POINTS: For work experience, projects, and achievements, extract each individual bullet point exactly as written in the resume. Maintain their original order and wording.
6. PRESERVE SECTION ORDERING: Keep education, experience, and projects in the chronological or sequential order they appear in the source document.
7. PRESERVE ALL ENTRIES: Extract ALL education, experience, projects, certifications, and achievements. Do not omit any entries.
8. PRESERVE SKILLS LISTS: Preserve every skill in skills lists or comma-separated lists exactly. Do not clean up, rename, or group them beyond the requested categories.
9. PRESERVE CONTACT INFO: Extract email, phone number, address, location, website, GitHub, LinkedIn, and portfolio links exactly as listed.

CLASSIFICATION RULES:
- Determine the documentType:
  - "resume" / "cv": Candidate's curriculum vitae, resume, academic CV, portfolio, or professional profile.
  - "cover_letter": Letter of introduction for a job.
  - "project_report" / "research_paper": Extensive academic reports, descriptions of engineering projects without personal details, publications.
  - "certificate": Graduation certificates, course completions, awards.
  - "invoice": Receipts, bills, transaction statements.
  - "aadhaar" / "passport" / "pan": Identification cards or documents.
  - "notes" / "assignment" / "book" / "other": Standard lecture notes, book pages, homework, checklists, generic files.
- Set "classification.isResume" and "isResume" to true if the document type is "resume" or "cv". Set to false for all other document types.
- Provide a confidence score for this classification in "classification.confidence".

CANDIDATE HEADLINE RULES:
- Extract the candidate's professional job title/headline from the resume text (e.g. "Software Engineer", "React Developer", "Data Scientist", "Associate Consultant").
- It must be extracted ONLY from the content of the document itself (often directly below the candidate's name or at the beginning of their summary).
- NEVER extract the headline/role from the filename, metadata, uploaded document name, or draft title.
- If no professional headline/title is explicitly written in the resume content, set "personal.headline.value" to "" and "personal.headline.confidence" to 0.0.
- Otherwise, provide the extracted title and your extraction confidence score.

Return structured JSON only, strictly matching the requested schema. Do not include markdown formatting or explanations.`;
