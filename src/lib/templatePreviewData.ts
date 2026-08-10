import { ResumeData } from '@/components/TemplateRenderer';

/**
 * Template Preview Data Module
 *
 * This file is the SINGLE SOURCE OF TRUTH for all template gallery previews.
 * It provides a professionally populated sample resume that makes every
 * template look polished and complete in the showcase.
 *
 * Rules:
 * - Used ONLY for the Templates Gallery and Dashboard template previews.
 * - Uses the user's real full_name if available (personalizes the preview).
 * - Uses professional placeholder content for every other section.
 * - NEVER writes to the database.
 * - NEVER reads the user's actual resume draft.
 * - NEVER mutates user data.
 *
 * The Builder page should NEVER import or use this data.
 */

/**
 * Returns a complete, professionally populated ResumeData object
 * for use in template gallery previews.
 *
 * @param userFullName - The user's real name from their profile.
 *                       Falls back to "John Smith" if not provided.
 * @returns A fully populated ResumeData object with sample content.
 */
export function getTemplatePreviewData(userFullName?: string | null): ResumeData {
  const fullName = userFullName?.trim() || 'John Smith';

  return {
    personalInfo: {
      fullName,
      title: 'Senior Software Engineer',
      email: 'contact@example.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      website: 'portfolio.dev',
      github: 'github.com/developer',
      linkedin: 'linkedin.com/in/developer',
      summary:
        'Result-driven Senior Software Engineer with 6+ years of experience designing, building, and scaling high-performance web applications and distributed systems. Expert in React, Next.js, Node.js, and Cloud Infrastructure. Proven track record of leading cross-functional teams, optimizing engineering workflows, and delivering user-centric SaaS products from ideation to production.',
    },
    experience: [
      {
        role: 'Senior Software Engineer',
        company: 'Google',
        duration: '2022 – Present',
        location: 'Mountain View, CA',
        bullets: [
          'Led a team of 8 engineers to redesign and migrate legacy services to a microservices architecture, improving system reliability by 99.95% uptime.',
          'Designed and built a real-time analytics dashboard processing over 15M daily events with Node.js, Redis, and BigQuery.',
          'Established automated CI/CD pipelines and testing suites, reducing deployment error rates by 40% and time-to-market by 25%.',
          'Mentored 4 junior engineers through structured code reviews and pair programming sessions.',
        ],
      },
      {
        role: 'Software Engineer',
        company: 'Microsoft',
        duration: '2019 – 2022',
        location: 'Redmond, WA',
        bullets: [
          'Architected and implemented responsive frontend applications using React, TypeScript, and Fluent UI serving 2M+ daily active users.',
          'Developed scalable RESTful APIs and GraphQL services, improving server response times by 35%.',
          'Collaborated closely with product managers and UX designers to implement an accessible component library adopted across 3 product teams.',
          'Optimized database queries and schemas, decreasing read latencies by 45% on critical application tables.',
        ],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'Stanford University',
        duration: '2015 – 2019',
        details: 'GPA: 3.92/4.0 · Dean\'s List · Specialization in Distributed Systems',
      },
    ],
    projects: [
      {
        name: 'AI Resume Builder',
        technologies: ['Next.js', 'TypeScript', 'Supabase', 'TailwindCSS'],
        description:
          'Built a high-performance resume builder platform with real-time editing, AI-powered content optimization, 12+ professional templates, and an integrated PDF export engine.',
      },
      {
        name: 'Portfolio Website',
        technologies: ['React', 'Three.js', 'Framer Motion', 'Vercel'],
        description:
          'Designed and developed an interactive portfolio with 3D animations, smooth page transitions, and server-side rendering for optimal SEO performance.',
      },
    ],
    skills: [
      {
        category: 'Languages',
        items: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'Go', 'SQL', 'HTML5/CSS3'],
      },
      {
        category: 'Frameworks & Libraries',
        items: ['React', 'Next.js', 'Node.js', 'Express', 'TailwindCSS', 'Redux Toolkit'],
      },
      {
        category: 'Cloud & DevOps',
        items: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'MongoDB'],
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect – Professional',
        issuer: 'Amazon Web Services',
        date: 'Jan 2024',
      },
      {
        name: 'Google Cloud Professional Cloud Architect',
        issuer: 'Google Cloud',
        date: 'Aug 2023',
      },
    ],
    achievements: [
      {
        title: 'Hackathon Winner — HackMIT 2023',
        description:
          'Led a team of 4 to build an AI-powered accessibility tool, winning first place among 500+ participants.',
      },
      {
        title: 'Open Source Contributor — Top 1%',
        description:
          'Active contributor to React and Next.js open source ecosystems with 2,000+ GitHub stars across personal projects.',
      },
    ],
    additionalInfo: {
      languages: 'English (Native), Spanish (Professional Working Proficiency)',
      interests: 'Open Source, Photography, Chess, Amateur Astronomy',
    },
  };
}
