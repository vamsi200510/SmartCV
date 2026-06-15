'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Sparkles, Filter, ChevronLeft, ChevronRight, Eye, 
  Check, ArrowRight, ArrowLeft, Award, Layout, FileText, Star, AlertCircle,
  Sun, Moon
} from 'lucide-react';

import TemplateRenderer from '@/components/TemplateRenderer';
import TemplateDetailsDrawer from '@/components/TemplateDetailsDrawer';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { ResumeTemplate } from '@/types/database.types';

// The 12 premium templates definitions
const TEMPLATE_METADATA: ResumeTemplate[] = [
  {
    id: 'ats-professional',
    name: 'ATS Professional',
    ats_score: 98,
    recommended_role: 'Software Engineer',
    best_for: ['ATS Friendly', 'Fresher', 'Internship', 'Experienced'],
    layout_type: 'Single Column',
    page_length: 'One Page',
    recruiter_rating: 5
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    ats_score: 97,
    recommended_role: 'AI / ML Engineer',
    best_for: ['ATS Friendly', 'Software Engineer', 'Internship', 'Tech Minimalist'],
    layout_type: 'Two Column',
    page_length: 'One Page',
    recruiter_rating: 5
  },
  {
    id: 'silicon-valley',
    name: 'Silicon Valley',
    ats_score: 97,
    recommended_role: 'Software Architect',
    best_for: ['ATS Friendly', 'Software Engineer', 'Experienced', 'Executive'],
    layout_type: 'Single Column',
    page_length: 'One Page',
    recruiter_rating: 5
  },
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    ats_score: 95,
    recommended_role: 'Full Stack Developer',
    best_for: ['Designer', 'Fresher', 'Internship'],
    layout_type: 'Single Column',
    page_length: 'One Page',
    recruiter_rating: 4
  },
  {
    id: 'executive-pro',
    name: 'Executive Pro',
    ats_score: 96,
    recommended_role: 'VP of Product',
    best_for: ['Executive', 'Experienced', 'Manager'],
    layout_type: 'Two Column',
    page_length: 'Two Page',
    recruiter_rating: 5
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    ats_score: 90,
    recommended_role: 'UI UX Designer',
    best_for: ['Designer', 'Internship', 'Fresher'],
    layout_type: 'Two Column',
    page_length: 'Flexible',
    recruiter_rating: 4
  },
  {
    id: 'clean-academic',
    name: 'Clean Academic',
    ats_score: 94,
    recommended_role: 'Research Fellow',
    best_for: ['Experienced', 'Academic', 'Publications'],
    layout_type: 'Single Column',
    page_length: 'Two Page',
    recruiter_rating: 4
  },
  {
    id: 'impact-startup',
    name: 'Impact Startup',
    ats_score: 93,
    recommended_role: 'Growth Hacker',
    best_for: ['Software Engineer', 'Experienced', 'Product Manager'],
    layout_type: 'Single Column',
    page_length: 'One Page',
    recruiter_rating: 4
  },
  {
    id: 'faang-elite',
    name: 'FAANG Elite',
    ats_score: 99,
    recommended_role: 'Systems Engineer',
    best_for: ['ATS Friendly', 'Software Engineer', 'Experienced'],
    layout_type: 'Single Column',
    page_length: 'One Page',
    recruiter_rating: 5
  },
  {
    id: 'one-page-compact',
    name: 'One Page Compact',
    ats_score: 96,
    recommended_role: 'Frontend Developer',
    best_for: ['Fresher', 'Internship', 'Software Engineer'],
    layout_type: 'Two Column',
    page_length: 'One Page',
    recruiter_rating: 4
  },
  {
    id: 'modern-two-column',
    name: 'Modern Two Column',
    ats_score: 95,
    recommended_role: 'Solutions Architect',
    best_for: ['Experienced', 'Software Engineer'],
    layout_type: 'Two Column',
    page_length: 'Flexible',
    recruiter_rating: 4
  },
  {
    id: 'product-manager-pro',
    name: 'Product Manager Pro',
    ats_score: 97,
    recommended_role: 'Product Manager',
    best_for: ['Product Manager', 'Executive', 'Experienced'],
    layout_type: 'Single Column',
    page_length: 'Two Page',
    recruiter_rating: 5
  }
];

const FILTER_CATEGORIES = [
  'All',
  'ATS Friendly',
  'Fresher',
  'Internship',
  'Software Engineer',
  'Product Manager',
  'Designer',
  'Experienced',
  'Executive'
];

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeDetails, setResumeDetails] = useState<any | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  // Selection drawers / preview modals
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // Recommendation engine state
  const [recommendedTemplates, setRecommendedTemplates] = useState<ResumeTemplate[]>([]);

  // Sync route param safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setResumeId(params.get('resumeId'));
    }
  }, []);

  // Fetch resume data
  useEffect(() => {
    if (!resumeId) return;

    const fetchResume = async () => {
      setLoadingResume(true);
      try {
        const res = await fetch(`/api/resumes?id=${resumeId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch resume');
        }
        const data = await res.json();
        setResumeDetails(data);

        // Perform client-side template recommendations based on category and role
        const matched: ResumeTemplate[] = [];
        
        // 1. Check exact recommended role matches
        const roleLower = data.role.toLowerCase();
        const categoryLower = data.category.toLowerCase();

        TEMPLATE_METADATA.forEach(tmpl => {
          const tmplRole = tmpl.recommended_role.toLowerCase();
          const matchesRole = roleLower.includes(tmplRole) || tmplRole.includes(roleLower);
          
          let matchesCategory = false;
          if (categoryLower.includes('software') || categoryLower.includes('it')) {
            matchesCategory = tmpl.id === 'ats-professional' || tmpl.id === 'faang-elite' || tmpl.id === 'tech-minimal' || tmpl.id === 'silicon-valley';
          } else if (categoryLower.includes('mba') || categoryLower.includes('product')) {
            matchesCategory = tmpl.id === 'product-manager-pro' || tmpl.id === 'executive-pro';
          } else if (categoryLower.includes('design') || categoryLower.includes('creative')) {
            matchesCategory = tmpl.id === 'creative-portfolio' || tmpl.id === 'modern-gradient';
          }

          if (matchesRole || matchesCategory) {
            matched.push(tmpl);
          }
        });

        // Fail-safe: Seed defaults if no matched items found
        if (matched.length === 0) {
          setRecommendedTemplates(TEMPLATE_METADATA.slice(0, 3));
        } else {
          // Unique items up to 3
          const unique = Array.from(new Set(matched)).slice(0, 3);
          if (unique.length < 3) {
            const extra = TEMPLATE_METADATA.filter(t => !unique.includes(t));
            setRecommendedTemplates([...unique, ...extra].slice(0, 3));
          } else {
            setRecommendedTemplates(unique);
          }
        }

      } catch (err: any) {
        console.error('Failed to fetch resume:', err);
      } finally {
        setLoadingResume(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  // Redirect back if user attempts to access templates gallery with incomplete/empty resume draft
  useEffect(() => {
    if (!loadingResume && resumeDetails) {
      const rd = resumeDetails.resume_data || {};
      const pi = rd.personalInfo || {};
      
      const isPersonalInfoComplete = !!(
        pi.fullName?.trim() &&
        pi.email?.trim() &&
        pi.phone?.trim() &&
        pi.location?.trim()
      );
      const isEducationComplete = !!(rd.education && rd.education.length > 0);
      const isSkillsComplete = !!(rd.skills && rd.skills.length > 0 && rd.skills.some((s: any) => s.items && s.items.length > 0));
      const isProjectsComplete = !!(rd.projects && rd.projects.length > 0);

      const isChecklistComplete = isPersonalInfoComplete && isEducationComplete && isSkillsComplete && isProjectsComplete;

      if (!isChecklistComplete) {
        alert("Please complete the required checklist sections (Personal Info, Education, Skills, and at least 1 Project) before entering the Template Gallery.");
        router.push(`/builder?resumeId=${resumeId}&warning=incomplete`);
      }
    }
  }, [loadingResume, resumeDetails, resumeId, router]);

  // Filter templates list
  const filteredTemplates = TEMPLATE_METADATA.filter(tmpl => {
    if (activeFilter === 'All') return true;
    
    // Check if the filter matches recommended role exactly or is within best_for tags
    const filterLower = activeFilter.toLowerCase();
    
    return tmpl.best_for.some(tag => tag.toLowerCase() === filterLower) || 
           tmpl.recommended_role.toLowerCase().includes(filterLower);
  });

  // Handle template selection persist
  const handleSelectTemplate = async (templateId: string) => {
    if (!resumeId) return;

    setIsSelecting(true);
    try {
      const response = await fetch('/api/resumes/select-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          templateId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to select template');

      // Proceed to builder page phase placeholder
      router.push(`/builder?resumeId=${resumeId}`);
    } catch (err: any) {
      alert(err.message || 'Template selection failed.');
    } finally {
      setIsSelecting(false);
    }
  };

  // Navigations inside full preview Modal
  const handleNextTemplate = () => {
    if (!selectedTemplate) return;
    const currentIndex = filteredTemplates.findIndex(t => t.id === selectedTemplate.id);
    const nextIndex = (currentIndex + 1) % filteredTemplates.length;
    setSelectedTemplate(filteredTemplates[nextIndex]);
  };

  const handlePrevTemplate = () => {
    if (!selectedTemplate) return;
    const currentIndex = filteredTemplates.findIndex(t => t.id === selectedTemplate.id);
    const prevIndex = (currentIndex - 1 + filteredTemplates.length) % filteredTemplates.length;
    setSelectedTemplate(filteredTemplates[prevIndex]);
  };

  // Click handler on Template Card
  const handleCardClick = (tmpl: ResumeTemplate) => {
    setSelectedTemplate(tmpl);
    setIsDrawerOpen(true);
  };

  const triggerPreviewFromDrawer = () => {
    setIsDrawerOpen(false);
    setIsPreviewModalOpen(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-500 font-sans relative overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Glow Effects */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
        </div>
      )}

      {/* Header */}
      <header className={`border-b backdrop-blur-md px-6 py-4 sticky top-0 z-40 flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/dashboard')}
            className={`h-8 w-8 rounded-lg border flex items-center justify-center transition duration-150 cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft size={14} />
          </button>
          
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-650 flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
              SmartCV
            </span>
            <span className={`text-[8px] block font-bold tracking-widest uppercase -mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Templates
            </span>
          </div>
        </div>

        {/* Actions section on header right */}
        <div className="flex items-center space-x-3">
          {resumeDetails && (
            <div className={`hidden sm:flex items-center space-x-2.5 px-3 py-1 rounded-full border text-[10px] font-bold ${
              isDarkMode ? 'border-slate-850 bg-slate-900/50 text-slate-300' : 'border-slate-200 bg-white text-slate-755 shadow-sm'
            }`}>
              <span>Draft: {resumeDetails.title}</span>
              <span className="text-slate-500">•</span>
              <span>Target: {resumeDetails.role}</span>
            </div>
          )}

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`h-8 w-8 rounded-lg border flex items-center justify-center transition duration-150 cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-yellow-450 hover:text-yellow-400' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
            }`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-10 relative z-10 space-y-12">
        
        {/* Recommended carousel */}
        {recommendedTemplates.length > 0 && (
          <section className="space-y-5 animate-fade-in-up">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-teal-400" size={16} />
              <h2 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
                Recommended For Your Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedTemplates.map((tmpl) => (
                <div 
                  key={tmpl.id}
                  onClick={() => handleCardClick(tmpl)}
                  className={`border rounded-[26px] p-5 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden ${
                    isDarkMode 
                      ? 'bg-gradient-to-b from-slate-900/40 to-slate-950/20 border-slate-900 hover:border-slate-800' 
                      : 'bg-white border-slate-200/60 hover:border-slate-300'
                  }`}
                >
                  {/* Floating recommendation badge */}
                  <span className="absolute top-4 right-4 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recommended match
                  </span>

                  {/* Thumbnail Scaled Document */}
                  <div className="flex justify-center bg-slate-950/20 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-900/40 w-full h-[230px] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 to-transparent z-10 pointer-events-none" />
                    <div className="scale-[0.20] origin-top transition duration-300 group-hover:scale-[0.205] pointer-events-none">
                      <TemplateRenderer templateId={tmpl.id} zoom={100} data={resumeDetails?.resume_data} />
                    </div>
                  </div>

                  {/* Template Meta */}
                  <div className="mt-4 flex flex-col justify-between">
                    <div>
                      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tmpl.name}</h3>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                        <span>ATS: {tmpl.ats_score}%</span>
                        <span>•</span>
                        <span>{tmpl.layout_type}</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className={`h-8 w-full mt-4 rounded-lg text-[10px] font-bold transition duration-150 flex items-center justify-center gap-1 ${
                        isDarkMode
                          ? 'bg-slate-900 border border-slate-850 text-teal-400 hover:bg-slate-850'
                          : 'bg-indigo-50 border border-indigo-100 text-indigo-650 hover:bg-indigo-100/50'
                      }`}
                    >
                      <span>Analyze Layout</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Section */}
        <section className="space-y-6 animate-fade-in-up animation-delay-100">
          
          {/* Header & Filter Bar */}
          <div className="space-y-4 border-b border-slate-900/60 dark:border-slate-850/60 pb-6">
            <div className="flex items-center space-x-2">
              <Filter className="text-indigo-400" size={16} />
              <h2 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
                Browse Template Library
              </h2>
            </div>

            {/* Horizontal Scrollable Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
              {FILTER_CATEGORIES.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-[10.5px] font-bold transition duration-150 whitespace-nowrap cursor-pointer ${
                    activeFilter === filter
                      ? isDarkMode
                        ? 'bg-teal-500/10 border border-teal-500 text-teal-400 shadow-md shadow-teal-500/5'
                        : 'bg-indigo-50 border border-indigo-600 text-indigo-650'
                      : isDarkMode
                        ? 'bg-slate-900 border border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of All Layouts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleCardClick(tmpl)}
                className={`border rounded-[22px] p-4 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group flex flex-col justify-between ${
                  isDarkMode 
                    ? 'bg-slate-900/15 border-slate-900 hover:border-slate-850' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Scaled Mini Document */}
                <div className="flex justify-center bg-slate-950/20 dark:bg-slate-950/40 rounded-xl p-2.5 border border-slate-900/40 h-[210px] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 to-transparent z-10 pointer-events-none" />
                  <div className="scale-[0.18] origin-top transition duration-300 group-hover:scale-[0.185] pointer-events-none">
                    <TemplateRenderer templateId={tmpl.id} zoom={100} data={resumeDetails?.resume_data} />
                  </div>
                </div>

                <div className="mt-3.5 space-y-1">
                  <h3 className={`text-xs font-bold truncate leading-tight ${isDarkMode ? 'text-slate-250' : 'text-slate-800'}`}>{tmpl.name}</h3>
                  <div className="flex items-center justify-between text-[9px] text-slate-500">
                    <span>ATS {tmpl.ats_score}%</span>
                    <span className="font-semibold text-slate-600">{tmpl.page_length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty templates matching filter */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-900 dark:border-slate-850 rounded-[28px] text-slate-500 text-xs">
              No layouts found matching "{activeFilter}" filter yet.
            </div>
          )}

        </section>
      </main>

      {/* Slide-over Details Drawer */}
      <TemplateDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        template={selectedTemplate}
        onPreview={triggerPreviewFromDrawer}
        onUse={() => selectedTemplate && handleSelectTemplate(selectedTemplate.id)}
        isLoading={isSelecting}
        isDarkMode={isDarkMode}
      />

      {/* Fullscreen Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        template={selectedTemplate}
        onNext={handleNextTemplate}
        onPrev={handlePrevTemplate}
        onUse={() => selectedTemplate && handleSelectTemplate(selectedTemplate.id)}
        isLoading={isSelecting}
        isDarkMode={isDarkMode}
        data={resumeDetails?.resume_data}
      />

      {/* Footer */}
      <footer className={`border-t py-6 px-6 text-center text-xs transition-colors duration-500 ${isDarkMode ? 'border-slate-900 text-slate-655' : 'border-slate-200 text-slate-400'}`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span className="font-semibold">SmartCV Design Gallery</span>
          <span className="mt-2 sm:mt-0 font-bold uppercase tracking-widest text-[9px] text-slate-500">A4 Document Engine</span>
        </div>
      </footer>

    </div>
  );
}
