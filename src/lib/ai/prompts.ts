export const RESUME_SCHEMA = {
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
      description: 'Set to true if the document represents a candidate\'s resume, CV, or portfolio profile. Set to false if the document is obviously a non-resume document (e.g., notes, bank statements, question papers, essays, invoices, random text).'
    }
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
    'additionalInfo',
    'confidence',
    'isResume'
  ]
};

export const RESUME_EXTRACTION_PROMPT = `Analyze and extract information from the raw resume text into the requested JSON structure.
Determine whether the document represents a candidate's resume/CV/portfolio/profile (set isResume to true). If the document is obviously not a resume (e.g., essay on deforestation/nature, bank statement, question paper, exam, invoice), set isResume to false.
Single-column, two-column, ATS, designer, fresher, experienced, academic CVs, and internship resumes must all be classified as isResume: true.
For every resume, extract as much information as possible. If a field cannot be identified, leave it empty (do not invent information or output placeholders like N/A).
For each section, assign a confidence score between 0.0 (totally uncertain) and 1.0 (absolutely certain) in the confidence object.
Return structured JSON only, strictly matching the requested schema. Do not include markdown formatting or explanations.`;
