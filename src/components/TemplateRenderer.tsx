'use client';

import React from 'react';
import { 
  Mail, Phone, MapPin, Globe, 
  Award, Briefcase, GraduationCap, Code2, FolderGit2, Calendar 
} from 'lucide-react';

// Custom inline SVG icons for GitHub and LinkedIn to avoid import version dependencies
const GithubIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Resume data structure
export interface ResumeData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    github?: string;
    linkedin?: string;
    summary: string;
  };
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    location?: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    duration: string;
    details?: string;
  }>;
  projects: Array<{
    name: string;
    technologies: string[];
    description: string;
    bullets?: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  achievements?: Array<{
    title: string;
    description: string;
  }>;
  additionalInfo?: {
    languages?: string;
    interests?: string;
  };
  customization?: {
    fontFamily?: 'Inter' | 'Geist' | 'Poppins' | 'Manrope' | 'Source Sans 3' | 'IBM Plex Sans' | 'Plus Jakarta Sans' | 'Lato';
    fontSize?: 'small' | 'medium' | 'large' | 'extraLarge';
    density?: 'compact' | 'balanced' | 'spacious';
    primaryColor?: string;
    visibleSections?: string[];
    sectionOrder?: string[];
  };
}

// Default realistic sample data for Vamsi Krishna Tadisetti
export const defaultSampleData: ResumeData = {
  personalInfo: {
    fullName: 'Vamsi Krishna Tadisetti',
    title: 'Lead Full Stack & Product Engineer',
    email: 'vamsi.tadisetti@smartcv.dev',
    phone: '+91 98765 43210',
    location: 'Hyderabad, India',
    website: 'vamsitadisetti.dev',
    github: 'github.com/vamsi200510',
    linkedin: 'linkedin.com/in/vamsitadisetti',
    summary: 'Result-driven Lead Software Engineer and Product Innovator with over 6 years of experience designing, building, and scaling high-performance web applications and distributed systems. Expert in React/Next.js, Node.js, and Cloud Infrastructure (GCP/AWS). Proven track record of leading cross-functional teams, optimizing engineering workflows, and delivering user-centric SaaS products from ideation to production.'
  },
  experience: [
    {
      role: 'Senior Software Engineer',
      company: 'SmartTech Solutions',
      duration: '2023 - Present',
      location: 'Hyderabad, India',
      bullets: [
        'Led a team of 5 engineers to redesign and migrate legacy systems to Next.js, improving page load speed by 45% and conversion rates by 20%.',
        'Designed and built a real-time analytics dashboard processing over 10M daily events with Node.js, Redis, and PostgreSQL.',
        'Established automated CI/CD pipelines and testing suites, reducing deployment error rates by 30% and time-to-market by 15%.',
        'Mentored junior engineers and conducted code reviews, increasing overall code quality scores across the department.'
      ]
    },
    {
      role: 'Full Stack Developer',
      company: 'CloudScale Systems',
      duration: '2020 - 2023',
      location: 'Bangalore, India',
      bullets: [
        'Architected and implemented responsive frontend applications using React, Tailwind CSS, and TypeScript.',
        'Developed scalable RESTful APIs and GraphQL services, improving server response times by 25%.',
        'Collaborated closely with product managers and UI/UX designers to implement a custom, accessible component library.',
        'Optimized database queries and schemas, decreasing read latencies by 35% on critical application tables.'
      ]
    }
  ],
  education: [
    {
      degree: 'Master of Science in Computer Science',
      school: 'IIT Hyderabad',
      duration: '2018 - 2020',
      details: 'GPA: 9.4/10. Specialization in Distributed Systems & AI'
    },
    {
      degree: 'Bachelor of Technology in Computer Science',
      school: 'NIT Warangal',
      duration: '2014 - 2018',
      details: 'First Class with Distinction'
    }
  ],
  projects: [
    {
      name: 'SmartCV - AI Resume Builder',
      technologies: ['Next.js', 'Supabase', 'TailwindCSS', 'TypeScript'],
      description: 'Built a high-performance resume builder platform with real-time editing, a dynamic template discovery module with 12 layouts, secure JWT authorization, and an active PDF compilation engine.'
    },
    {
      name: 'Distributed Job Queue Engine',
      technologies: ['Go', 'Redis', 'Docker', 'PostgreSQL'],
      description: 'Developed a high-throughput job queue engine in Go, supporting cron schedules, delayed execution, backoffs, and real-time diagnostics via web sockets.'
    }
  ],
  skills: [
    {
      category: 'Languages',
      items: ['JavaScript (ES6+)', 'TypeScript', 'HTML5/CSS3', 'Python', 'Go', 'SQL']
    },
    {
      category: 'Frameworks / Libraries',
      items: ['React', 'Next.js', 'Node.js', 'Express', 'Redux Toolkit', 'TailwindCSS']
    },
    {
      category: 'Databases & Cloud',
      items: ['PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'GCP', 'AWS', 'Supabase']
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services (AWS)',
      date: 'Jan 2024'
    },
    {
      name: 'Professional Cloud Architect',
      issuer: 'Google Cloud Platform (GCP)',
      date: 'Aug 2023'
    }
  ],
  achievements: [
    {
      title: 'Winner of Smart India Hackathon 2023',
      description: 'Led a team of 6 engineers to build an AI-powered smart energy optimization grid solution, winning the top prize out of 500+ competing institutions.'
    },
    {
      title: 'Published IEEE Conference Paper (2022)',
      description: 'Co-authored and published research on "High-Throughput Distributed Stream Clustering Models" for real-time sensor array networks.'
    }
  ],
  additionalInfo: {
    languages: 'English (Fluent), Telugu (Native), Hindi (Conversational)',
    interests: 'Open Source Contribution, Photography, Amateur Astronomy, Chess'
  }
};

function cleanValue(val: any): string {
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

// Helper function to safely sanitize and guarantee default fallbacks for all fields
export function sanitizeResumeData(data: any): ResumeData {
  const cleanStr = (val: any) => cleanValue(val);

  const cleanExperience = (expList: any[]) => {
    return (expList || [])
      .map((exp: any) => {
        const role = cleanStr(exp?.role);
        const company = cleanStr(exp?.company);
        const duration = cleanStr(exp?.duration);
        const location = cleanStr(exp?.location);
        const bullets = (exp?.bullets || []).map((b: any) => cleanStr(b)).filter(Boolean);
        
        if (!role && !company && !duration && !location && bullets.length === 0) {
          return null;
        }
        return { role, company, duration, location, bullets };
      })
      .filter(Boolean) as any[];
  };

  const cleanEducation = (eduList: any[]) => {
    return (eduList || [])
      .map((edu: any) => {
        const degree = cleanStr(edu?.degree);
        const school = cleanStr(edu?.school);
        const duration = cleanStr(edu?.duration);
        const details = cleanStr(edu?.details);
        
        if (!degree && !school && !duration && !details) {
          return null;
        }
        return { degree, school, duration, details };
      })
      .filter(Boolean) as any[];
  };

  const cleanProjects = (projList: any[]) => {
    return (projList || [])
      .map((proj: any) => {
        const name = cleanStr(proj?.name);
        const technologies = (proj?.technologies || []).map((t: any) => cleanStr(t)).filter(Boolean);
        const description = cleanStr(proj?.description);
        const bullets = (proj?.bullets || []).map((b: any) => cleanStr(b)).filter(Boolean);
        
        if (!name && !description && technologies.length === 0 && bullets.length === 0) {
          return null;
        }
        return { name, technologies, description, bullets };
      })
      .filter(Boolean) as any[];
  };

  const cleanSkills = (skillsList: any[]) => {
    return (skillsList || [])
      .map((skill: any) => {
        const category = cleanStr(skill?.category);
        const items = (skill?.items || []).map((i: any) => cleanStr(i)).filter(Boolean);
        if (!category && items.length === 0) {
          return null;
        }
        return { category, items };
      })
      .filter(Boolean) as any[];
  };

  const cleanCertifications = (certList: any[]) => {
    return (certList || [])
      .map((cert: any) => {
        const name = cleanStr(cert?.name);
        const issuer = cleanStr(cert?.issuer);
        const date = cleanStr(cert?.date);
        if (!name && !issuer && !date) {
          return null;
        }
        return { name, issuer, date };
      })
      .filter(Boolean) as any[];
  };

  const cleanAchievements = (achList: any[]) => {
    return (achList || [])
      .map((ach: any) => {
        const title = cleanStr(ach?.title);
        const description = cleanStr(ach?.description);
        if (!title && !description) {
          return null;
        }
        return { title, description };
      })
      .filter(Boolean) as any[];
  };

  return {
    personalInfo: {
      fullName: cleanStr(data?.personalInfo?.fullName),
      title: cleanStr(data?.personalInfo?.title),
      email: cleanStr(data?.personalInfo?.email),
      phone: cleanStr(data?.personalInfo?.phone),
      location: cleanStr(data?.personalInfo?.location),
      website: cleanStr(data?.personalInfo?.website),
      github: cleanStr(data?.personalInfo?.github),
      linkedin: cleanStr(data?.personalInfo?.linkedin),
      summary: cleanStr(data?.personalInfo?.summary),
    },
    experience: cleanExperience(data?.experience),
    education: cleanEducation(data?.education),
    projects: cleanProjects(data?.projects),
    skills: cleanSkills(data?.skills),
    certifications: cleanCertifications(data?.certifications),
    achievements: cleanAchievements(data?.achievements),
    additionalInfo: {
      languages: cleanStr(data?.additionalInfo?.languages),
      interests: cleanStr(data?.additionalInfo?.interests),
    },
    customization: {
      fontFamily: data?.customization?.fontFamily || 'Inter',
      fontSize: data?.customization?.fontSize || 'medium',
      density: data?.customization?.density || 'balanced',
      primaryColor: data?.customization?.primaryColor || '#0f172a',
      visibleSections: Array.isArray(data?.customization?.visibleSections)
        ? data.customization.visibleSections
        : ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'],
      sectionOrder: Array.isArray(data?.customization?.sectionOrder)
        ? data.customization.sectionOrder
        : ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo']
    }
  };
}

interface TemplateRendererProps {
  templateId: string;
  data?: ResumeData;
  zoom?: number; // 50 to 150 (percentage scale)
}

export default function TemplateRenderer({ 
  templateId, 
  data = defaultSampleData, 
  zoom = 105 
}: TemplateRendererProps) {
  const scale = zoom / 100;
  const safeData = sanitizeResumeData(data);
  const customization = safeData.customization || {};

  // Internal mapping values
  const fontFamilies: Record<string, string> = {
    'Inter': 'var(--font-inter)',
    'Geist': 'var(--font-geist)',
    'Poppins': 'var(--font-poppins)',
    'Manrope': 'var(--font-manrope)',
    'Source Sans 3': 'var(--font-source-sans)',
    'IBM Plex Sans': 'var(--font-ibm-plex)',
    'Plus Jakarta Sans': 'var(--font-plus-jakarta)',
    'Lato': 'var(--font-lato)'
  };
  const fontSizes: Record<string, string> = {
    'small': '10.5px',
    'medium': '11.5px',
    'large': '12.5px',
    'extraLarge': '13.5px'
  };
  const densityConfigs: Record<string, { padding: string; paddingInner: string; sectionMargin: string; gap: string; elementSpacing: string }> = {
    'compact': {
      padding: '1.25rem',
      paddingInner: '0.85rem',
      sectionMargin: '0.4rem',
      gap: '0.75rem',
      elementSpacing: '0.2rem'
    },
    'balanced': {
      padding: '2.75rem',
      paddingInner: '1.75rem',
      sectionMargin: '0.95rem',
      gap: '1.5rem',
      elementSpacing: '0.45rem'
    },
    'spacious': {
      padding: '4rem',
      paddingInner: '2.5rem',
      sectionMargin: '1.6rem',
      gap: '2.25rem',
      elementSpacing: '0.75rem'
    }
  };

  const density = densityConfigs[customization.density || 'balanced'] || densityConfigs.balanced;
  const fontFamilyValue = fontFamilies[customization.fontFamily || 'Inter'] || 'var(--font-inter)';
  const fontSizeValue = fontSizes[customization.fontSize || 'medium'] || '11.5px';
  const primaryColorValue = customization.primaryColor || '#0f172a';

  const dynamicCss = `
    .resume-preview-container-${templateId} {
      font-family: ${fontFamilyValue} !important;
      font-size: ${fontSizeValue} !important;
      --resume-padding: ${density.padding} !important;
      --resume-padding-inner: ${density.paddingInner} !important;
      --resume-section-margin: ${density.sectionMargin} !important;
      --resume-gap: ${density.gap} !important;
      --resume-element-spacing: ${density.elementSpacing} !important;
    }
    .resume-preview-container-${templateId} * {
      font-family: ${fontFamilyValue} !important;
    }
    .resume-preview-container-${templateId} p,
    .resume-preview-container-${templateId} li,
    .resume-preview-container-${templateId} span,
    .resume-preview-container-${templateId} div {
      font-size: ${fontSizeValue} !important;
      line-height: ${customization.density === 'compact' ? '1.25' : customization.density === 'spacious' ? '1.6' : '1.45'} !important;
    }
    .resume-preview-container-${templateId} h1 {
      font-size: calc(${fontSizeValue} * 2.2) !important;
    }
    .resume-preview-container-${templateId} h2 {
      font-size: calc(${fontSizeValue} * 1.25) !important;
      color: ${primaryColorValue} !important;
      border-color: ${primaryColorValue} !important;
    }
    .resume-preview-container-${templateId} h3,
    .resume-preview-container-${templateId} h4 {
      font-size: calc(${fontSizeValue} * 1.05) !important;
    }

    /* Padding overrides */
    .resume-preview-container-${templateId} .p-5,
    .resume-preview-container-${templateId} .p-6,
    .resume-preview-container-${templateId} .p-8,
    .resume-preview-container-${templateId} .p-10,
    .resume-preview-container-${templateId} .p-12,
    .resume-preview-container-${templateId} .p-14 {
      padding: var(--resume-padding) !important;
    }

    .resume-preview-container-${templateId} .p-8.w-\\[30\\%\\],
    .resume-preview-container-${templateId} .p-8.w-\\[33\\%\\],
    .resume-preview-container-${templateId} .pr-6 {
      padding: var(--resume-padding-inner) !important;
    }

    /* Density spacing overrides for px-12, p-3, p-3.5, p-4 and mb-2.5 */
    .resume-preview-container-${templateId} .px-12 {
      padding-left: var(--resume-padding) !important;
      padding-right: var(--resume-padding) !important;
    }

    .resume-preview-container-${templateId} .p-3,
    .resume-preview-container-${templateId} .p-3\\.5,
    .resume-preview-container-${templateId} .p-4 {
      padding: calc(var(--resume-padding) * 0.4) !important;
    }

    .resume-preview-container-${templateId} .mb-2\\.5 {
      margin-bottom: calc(var(--resume-section-margin) * 0.4) !important;
    }

    /* Flex gap and padding defaults */
    .resume-preview-container-${templateId} .gap-8 {
      gap: var(--resume-gap) !important;
    }

    .resume-preview-container-${templateId} .gap-6 {
      gap: calc(var(--resume-gap) * 0.75) !important;
    }

    .resume-preview-container-${templateId} .gap-4 {
      gap: calc(var(--resume-gap) * 0.5) !important;
    }

    /* Section margin overrides */
    .resume-preview-container-${templateId} .resume-section,
    .resume-preview-container-${templateId} .mb-1.5,
    .resume-preview-container-${templateId} .mb-2,
    .resume-preview-container-${templateId} .mb-3,
    .resume-preview-container-${templateId} .mb-4,
    .resume-preview-container-${templateId} .mb-5,
    .resume-preview-container-${templateId} .mb-6,
    .resume-preview-container-${templateId} .mb-8 {
      margin-bottom: var(--resume-section-margin) !important;
    }

    /* Space-Y layout overrides */
    .resume-preview-container-${templateId} .space-y-6 > :not([hidden]) ~ :not([hidden]) {
      margin-top: var(--resume-section-margin) !important;
    }
    .resume-preview-container-${templateId} .space-y-4 > :not([hidden]) ~ :not([hidden]) {
      margin-top: calc(var(--resume-section-margin) * 0.7) !important;
    }
    .resume-preview-container-${templateId} .space-y-3 > :not([hidden]) ~ :not([hidden]) {
      margin-top: calc(var(--resume-section-margin) * 0.5) !important;
    }
    .resume-preview-container-${templateId} .space-y-2 > :not([hidden]) ~ :not([hidden]) {
      margin-top: var(--resume-element-spacing) !important;
    }
    .resume-preview-container-${templateId} .space-y-1.5 > :not([hidden]) ~ :not([hidden]) {
      margin-top: calc(var(--resume-element-spacing) * 0.75) !important;
    }
    .resume-preview-container-${templateId} .space-y-1 > :not([hidden]) ~ :not([hidden]) {
      margin-top: calc(var(--resume-element-spacing) * 0.5) !important;
    }
    .resume-preview-container-${templateId} .space-y-0.5 > :not([hidden]) ~ :not([hidden]) {
      margin-top: calc(var(--resume-element-spacing) * 0.25) !important;
    }

    /* Theme Color Customization Overrides */
    .resume-preview-container-${templateId} .text-teal-600,
    .resume-preview-container-${templateId} .text-indigo-600,
    .resume-preview-container-${templateId} .text-indigo-700,
    .resume-preview-container-${templateId} .text-indigo-655,
    .resume-preview-container-${templateId} .text-indigo-650,
    .resume-preview-container-${templateId} .text-rose-450,
    .resume-preview-container-${templateId} .text-rose-500,
    .resume-preview-container-${templateId} .text-rose-600,
    .resume-preview-container-${templateId} .text-emerald-655,
    .resume-preview-container-${templateId} .text-emerald-600,
    .resume-preview-container-${templateId} .text-emerald-700,
    .resume-preview-container-${templateId} .text-emerald-800,
    .resume-preview-container-${templateId} .text-purple-700,
    .resume-preview-container-${templateId} .text-purple-800,
    .resume-preview-container-${templateId} .text-amber-705,
    .resume-preview-container-${templateId} .text-amber-700,
    .resume-preview-container-${templateId} .text-amber-800,
    .resume-preview-container-${templateId} .text-amber-850 {
      color: ${primaryColorValue} !important;
    }

    .resume-preview-container-${templateId} .border-teal-500,
    .resume-preview-container-${templateId} .border-indigo-100,
    .resume-preview-container-${templateId} .border-indigo-600,
    .resume-preview-container-${templateId} .border-rose-500\\/50,
    .resume-preview-container-${templateId} .border-emerald-500,
    .resume-preview-container-${templateId} .border-emerald-100,
    .resume-preview-container-${templateId} .border-indigo-100\\/50,
    .resume-preview-container-${templateId} .border-indigo-100\\/30,
    .resume-preview-container-${templateId} .border-purple-100\\/50 {
      border-color: ${primaryColorValue}77 !important;
    }

    .resume-preview-container-${templateId} .bg-indigo-50,
    .resume-preview-container-${templateId} .bg-indigo-50\\/50,
    .resume-preview-container-${templateId} .bg-rose-50,
    .resume-preview-container-${templateId} .bg-emerald-50,
    .resume-preview-container-${templateId} .bg-purple-50\\/40,
    .resume-preview-container-${templateId} .bg-purple-50 {
      background-color: ${primaryColorValue}15 !important;
    }

    .resume-preview-container-${templateId} .bg-gradient-to-r {
      background-image: linear-gradient(to right, ${primaryColorValue}, ${primaryColorValue}cc) !important;
    }

    .resume-preview-container-${templateId} .bg-gradient-to-tr {
      background-image: linear-gradient(to top right, ${primaryColorValue}, ${primaryColorValue}aa) !important;
    }
  `;

  const renderLayout = () => {
    switch (templateId) {
      case 'ats-professional':
        return <ATSProfessional data={safeData} />;
      case 'tech-minimal':
        return <TechMinimal data={safeData} />;
      case 'silicon-valley':
        return <SiliconValley data={safeData} />;
      case 'modern-gradient':
        return <ModernGradient data={safeData} />;
      case 'executive-pro':
        return <ExecutivePro data={safeData} />;
      case 'creative-portfolio':
        return <CreativePortfolio data={safeData} />;
      case 'clean-academic':
        return <CleanAcademic data={safeData} />;
      case 'impact-startup':
        return <ImpactStartup data={safeData} />;
      case 'faang-elite':
        return <FAANGElite data={safeData} />;
      case 'one-page-compact':
        return <OnePageCompact data={safeData} />;
      case 'modern-two-column':
        return <ModernTwoColumn data={safeData} />;
      case 'product-manager-pro':
        return <ProductManagerPro data={safeData} />;
      default:
        return <ATSProfessional data={safeData} />;
    }
  };

  return (
    <div 
      className={`bg-white text-slate-800 shadow-xl overflow-hidden select-none border border-slate-200/50 relative transition-transform duration-200 resume-preview-container-${templateId}`}
      style={{
        width: '794px', // A4 Width at 72 DPI
        minHeight: '1123px', // A4 Height
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        margin: '0 auto',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />
      {renderLayout()}
    </div>
  );
}

/* -------------------------------------------------------------------------
   1. ATS PROFESSIONAL TEMPLATE (Single Column - Maps sectionOrder)
   ------------------------------------------------------------------------- */
function ATSProfessional({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const renderSection = (sec: string) => {
    if (!isVisible(sec)) return null;

    switch (sec) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div className="mb-5 resume-section" key="summary">
            <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-2">Professional Summary</h2>
            <p className="text-justify">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div className="mb-5 resume-section" key="experience">
            <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-2">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold">
                    <span>{exp.role && exp.company ? `${exp.role} — ${exp.company}` : (exp.role || exp.company)}</span>
                    <span>{exp.duration}</span>
                  </div>
                  {exp.location && <div className="text-slate-600 italic text-[10px] mb-1">{exp.location}</div>}
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div className="mb-5 resume-section" key="projects">
            <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-2">Projects</h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold">
                    <span>{proj.name} ({proj.technologies.join(', ')})</span>
                  </div>
                  <p className="mt-0.5 text-justify">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div className="mb-5 resume-section" key="skills">
            <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-2">Technical Skills</h2>
            <div className="space-y-1">
              {data.skills.map((skill, idx) => (
                <div key={idx}>
                  <span className="font-bold">{skill.category}:</span> {skill.items.join(', ')}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="mb-5 resume-section" key="education">
            <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-2">Education</h2>
            <div className="space-y-2">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    {edu.degree && edu.school ? <><span className="font-bold">{edu.degree}</span> - {edu.school}</> : <span className="font-bold">{edu.degree || edu.school}</span>}
                    {edu.details && <div className="text-slate-600 text-[10px]">{edu.details}</div>}
                  </div>
                  <span className="font-bold">{edu.duration}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div className="mb-5 resume-section" key="certifications">
            <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-2">Certifications</h2>
            <div className="space-y-1">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><span className="font-bold">{cert.name}</span>{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
                  <span className="font-bold">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div className="mb-5 resume-section" key="achievements">
            <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-2">Achievements</h2>
            <div className="space-y-1">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-justify">
                  <span className="font-bold">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div className="mb-5 resume-section" key="additionalInfo">
            <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-2">Additional Information</h2>
            <div className="space-y-1">
              {data.additionalInfo.languages && (
                <div>
                  <span className="font-bold">Languages:</span> {data.additionalInfo.languages}
                </div>
              )}
              {data.additionalInfo.interests && (
                <div>
                  <span className="font-bold">Interests:</span> {data.additionalInfo.interests}
                </div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-12 font-serif text-[11px] leading-relaxed text-black">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">{data.personalInfo.fullName}</h1>
        <p className="text-[12px] italic text-slate-700 mb-2">{data.personalInfo.title}</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-600 text-[10px]">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.website && (
            <>
              <span>•</span>
              <span>{data.personalInfo.website}</span>
            </>
          )}
        </div>
      </div>

      {sectionOrder.map(sec => renderSection(sec))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   2. TECH MINIMAL TEMPLATE (Two Column - Sorted sidebar and body)
   ------------------------------------------------------------------------- */
function TechMinimal({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const leftSections = ['skills', 'education'].filter(isVisible);
  leftSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const rightSections = ['summary', 'experience', 'projects', 'certifications', 'achievements', 'additionalInfo'].filter(isVisible);
  rightSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const renderSection = (sec: string) => {
    switch (sec) {
      case 'skills':
        return data.skills.length > 0 ? (
          <div className="space-y-4" key="skills">
            <h3 className="text-xs font-bold text-slate-900 border-b-2 border-teal-500 pb-1 uppercase tracking-wider">// SKILLS</h3>
            {data.skills.map((cat, idx) => (
              <div key={idx}>
                <h4 className="font-semibold text-slate-800 mb-1">{cat.category}</h4>
                <div className="flex flex-wrap gap-1">
                  {cat.items.map((skill, sIdx) => (
                    <span key={sIdx} className="bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px] text-slate-700">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="space-y-3" key="education">
            <h3 className="text-xs font-bold text-slate-900 border-b-2 border-teal-500 pb-1 uppercase tracking-wider">// EDUCATION</h3>
            {data.education.map((edu, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-slate-800 text-[10px]">{edu.school}</div>
                <div className="text-slate-600 text-[9.5px]">{edu.degree}</div>
                <div className="text-teal-600 text-[9.5px] font-semibold">{edu.duration}</div>
              </div>
            ))}
          </div>
        ) : null;

      case 'summary':
        return data.personalInfo.summary ? (
          <div key="summary">
            <h3 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">// SUMMARY</h3>
            <p className="mt-2 text-justify text-[10px]">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div key="experience">
            <h3 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">// WORK EXPERIENCE</h3>
            <div className="mt-3 space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{exp.role}</span>
                    <span className="text-teal-600 font-semibold">{exp.duration}</span>
                  </div>
                  {exp.company || exp.location ? <div className="text-slate-500 text-[9.5px]">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div> : null}
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-[9.5px]">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div key="projects">
            <h3 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">// KEY PROJECTS</h3>
            <div className="mt-3 space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-bold text-slate-900">{proj.name}</div>
                  <div className="text-[9px] text-teal-600 font-semibold">[{proj.technologies.join(' / ')}]</div>
                  <p className="text-[9.5px] text-justify">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div key="certifications">
            <h3 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">// CERTIFICATIONS</h3>
            <div className="mt-3 space-y-1.5 text-[9.5px]">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="font-bold">{cert.name}</span>
                  <span className="text-teal-600 font-semibold">{cert.issuer} ({cert.date})</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div key="achievements">
            <h3 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">// KEY ACHIEVEMENTS</h3>
            <div className="mt-3 space-y-1.5 text-[9.5px]">
              {data.achievements.map((ach, idx) => (
                <div key={idx}>
                  <span className="font-bold">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div key="additionalInfo">
            <h3 className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-wider">// ADDITIONAL INFO</h3>
            <div className="mt-3 space-y-1.5 text-[9.5px]">
              {data.additionalInfo.languages && (
                <div><span className="font-bold">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-10 font-mono text-[10.5px] leading-relaxed text-slate-800 flex gap-8">
      {/* Left Sidebar (35%) */}
      <div className="w-[35%] border-r border-slate-200 pr-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-indigo-955 uppercase mb-1">{data.personalInfo.fullName}</h1>
          <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">{data.personalInfo.title}</p>
        </div>

        {/* Contact info */}
        <div className="space-y-2 text-[10px] text-slate-600">
          <div className="flex items-center gap-2"><Mail size={12} className="text-teal-600" /> <span className="break-all">{data.personalInfo.email}</span></div>
          <div className="flex items-center gap-2"><Phone size={12} className="text-teal-600" /> <span>{data.personalInfo.phone}</span></div>
          <div className="flex items-center gap-2"><MapPin size={12} className="text-teal-600" /> <span>{data.personalInfo.location}</span></div>
          {data.personalInfo.github && <div className="flex items-center gap-2"><GithubIcon className="text-teal-600 h-3 w-3" /> <span>{data.personalInfo.github}</span></div>}
          {data.personalInfo.linkedin && <div className="flex items-center gap-2"><LinkedinIcon className="text-teal-600 h-3 w-3" /> <span>{data.personalInfo.linkedin}</span></div>}
        </div>

        {leftSections.map(sec => renderSection(sec))}
      </div>

      {/* Right Content (65%) */}
      <div className="w-[65%] flex flex-col gap-6">
        {rightSections.map(sec => renderSection(sec))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   3. SILICON VALLEY TEMPLATE (Single Column - Maps sectionOrder)
   ------------------------------------------------------------------------- */
function SiliconValley({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const renderSection = (sec: string) => {
    if (!isVisible(sec)) return null;

    switch (sec) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100" key="summary">
            <p className="text-justify italic text-slate-700">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div className="mb-6" key="experience">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Professional Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="font-bold text-slate-955 text-[12px]">{exp.role}</span>
                      <span className="text-slate-400 mx-2">|</span>
                      <span className="text-slate-700 font-medium">{exp.company}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] font-semibold">{exp.duration}</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div className="mb-6" key="skills">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Technical Skills</h2>
            <div className="space-y-2">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 w-24 shrink-0">{skill.category}:</span>
                  <div className="flex flex-wrap gap-1">
                    {skill.items.map((item, iIdx) => (
                      <span key={iIdx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-medium border border-indigo-100/50">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="mb-6" key="education">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-955">{edu.school}</div>
                  <div className="text-slate-600 text-[10px]">{edu.degree}</div>
                  <div className="text-indigo-600 text-[9px] font-semibold mt-0.5">{edu.duration}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div className="mb-6" key="projects">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Key Projects</h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-955">{proj.name}</div>
                  <p className="text-slate-600 text-[9.5px] mt-0.5 text-justify">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div className="mb-6" key="certifications">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Certifications</h2>
            <div className="space-y-1">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><span className="font-bold text-slate-955">{cert.name}</span>{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
                  <span className="text-slate-500 font-semibold text-[10px]">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div className="mb-6" key="achievements">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Achievements</h2>
            <div className="space-y-1">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-justify">
                  <span className="font-bold text-slate-955">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div className="mb-6" key="additionalInfo">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Additional Information</h2>
            <div className="space-y-1">
              {data.additionalInfo.languages && (
                <div><span className="font-bold text-slate-955">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold text-slate-955">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-12 font-sans text-[11px] leading-relaxed text-slate-800">
      <div className="border-l-4 border-indigo-600 pl-4 mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.personalInfo.fullName}</h1>
        <p className="text-indigo-600 font-semibold tracking-wide text-xs uppercase">{data.personalInfo.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-slate-500 text-[10px]">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.website && (
            <>
              <span>•</span>
              <span>{data.personalInfo.website}</span>
            </>
          )}
        </div>
      </div>

      {sectionOrder.map(sec => renderSection(sec))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   4. MODERN GRADIENT TEMPLATE (Single Column - Maps sectionOrder)
   ------------------------------------------------------------------------- */
function ModernGradient({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const renderSection = (sec: string) => {
    if (!isVisible(sec)) return null;

    switch (sec) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div key="summary">
            <p className="text-justify text-slate-700 font-medium text-[11.5px]">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div key="experience">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-100 pb-1 mb-3 flex items-center gap-2">
              <Briefcase size={14} className="text-indigo-600" />
              <span>Work Experience</span>
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-indigo-100 hover:border-indigo-600 transition-colors">
                  <div className="absolute w-2 h-2 rounded-full bg-indigo-600 -left-[5px] top-1" />
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-slate-955 text-[11.5px]">{exp.role} <span className="text-indigo-600">@ {exp.company}</span></span>
                    <span className="text-slate-505 font-semibold text-[9.5px]">{exp.duration}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700 text-[10.5px]">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div key="projects">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-100 pb-1 mb-3 flex items-center gap-2">
              <FolderGit2 size={14} className="text-indigo-600" />
              <span>Selected Projects</span>
            </h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="bg-slate-50 hover:bg-slate-100/70 p-3 rounded-lg border border-slate-150 transition-colors">
                  <div className="font-bold text-slate-900 mb-0.5">{proj.name}</div>
                  <p className="text-slate-605 text-[10px] text-justify mb-1">{proj.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.map((tech, tIdx) => (
                      <span key={tIdx} className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[8.5px] font-medium">{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div key="skills">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-100 pb-1 mb-3 flex items-center gap-2">
              <Code2 size={14} className="text-indigo-600" />
              <span>Skills Matrix</span>
            </h2>
            <div className="space-y-2">
              {data.skills.map((skill, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-900 mb-0.5 text-[10px]">{skill.category}</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.items.map((item, iIdx) => (
                      <span key={iIdx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-medium">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div key="education">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-100 pb-1 mb-3 flex items-center gap-2">
              <GraduationCap size={14} className="text-indigo-600" />
              <span>Education</span>
            </h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-955">{edu.school}</div>
                  <div className="text-slate-600 text-[10px]">{edu.degree}</div>
                  <div className="text-slate-500 text-[9px] mt-0.5">{edu.duration}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div key="certifications">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-100 pb-1 mb-3 flex items-center gap-2">
              <Award size={14} className="text-indigo-600" />
              <span>Certifications</span>
            </h2>
            <div className="space-y-2">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between items-baseline pl-4 border-l-2 border-indigo-100">
                  <span className="font-bold text-slate-955">{cert.name} <span className="text-indigo-600">| {cert.issuer}</span></span>
                  <span className="text-slate-505 font-semibold text-[9.5px]">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div key="achievements">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-100 pb-1 mb-3 flex items-center gap-2">
              <Award size={14} className="text-indigo-600" />
              <span>Achievements</span>
            </h2>
            <div className="space-y-1.5 pl-4 border-l-2 border-indigo-100">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-slate-700">
                  <span className="font-bold text-slate-900">• {ach.title}</span>: {ach.description}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div key="additionalInfo">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-indigo-100 pb-1 mb-3 flex items-center gap-2">
              <Globe size={14} className="text-indigo-600" />
              <span>Additional Information</span>
            </h2>
            <div className="space-y-1 pl-4 border-l-2 border-indigo-100 text-slate-700">
              {data.additionalInfo.languages && (
                <div><span className="font-bold text-slate-900">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold text-slate-900">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="font-sans text-[11px] leading-relaxed text-slate-800">
      {/* Top Banner Gradient */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white p-8 px-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">{data.personalInfo.fullName}</h1>
            <p className="text-indigo-200 font-semibold text-xs tracking-wider uppercase">{data.personalInfo.title}</p>
          </div>
          <div className="text-right text-[10px] text-indigo-100 space-y-0.5">
            <div>{data.personalInfo.email}</div>
            <div>{data.personalInfo.phone}</div>
            <div>{data.personalInfo.location}</div>
          </div>
        </div>
      </div>

      <div className="p-10 px-12 space-y-6">
        {sectionOrder.map(sec => renderSection(sec))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   5. EXECUTIVE PRO TEMPLATE (Two Column - Sorted sidebar and body)
   ------------------------------------------------------------------------- */
function ExecutivePro({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const leftSections = ['experience', 'certifications', 'achievements'].filter(isVisible);
  leftSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const rightSections = ['skills', 'education', 'projects', 'additionalInfo'].filter(isVisible);
  rightSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const renderSection = (sec: string) => {
    switch (sec) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div className="mb-6" key="summary">
            <h2 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-2 font-sans tracking-wide">Executive Profile</h2>
            <p className="text-justify font-sans text-[11px] text-slate-700 leading-normal">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div key="experience">
            <h2 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-3 font-sans tracking-wide">Professional Leadership</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold font-sans text-[10.5px]">
                    <span className="text-slate-955">{exp.role}</span>
                    <span className="text-slate-600">{exp.duration}</span>
                  </div>
                  <div className="text-amber-850 italic text-[10px] font-medium mb-1.5">{exp.company}</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div key="certifications">
            <h2 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-3 font-sans tracking-wide">Certifications</h2>
            <div className="space-y-3">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-955 text-[10.5px]">{cert.name}</span>
                    {cert.issuer && <span className="text-slate-600 text-[10px]"> — {cert.issuer}</span>}
                  </div>
                  <span className="text-slate-500 font-semibold text-[9.5px]">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div key="achievements">
            <h2 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-3 font-sans tracking-wide">Key Achievements</h2>
            <div className="space-y-2 text-slate-700">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-justify text-[10.5px]">
                  <span className="font-bold text-slate-955">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div key="skills">
            <h2 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-3 tracking-wide">Core Expertise</h2>
            <div className="space-y-3">
              {data.skills.map((skill, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-900 text-[10px] mb-1">{skill.category}</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.items.map((item, iIdx) => (
                      <span key={iIdx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 text-[9px]">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div key="education">
            <h2 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-3 tracking-wide">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-955 text-[10px]">{edu.school}</div>
                  <div className="text-slate-600 text-[9.5px]">{edu.degree}</div>
                  <div className="text-amber-800 text-[9px] font-semibold">{edu.duration}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div key="projects">
            <h2 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-3 tracking-wide">Strategic Initiatives</h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-955 text-[10px]">{proj.name}</div>
                  <p className="text-slate-600 text-[9px] text-justify leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div key="additionalInfo">
            <h2 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-3 tracking-wide">Additional Details</h2>
            <div className="space-y-2 text-[9.5px] text-slate-700">
              {data.additionalInfo.languages && (
                <div><span className="font-bold text-slate-955">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold text-slate-955">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-10 font-serif text-[11px] leading-relaxed text-slate-800">
      {/* Top Header */}
      <div className="border-b-2 border-slate-950 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-slate-955 uppercase">{data.personalInfo.fullName}</h1>
          <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-widest italic">{data.personalInfo.title}</p>
        </div>
        <div className="text-right text-[10px] text-slate-600 font-sans space-y-0.5">
          <div>{data.personalInfo.location}</div>
          <div>{data.personalInfo.phone} | {data.personalInfo.email}</div>
          {data.personalInfo.linkedin && <div>{data.personalInfo.linkedin}</div>}
        </div>
      </div>

      {isVisible('summary') && renderSection('summary')}

      <div className="flex gap-6">
        {/* Left Column (65%) */}
        <div className="w-[65%] space-y-6">
          {leftSections.map(sec => renderSection(sec))}
        </div>

        {/* Right Column (35%) */}
        <div className="w-[35%] space-y-6 font-sans">
          {rightSections.map(sec => renderSection(sec))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   6. CREATIVE PORTFOLIO TEMPLATE (Two Column - Sorted body sections)
   ------------------------------------------------------------------------- */
function CreativePortfolio({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  // Left Column has skills (sorted)
  const leftSections = ['skills'].filter(isVisible);

  // Right Column has everything else (sorted)
  const rightSections = ['summary', 'experience', 'projects', 'education', 'certifications', 'achievements', 'additionalInfo'].filter(isVisible);
  rightSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const renderSection = (sec: string) => {
    switch (sec) {
      case 'skills':
        return data.skills.length > 0 ? (
          <div className="space-y-4 border-t border-slate-800 pt-4" key="skills">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest text-rose-400">Skills</h3>
            {data.skills.map((skill, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[9px] font-bold text-slate-400">{skill.category}</div>
                <div className="flex flex-wrap gap-1">
                  {skill.items.map((item, iIdx) => (
                    <span key={iIdx} className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded text-[8px]">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null;

      case 'summary':
        return data.personalInfo.summary ? (
          <div key="summary">
            <h2 className="text-[12px] font-extrabold text-slate-900 border-b-2 border-rose-500/50 pb-1 mb-2 uppercase tracking-wide">About Me</h2>
            <p className="text-justify text-slate-600 text-[10.5px]">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div key="experience">
            <h2 className="text-[12px] font-extrabold text-slate-900 border-b-2 border-rose-500/50 pb-1 mb-3 uppercase tracking-wide">Work History</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-slate-900 text-[11px]">{exp.role} <span className="text-rose-500 font-medium">@ {exp.company}</span></span>
                    <span className="text-slate-400 text-[9px] font-semibold">{exp.duration}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[10px]">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div key="projects">
            <h2 className="text-[12px] font-extrabold text-slate-900 border-b-2 border-rose-500/50 pb-1 mb-3 uppercase tracking-wide">Recent Works</h2>
            <div className="grid grid-cols-2 gap-4">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-800 text-[10px] mb-1">{proj.name}</div>
                    <p className="text-slate-505 text-[9px] text-justify leading-relaxed">{proj.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.technologies.slice(0, 3).map((tech, tIdx) => (
                      <span key={tIdx} className="bg-rose-50 text-rose-600 px-1 py-0.5 rounded text-[8px] font-medium">{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div key="education">
            <h2 className="text-[12px] font-extrabold text-slate-900 border-b-2 border-rose-500/50 pb-1 mb-2 uppercase tracking-wide">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{edu.school}</span>
                    <div className="text-slate-500 text-[9.5px]">{edu.degree}</div>
                  </div>
                  <span className="text-slate-400 text-[9px] font-semibold">{edu.duration}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div key="certifications">
            <h2 className="text-[12px] font-extrabold text-slate-900 border-b-2 border-rose-500/50 pb-1 mb-2 uppercase tracking-wide">Certifications</h2>
            <div className="space-y-1">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><span className="font-bold text-slate-800">{cert.name}</span>{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
                  <span className="text-slate-400 text-[9px] font-semibold">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div key="achievements">
            <h2 className="text-[12px] font-extrabold text-slate-900 border-b-2 border-rose-500/50 pb-1 mb-2 uppercase tracking-wide">Key Achievements</h2>
            <div className="space-y-1">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-justify text-slate-650 text-[10px]">
                  <span className="font-bold text-slate-800">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div key="additionalInfo">
            <h2 className="text-[12px] font-extrabold text-slate-900 border-b-2 border-rose-500/50 pb-1 mb-2 uppercase tracking-wide">Additional Information</h2>
            <div className="space-y-1 text-slate-655 text-[10px]">
              {data.additionalInfo.languages && (
                <div><span className="font-bold text-slate-800">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold text-slate-800">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="font-sans text-[11px] leading-relaxed text-slate-800 flex min-h-[1123px]">
      {/* Sidebar Column (30%) */}
      <div className="w-[30%] bg-slate-900 text-slate-200 p-8 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="text-center py-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-rose-500 to-violet-500 mx-auto flex items-center justify-center font-extrabold text-white text-xl shadow-lg border border-slate-800">
              {data.personalInfo.fullName ? data.personalInfo.fullName.split(' ').map(n => n[0] || '').join('').toUpperCase() : 'CV'}
            </div>
            <h1 className="text-[14px] font-extrabold tracking-wide mt-3 text-white">{data.personalInfo.fullName}</h1>
            <p className="text-[9.5px] text-rose-400 font-semibold uppercase tracking-wider">{data.personalInfo.title}</p>
          </div>

          <div className="space-y-3 text-[9.5px] text-slate-300 border-t border-slate-800 pt-4">
            <div className="break-all">{data.personalInfo.email}</div>
            <div>{data.personalInfo.phone}</div>
            <div>{data.personalInfo.location}</div>
            {data.personalInfo.website && <div className="text-rose-400">{data.personalInfo.website}</div>}
          </div>

          {leftSections.map(sec => renderSection(sec))}
        </div>

        <div className="text-[8px] text-slate-500">
          SmartCV Design Engine
        </div>
      </div>

      {/* Main Content Column (70%) */}
      <div className="w-[70%] p-10 flex flex-col gap-6 bg-slate-50">
        {rightSections.map(sec => renderSection(sec))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   7. CLEAN ACADEMIC TEMPLATE (Single Column - Maps sectionOrder)
   ------------------------------------------------------------------------- */
function CleanAcademic({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const renderSection = (sec: string) => {
    if (!isVisible(sec)) return null;

    switch (sec) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div className="mb-6 resume-section" key="summary">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2.5">Research Statement</h2>
            <p className="text-justify italic">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="mb-6 resume-section" key="education">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2.5">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    {edu.school && edu.degree ? <><span className="font-bold">{edu.school}</span> - {edu.degree}</> : <span className="font-bold">{edu.school || edu.degree}</span>}
                    {edu.details && <p className="italic text-slate-600 text-[9.5px]">{edu.details}</p>}
                  </div>
                  <span className="italic">{edu.duration}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div className="mb-6 resume-section" key="experience">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2.5">Academic & Professional Appointments</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold">
                    <span>{exp.role}, {exp.company}</span>
                    <span className="font-normal italic">{exp.duration}</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-800">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div className="mb-6 resume-section" key="projects">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2.5">Research Projects & Implementations</h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold">{proj.name}</div>
                  <div className="text-slate-600 italic text-[9.5px] mb-0.5">Stack: {proj.technologies.join(', ')}</div>
                  <p className="text-justify">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div className="mb-6 resume-section" key="skills">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2.5">Methodology & Skillset</h2>
            <div className="space-y-1">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="font-bold w-32 shrink-0">{skill.category}:</span>
                  <span>{skill.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div className="mb-6 resume-section" key="certifications">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2.5">Certifications</h2>
            <div className="space-y-2">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><span className="font-bold">{cert.name}</span>{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
                  <span className="italic">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div className="mb-6 resume-section" key="achievements">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2.5">Honors & Awards</h2>
            <div className="space-y-1">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-justify">
                  <span className="font-bold">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div className="mb-6 resume-section" key="additionalInfo">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2.5">Additional Information</h2>
            <div className="space-y-1">
              {data.additionalInfo.languages && (
                <div><span className="font-bold">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-14 font-serif text-[11px] leading-relaxed text-black">
      {/* Centered Name */}
      <div className="text-center mb-8">
        <h1 className="text-2xl tracking-wide font-normal mb-1">{data.personalInfo.fullName}</h1>
        <p className="text-[10px] text-slate-700 tracking-widest uppercase mb-3">{data.personalInfo.title}</p>
        <div className="text-[9.5px] text-slate-600 space-x-2">
          <span>{data.personalInfo.location}</span>
          <span>•</span>
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
        </div>
      </div>

      {sectionOrder.map(sec => renderSection(sec))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   8. IMPACT STARTUP TEMPLATE (Single Column - Maps sectionOrder)
   ------------------------------------------------------------------------- */
function ImpactStartup({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const renderSection = (sec: string) => {
    if (!isVisible(sec)) return null;

    switch (sec) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div className="mb-6" key="summary">
            <h2 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider mb-2">Core Profile</h2>
            <p className="text-justify text-slate-600">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div className="mb-6" key="experience">
            <h2 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider mb-3">Key Impact Roles</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-slate-900 text-[11.5px]">{exp.role} @ <span className="text-emerald-600">{exp.company}</span></span>
                    <span className="text-slate-505 font-semibold text-[9.5px]">{exp.duration}</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div className="mb-6" key="skills">
            <h2 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider mb-3">Skillsets</h2>
            <div className="space-y-2">
              {data.skills.map((skill, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-900 text-[9.5px]">{skill.category}</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {skill.items.map((item, iIdx) => (
                      <span key={iIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[8.5px] font-medium">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div className="mb-6" key="projects">
            <h2 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider mb-3">Key Projects</h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-900">{proj.name}</div>
                  <p className="text-slate-500 text-[9.5px] text-justify mt-0.5 leading-normal">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="mb-6" key="education">
            <h2 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider mb-3">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-900">{edu.school}</div>
                  <div className="text-slate-500 text-[9.5px]">{edu.degree}</div>
                  <div className="text-emerald-600 font-semibold text-[9px]">{edu.duration}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div className="mb-6" key="certifications">
            <h2 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider mb-3">Certifications</h2>
            <div className="space-y-2">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between items-baseline">
                  <span><span className="font-bold text-slate-900">{cert.name}</span>{cert.issuer ? <> — <span className="text-slate-655">{cert.issuer}</span></> : ''}</span>
                  <span className="text-emerald-600 font-semibold text-[9.5px]">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div className="mb-6" key="achievements">
            <h2 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider mb-3">Key Achievements</h2>
            <div className="space-y-1.5 text-slate-655">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-justify text-[10px]">
                  <span className="font-bold text-slate-900">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div className="mb-6" key="additionalInfo">
            <h2 className="text-xs font-black text-slate-900 border-l-4 border-emerald-500 pl-2 uppercase tracking-wider mb-3">Additional Details</h2>
            <div className="space-y-1.5 text-slate-600">
              {data.additionalInfo.languages && (
                <div><span className="font-bold text-slate-900">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold text-slate-900">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-10 font-sans text-[11px] leading-relaxed text-slate-800">
      {/* Top Banner */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.personalInfo.fullName}</h1>
          <p className="text-emerald-600 font-bold tracking-wide uppercase text-xs mt-0.5">{data.personalInfo.title}</p>
        </div>
        <div className="text-right text-[10px] text-slate-505 bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <div>{data.personalInfo.email}</div>
          <div>{data.personalInfo.phone}</div>
          <div>{data.personalInfo.location}</div>
        </div>
      </div>

      {/* Impact Metric Header */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
          <div className="text-lg font-black text-emerald-700">45%</div>
          <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">Performance Lift</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
          <div className="text-lg font-black text-emerald-700">10M+</div>
          <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">Data Events Managed</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
          <div className="text-lg font-black text-emerald-700">6+ Yrs</div>
          <div className="text-[9px] font-bold text-emerald-800 uppercase tracking-wide">Systems Architecture</div>
        </div>
      </div>

      {sectionOrder.map(sec => renderSection(sec))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   9. FAANG ELITE TEMPLATE (Single Column - Maps sectionOrder)
   ------------------------------------------------------------------------- */
function FAANGElite({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const renderSection = (sec: string) => {
    if (!isVisible(sec)) return null;

    switch (sec) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div className="mb-4 resume-section" key="summary">
            <p className="text-justify text-[10px] leading-relaxed text-slate-800">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div className="mb-4 resume-section" key="experience">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">Work Experience</h2>
            <div className="space-y-3">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold">
                    <span>{exp.company && exp.role ? `${exp.company} — ${exp.role}` : (exp.company || exp.role)}</span>
                    <span className="font-semibold text-slate-600">{exp.duration}</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 mt-0.5">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify text-[10px]">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div className="mb-4 resume-section" key="projects">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">Key Engineering Projects</h2>
            <div className="space-y-2">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold">{proj.name}{proj.technologies && proj.technologies.length > 0 ? <> — <span className="font-normal italic text-slate-605">{proj.technologies.join(', ')}</span></> : ''}</div>
                  <p className="text-[10px] mt-0.5 text-justify leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div className="mb-4 resume-section" key="skills">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">Technical Skills</h2>
            <div className="space-y-0.5">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="text-[10px]">
                  <span className="font-bold">{skill.category}:</span> {skill.items.join(', ')}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="mb-4 resume-section" key="education">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">Education</h2>
            <div className="space-y-1">
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    {edu.school && edu.degree ? <><span className="font-bold">{edu.school}</span> — <span className="italic">{edu.degree}</span></> : <span className="font-bold">{edu.school || edu.degree}</span>}
                    {edu.details && <span className="text-slate-600 text-[9.5px] ml-2">({edu.details})</span>}
                  </div>
                  <span className="font-semibold text-slate-600">{edu.duration}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div className="mb-4 resume-section" key="certifications">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">Certifications</h2>
            <div className="space-y-1">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><span className="font-bold">{cert.name}</span>{cert.issuer ? <> — <span className="italic">{cert.issuer}</span></> : ''}</span>
                  <span className="font-semibold text-slate-600">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div className="mb-4 resume-section" key="achievements">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">Honors & Awards</h2>
            <div className="space-y-0.5">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-[10px]">
                  <span className="font-bold">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div className="mb-4 resume-section" key="additionalInfo">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-900 pb-0.5 mb-2">Additional Information</h2>
            <div className="space-y-0.5 text-[10px]">
              {data.additionalInfo.languages && (
                <div><span className="font-bold">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-10 px-12 font-sans text-[10.5px] leading-[1.35] text-black">
      {/* Centered clean header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-tight mb-0.5">{data.personalInfo.fullName}</h1>
        <div className="flex justify-center gap-x-3 text-[10px] text-slate-700">
          <span>{data.personalInfo.email}</span>
          <span>|</span>
          <span>{data.personalInfo.phone}</span>
          <span>|</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>|</span>
              <span>{data.personalInfo.linkedin}</span>
            </>
          )}
        </div>
      </div>

      {sectionOrder.map(sec => renderSection(sec))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   10. ONE PAGE COMPACT TEMPLATE (Two Column - Sorted columns)
   ------------------------------------------------------------------------- */
function OnePageCompact({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const leftSections = ['skills', 'education'].filter(isVisible);
  leftSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const rightSections = ['summary', 'experience', 'projects', 'certifications', 'achievements', 'additionalInfo'].filter(isVisible);
  rightSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const renderSection = (sec: string) => {
    switch (sec) {
      case 'skills':
        return data.skills.length > 0 ? (
          <div className="space-y-3" key="skills">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[9px]">Skills</h4>
            {data.skills.map((skill, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[8.5px] font-bold text-slate-500 uppercase">{skill.category}</div>
                <div className="flex flex-wrap gap-0.5">
                  {skill.items.map((item, iIdx) => (
                    <span key={iIdx} className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded text-[8px]">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="space-y-2" key="education">
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-[9px]">Education</h4>
            {data.education.map((edu, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-slate-900 text-[9px] leading-tight">{edu.school}</div>
                <div className="text-slate-500 text-[8.5px]">{edu.degree}</div>
                <div className="text-slate-400 text-[8px] italic">{edu.duration}</div>
              </div>
            ))}
          </div>
        ) : null;

      case 'summary':
        return data.personalInfo.summary ? (
          <div key="summary">
            <h3 className="font-black text-slate-900 border-b border-slate-200 pb-0.5 uppercase tracking-wider text-[9.5px]">Overview</h3>
            <p className="mt-1.5 text-justify text-[9.5px] leading-relaxed text-slate-600">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div key="experience">
            <h3 className="font-black text-slate-900 border-b border-slate-200 pb-0.5 uppercase tracking-wider text-[9.5px]">Experience</h3>
            <div className="mt-2 space-y-3">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.role}</span>
                    <span className="font-normal text-slate-505 text-[8.5px]">{exp.duration}</span>
                  </div>
                  <div className="text-slate-400 font-semibold text-[8.5px]">{exp.company}</div>
                  <ul className="list-disc pl-4 space-y-0.5 mt-1 text-slate-600 text-[9px]">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div key="projects">
            <h3 className="font-black text-slate-900 border-b border-slate-200 pb-0.5 uppercase tracking-wider text-[9.5px]">Selected Projects</h3>
            <div className="mt-2 space-y-2">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-[9.5px]">{proj.name}</div>
                  <p className="text-slate-605 text-[9px] text-justify">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div key="certifications">
            <h3 className="font-black text-slate-900 border-b border-slate-200 pb-0.5 uppercase tracking-wider text-[9.5px]">Certifications</h3>
            <div className="mt-2 space-y-1">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between text-[8.5px]">
                  <span><span className="font-bold">{cert.name}</span>{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
                  <span className="text-slate-500 font-semibold">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div key="achievements">
            <h3 className="font-black text-slate-900 border-b border-slate-200 pb-0.5 uppercase tracking-wider text-[9.5px]">Achievements</h3>
            <div className="mt-2 space-y-0.5 text-[8.5px] text-slate-600">
              {data.achievements.map((ach, idx) => (
                <div key={idx}>
                  <span className="font-bold text-slate-900">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div key="additionalInfo">
            <h3 className="font-black text-slate-900 border-b border-slate-200 pb-0.5 uppercase tracking-wider text-[9.5px]">Additional Details</h3>
            <div className="mt-2 space-y-0.5 text-[8.5px] text-slate-600">
              {data.additionalInfo.languages && (
                <div><span className="font-bold text-slate-900">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold text-slate-900">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-8 font-sans text-[10px] leading-[1.3] text-slate-800 flex gap-6">
      {/* Left Sidebar (30%) */}
      <div className="w-[30%] space-y-4">
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">{data.personalInfo.fullName}</h1>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{data.personalInfo.title}</p>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 text-[9px] border-t border-slate-200 pt-3">
          <div className="text-slate-600 break-all">{data.personalInfo.email}</div>
          <div>{data.personalInfo.phone}</div>
          <div>{data.personalInfo.location}</div>
        </div>

        {leftSections.map(sec => renderSection(sec))}
      </div>

      {/* Right Content Column (70%) */}
      <div className="w-[70%] space-y-4">
        {rightSections.map(sec => renderSection(sec))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   11. MODERN TWO COLUMN TEMPLATE (Two Column - Sorted columns)
   ------------------------------------------------------------------------- */
function ModernTwoColumn({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const leftSections = ['skills', 'education', 'certifications', 'additionalInfo'].filter(isVisible);
  leftSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const rightSections = ['summary', 'experience', 'projects', 'achievements'].filter(isVisible);
  rightSections.sort((a, b) => sectionOrder.indexOf(a) - sectionOrder.indexOf(b));

  const renderSection = (sec: string) => {
    switch (sec) {
      case 'skills':
        return data.skills.length > 0 ? (
          <div className="space-y-4" key="skills">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest text-indigo-600">Skills</h3>
            {data.skills.map((skill, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-bold text-slate-800 text-[9.5px]">{skill.category}</div>
                <div className="flex flex-wrap gap-1">
                  {skill.items.map((item, iIdx) => (
                    <span key={iIdx} className="bg-indigo-50/50 text-indigo-700 px-2 py-0.5 rounded text-[8.5px] border border-indigo-100/30">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="space-y-3" key="education">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest text-indigo-600">Education</h3>
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <div className="font-bold text-slate-900 text-[10px]">{edu.school}</div>
                <div className="text-slate-600 text-[9.5px]">{edu.degree}</div>
                <div className="text-indigo-650 text-[9px] font-semibold mt-0.5">{edu.duration}</div>
              </div>
            ))}
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div className="space-y-3" key="certifications">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest text-indigo-600">Certifications</h3>
            {data.certifications.map((cert, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-slate-900 text-[10px]">{cert.name}</div>
                <div className="text-slate-600 text-[9.5px]">{cert.issuer}</div>
                <div className="text-indigo-600 text-[9px] font-semibold mt-0.5">{cert.date}</div>
              </div>
            ))}
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div className="space-y-3" key="additionalInfo">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest text-indigo-600">Additional Details</h3>
            <div className="space-y-1 text-slate-600 text-[9.5px]">
              {data.additionalInfo.languages && (
                <div><span className="font-bold text-slate-800">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold text-slate-800">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      case 'summary':
        return data.personalInfo.summary ? (
          <div key="summary">
            <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2.5 uppercase tracking-wider">Executive Summary</h2>
            <p className="text-justify text-slate-600 text-[11px]">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'experience':
        return data.experience.length > 0 ? (
          <div key="experience">
            <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mb-3.5 uppercase tracking-wider">Professional Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-[11.5px]">{exp.role} <span className="text-slate-400">@</span> {exp.company}</span>
                    <span className="text-slate-500 text-[9.5px] font-semibold">{exp.duration}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[10.5px]">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div key="projects">
            <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Key Projects</h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-bold text-slate-900 text-[11px]">{proj.name}</div>
                  <p className="text-slate-606 text-[10px] text-justify">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div key="achievements">
            <h2 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 mb-3 uppercase tracking-wider">Achievements</h2>
            <div className="space-y-2 text-[10.5px]">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="text-justify text-slate-650">
                  <span className="font-bold text-slate-900">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="font-sans text-[11px] leading-relaxed text-slate-800 flex min-h-[1123px]">
      {/* Left Sidebar (33%) */}
      <div className="w-[33%] bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">{data.personalInfo.fullName}</h1>
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-1">{data.personalInfo.title}</p>
        </div>

        {/* Contact Details */}
        <div className="space-y-2 text-[10px] text-slate-600 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-2"><Mail size={12} className="text-slate-400" /> <span className="break-all">{data.personalInfo.email}</span></div>
          <div className="flex items-center gap-2"><Phone size={12} className="text-slate-400" /> <span>{data.personalInfo.phone}</span></div>
          <div className="flex items-center gap-2"><MapPin size={12} className="text-slate-400" /> <span>{data.personalInfo.location}</span></div>
        </div>

        {leftSections.map(sec => renderSection(sec))}
      </div>

      {/* Right Content (67%) */}
      <div className="w-[67%] p-10 flex flex-col gap-6">
        {rightSections.map(sec => renderSection(sec))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   12. PRODUCT MANAGER PRO TEMPLATE (Single Column - Maps sectionOrder)
   ------------------------------------------------------------------------- */
function ProductManagerPro({ data }: { data: ResumeData }) {
  const customization = data.customization || {};
  const isVisible = (sec: string) => {
    if (!customization.visibleSections) return true;
    return customization.visibleSections.includes(sec);
  };
  const sectionOrder = customization.sectionOrder || ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'];

  const renderSection = (sec: string) => {
    if (!isVisible(sec)) return null;

    switch (sec) {
      case 'summary':
        return data.personalInfo.summary ? (
          <div className="mb-6 bg-purple-50/40 p-4 rounded-xl border border-purple-100/50" key="summary">
            <p className="text-justify text-slate-700 text-[11px] leading-relaxed">{data.personalInfo.summary}</p>
          </div>
        ) : null;

      case 'skills':
        return data.skills.length > 0 ? (
          <div className="mb-6" key="skills">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Core Competencies</h2>
            <div className="grid grid-cols-3 gap-4">
              {data.skills.map((skill, idx) => (
                <div key={idx}>
                  <div className="font-bold text-purple-800 mb-1 text-[10px]">{skill.category}</div>
                  <div className="text-[9.5px] text-slate-600">{skill.items.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6" key="skills">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Core Competencies</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-bold text-purple-800 mb-1 text-[10px]">Product Lifecycle</div>
                <div className="text-[9.5px] text-slate-600">Roadmapping, Agile/Scrum, User Research, MVP Validation</div>
              </div>
              <div>
                <div className="font-bold text-purple-800 mb-1 text-[10px]">Data & Analytics</div>
                <div className="text-[9.5px] text-slate-650">A/B Testing, SQL, Mixpanel, Metrics definition (North Star)</div>
              </div>
              <div>
                <div className="font-bold text-purple-800 mb-1 text-[10px]">Technology & Systems</div>
                <div className="text-[9.5px] text-slate-655">API integrations, System Architecture, React/Node.js familiarity</div>
              </div>
            </div>
          </div>
        );

      case 'experience':
        return data.experience.length > 0 ? (
          <div className="mb-6" key="experience">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Professional Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-slate-900 text-[12px]">{exp.role} <span className="text-purple-700">@ {exp.company}</span></span>
                    <span className="text-slate-500 font-semibold text-[10px]">{exp.duration}</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[10.5px]">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-justify">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'projects':
        return data.projects.length > 0 ? (
          <div className="mb-6" key="projects">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Strategic Initiatives</h2>
            <div className="space-y-3">
              {data.projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-900 text-[10.5px]">{proj.name}</div>
                  <p className="text-slate-650 text-[10px] text-justify mt-0.5">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'education':
        return data.education.length > 0 ? (
          <div className="mb-6" key="education">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Education & Credentials</h2>
            <div className="space-y-3">
              {data.education.map((edu, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-905 text-[10.5px]">{edu.school}</div>
                  <div className="text-slate-600 text-[9.5px]">{edu.degree}</div>
                  <div className="text-purple-700 text-[9px] font-semibold mt-0.5">{edu.duration}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'certifications':
        return data.certifications && data.certifications.length > 0 ? (
          <div className="mb-6" key="certifications">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Certifications</h2>
            <div className="space-y-1.5 text-[10px]">
              {data.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><span className="font-bold text-slate-905">{cert.name}</span>{cert.issuer ? ` — ${cert.issuer}` : ''}</span>
                  <span className="text-purple-700 font-bold">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'achievements':
        return data.achievements && data.achievements.length > 0 ? (
          <div className="mb-6" key="achievements">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Achievements</h2>
            <div className="space-y-1.5 text-[10px] text-slate-650">
              {data.achievements.map((ach, idx) => (
                <div key={idx}>
                  <span className="font-bold text-slate-905">• {ach.title}</span>{ach.description ? ` — ${ach.description}` : ''}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'additionalInfo':
        return data.additionalInfo && (data.additionalInfo.languages || data.additionalInfo.interests) ? (
          <div className="mb-6" key="additionalInfo">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">Additional Info</h2>
            <div className="space-y-1.5 text-[10px] text-slate-650">
              {data.additionalInfo.languages && (
                <div><span className="font-bold text-slate-905">Languages:</span> {data.additionalInfo.languages}</div>
              )}
              {data.additionalInfo.interests && (
                <div><span className="font-bold text-slate-955">Interests:</span> {data.additionalInfo.interests}</div>
              )}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="p-12 font-sans text-[11px] leading-relaxed text-slate-850">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{data.personalInfo.fullName}</h1>
        <p className="text-purple-700 font-extrabold text-xs uppercase tracking-widest">{data.personalInfo.title}</p>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-slate-500 text-[9.5px]">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>•</span>
              <span>{data.personalInfo.linkedin}</span>
            </>
          )}
        </div>
      </div>

      {sectionOrder.map(sec => renderSection(sec))}
    </div>
  );
}
