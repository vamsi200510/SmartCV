'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, Sparkles, ZoomIn, ZoomOut, Maximize2, Loader2, Check, AlertCircle, Sun, Moon
} from 'lucide-react';
import TemplateRenderer, { defaultSampleData } from '@/components/TemplateRenderer';
import ResumeBuilderForm from '@/components/ResumeBuilderForm';
import { ResumeTemplate } from '@/types/database.types';

// The 12 premium templates definitions (for looking up selected template info)
const TEMPLATE_METADATA: ResumeTemplate[] = [
  { id: 'ats-professional', name: 'ATS Professional', ats_score: 98, recommended_role: 'Software Engineer', best_for: ['ATS Friendly', 'Fresher', 'Internship'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 5 },
  { id: 'tech-minimal', name: 'Tech Minimal', ats_score: 97, recommended_role: 'AI / ML Engineer', best_for: ['ATS Friendly', 'Software Engineer'], layout_type: 'Two Column', page_length: 'One Page', recruiter_rating: 5 },
  { id: 'silicon-valley', name: 'Silicon Valley', ats_score: 97, recommended_role: 'Software Architect', best_for: ['ATS Friendly', 'Software Engineer'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 5 },
  { id: 'modern-gradient', name: 'Modern Gradient', ats_score: 95, recommended_role: 'Full Stack Developer', best_for: ['Designer', 'Fresher'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 4 },
  { id: 'executive-pro', name: 'Executive Pro', ats_score: 96, recommended_role: 'VP of Product', best_for: ['Executive', 'Experienced'], layout_type: 'Two Column', page_length: 'Two Page', recruiter_rating: 5 },
  { id: 'creative-portfolio', name: 'Creative Portfolio', ats_score: 90, recommended_role: 'UI UX Designer', best_for: ['Designer', 'Internship'], layout_type: 'Two Column', page_length: 'Flexible', recruiter_rating: 4 },
  { id: 'clean-academic', name: 'Clean Academic', ats_score: 94, recommended_role: 'Research Fellow', best_for: ['Experienced', 'Academic'], layout_type: 'Single Column', page_length: 'Two Page', recruiter_rating: 4 },
  { id: 'impact-startup', name: 'Impact Startup', ats_score: 93, recommended_role: 'Growth Hacker', best_for: ['Software Engineer', 'Experienced'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 4 },
  { id: 'faang-elite', name: 'FAANG Elite', ats_score: 99, recommended_role: 'Systems Engineer', best_for: ['ATS Friendly', 'Software Engineer'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 5 },
  { id: 'one-page-compact', name: 'One Page Compact', ats_score: 96, recommended_role: 'Frontend Developer', best_for: ['Fresher', 'Internship'], layout_type: 'Two Column', page_length: 'One Page', recruiter_rating: 4 },
  { id: 'modern-two-column', name: 'Modern Two Column', ats_score: 95, recommended_role: 'Solutions Architect', best_for: ['Experienced', 'Software Engineer'], layout_type: 'Two Column', page_length: 'Flexible', recruiter_rating: 4 },
  { id: 'product-manager-pro', name: 'Product Manager Pro', ats_score: 97, recommended_role: 'Product Manager', best_for: ['Product Manager', 'Executive'], layout_type: 'Single Column', page_length: 'Two Page', recruiter_rating: 5 }
];

export default function BuilderPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeDetails, setResumeDetails] = useState<any | null>(null);
  const [activeResumeData, setActiveResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [zoom, setZoom] = useState(70);
  const [isPreviewingPdf, setIsPreviewingPdf] = useState(false);

  // Sync client parameters safely
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
      setLoading(true);
      try {
        const response = await fetch(`/api/resumes?id=${resumeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch resume details');
        }
        const data = await response.json();
        setResumeDetails(data);
        setActiveResumeData(data.resume_data || {});

        // Find selected template meta
        if (data.template_id) {
          const tmpl = TEMPLATE_METADATA.find(t => t.id === data.template_id);
          setSelectedTemplate(tmpl || null);
        } else {
          // Default template fallback if none selected
          const fallbackTmpl = TEMPLATE_METADATA.find(t => t.id === 'ats-professional');
          setSelectedTemplate(fallbackTmpl || null);
        }
      } catch (err: any) {
        console.error('Failed to load resume:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [resumeId]);

  // Pre-fill name and email once profile/user is available
  useEffect(() => {
    if (!loading && activeResumeData) {
      let updated = false;
      const copy = { ...activeResumeData };
      if (!copy.personalInfo) {
        copy.personalInfo = {};
        updated = true;
      }
      if (!copy.personalInfo.fullName && profile?.full_name) {
        copy.personalInfo.fullName = profile.full_name;
        updated = true;
      }
      if (!copy.personalInfo.email && user?.email) {
        copy.personalInfo.email = user.email;
        updated = true;
      }
      if (updated) {
        setActiveResumeData(copy);
      }
    }
  }, [profile, user, loading, activeResumeData]);

  if (!user) return null;

  // Check if the user has entered any custom data beyond pre-filled fields
  const hasUserEnteredData = () => {
    if (!activeResumeData) return false;
    const pi = activeResumeData.personalInfo || {};
    // If user edited personal info fields (other than pre-filled name & email)
    if (pi.phone?.trim() || pi.location?.trim() || pi.summary?.trim() || pi.title?.trim() || pi.website?.trim() || pi.github?.trim() || pi.linkedin?.trim()) {
      return true;
    }
    // Or if they added entries to list sections
    if (activeResumeData.education?.length > 0) return true;
    if (activeResumeData.experience?.length > 0) return true;
    if (activeResumeData.projects?.length > 0) return true;
    if (activeResumeData.skills?.length > 0) return true;
    if (activeResumeData.certifications?.length > 0) return true;
    if (activeResumeData.achievements?.length > 0) return true;
    return false;
  };

  // Render current display data, merging empty blocks with defaultSampleData to avoid empty skeletons
  const getPreviewData = () => {
    if (!activeResumeData) return defaultSampleData;
    
    const pi = activeResumeData.personalInfo || {};
    
    if (hasUserEnteredData()) {
      // User started typing, render only user data and do not fall back to Vamsi Krishna Tadisetti mock fields
      return {
        personalInfo: {
          fullName: pi.fullName?.trim() || '',
          title: pi.title?.trim() || '',
          email: pi.email?.trim() || '',
          phone: pi.phone?.trim() || '',
          location: pi.location?.trim() || '',
          website: pi.website?.trim() || '',
          github: pi.github?.trim() || '',
          linkedin: pi.linkedin?.trim() || '',
          summary: pi.summary?.trim() || '',
        },
        experience: activeResumeData.experience || [],
        education: activeResumeData.education || [],
        projects: activeResumeData.projects || [],
        skills: activeResumeData.skills || [],
        certifications: activeResumeData.certifications || [],
        achievements: activeResumeData.achievements || [],
        additionalInfo: activeResumeData.additionalInfo || [],
        customization: activeResumeData.customization
      };
    }
    
    // Otherwise fallback to sample data for visual guidance when empty
    return {
      personalInfo: {
        fullName: pi.fullName?.trim() || defaultSampleData.personalInfo.fullName,
        title: pi.title?.trim() || defaultSampleData.personalInfo.title,
        email: pi.email?.trim() || defaultSampleData.personalInfo.email,
        phone: pi.phone?.trim() || defaultSampleData.personalInfo.phone,
        location: pi.location?.trim() || defaultSampleData.personalInfo.location,
        website: pi.website?.trim() || '',
        github: pi.github?.trim() || '',
        linkedin: pi.linkedin?.trim() || '',
        summary: pi.summary?.trim() || defaultSampleData.personalInfo.summary,
      },
      experience: activeResumeData.experience && activeResumeData.experience.length > 0 
        ? activeResumeData.experience 
        : defaultSampleData.experience,
      education: activeResumeData.education && activeResumeData.education.length > 0 
        ? activeResumeData.education 
        : defaultSampleData.education,
      projects: activeResumeData.projects && activeResumeData.projects.length > 0 
        ? activeResumeData.projects 
        : defaultSampleData.projects,
      skills: activeResumeData.skills && activeResumeData.skills.length > 0 
        ? activeResumeData.skills 
        : defaultSampleData.skills,
      certifications: activeResumeData.certifications && activeResumeData.certifications.length > 0 
        ? activeResumeData.certifications 
        : defaultSampleData.certifications,
      achievements: activeResumeData.achievements && activeResumeData.achievements.length > 0 
        ? activeResumeData.achievements 
        : defaultSampleData.achievements,
      additionalInfo: activeResumeData.additionalInfo || defaultSampleData.additionalInfo,
      customization: activeResumeData.customization
    };
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-500 font-sans relative overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Neon glows */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-50/5 rounded-full blur-[140px]" />
        </div>
      )}

      {/* Header */}
      <header className={`border-b backdrop-blur-md px-6 py-4 sticky top-0 z-40 flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              router.push('/dashboard');
            }}
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
              Builder Canvas
            </span>
          </div>
        </div>

        {/* Selected target info & Save Indicator */}
        <div className="flex items-center space-x-3">
          {/* Save Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold transition duration-200 ${
            saveStatus === 'saving'
              ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
              : saveStatus === 'error'
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 animate-pulse'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }`}>
            {saveStatus === 'saving' ? (
              <>
                <Loader2 size={11} className="animate-spin" />
                <span>Saving draft...</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle size={11} />
                <span>Autosave failed</span>
              </>
            ) : (
              <>
                <Check size={11} />
                <span>All changes saved</span>
              </>
            )}
          </div>

          {resumeDetails && (
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`flex items-center px-3 py-1 rounded-full border text-[10px] font-bold ${
                isDarkMode ? 'border-slate-850 bg-slate-900/50 text-slate-300' : 'border-slate-200 bg-white text-slate-755 shadow-sm'
              }`}>
                <span>Draft: {resumeDetails.title}</span>
              </div>
              {resumeDetails.template_id ? (
                <div className={`flex items-center px-3 py-1 rounded-full border text-[10px] font-bold ${
                  isDarkMode ? 'border-teal-500/35 bg-teal-500/10 text-teal-400' : 'border-teal-200 bg-teal-50 text-teal-700 shadow-sm'
                }`}>
                  <span>Template: {selectedTemplate?.name}</span>
                </div>
              ) : (
                <div className="flex items-center px-3 py-1 rounded-full border text-[10px] font-bold border-amber-500/30 bg-amber-500/10 text-amber-500 animate-pulse">
                  <span>Template Required ⚠</span>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`h-8 w-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-yellow-450 hover:text-yellow-400' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </header>

      {/* Main Panel Content split into Form and Preview */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10 flex flex-col lg:flex-row gap-6 items-stretch h-[calc(100vh-73px)] overflow-hidden">
        
        {/* Left Side: Form Workspace */}
        <section className={`w-full lg:w-[48%] flex flex-col border rounded-[24px] p-5 backdrop-blur-md overflow-hidden ${
          isDarkMode 
            ? 'bg-slate-900/15 border-slate-900/60 shadow-slate-950/20' 
            : 'bg-white border-slate-200/50 shadow-slate-200/20'
        }`}>
          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mb-3 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Loading Resume Config...</span>
            </div>
          ) : (
            <ResumeBuilderForm
              resumeId={resumeId!}
              initialData={activeResumeData}
              onChange={setActiveResumeData}
              onSaveStatusChange={setSaveStatus}
              isDarkMode={isDarkMode}
              templateId={resumeDetails?.template_id}
              onPreviewPdf={() => setIsPreviewingPdf(true)}
            />
          )}
        </section>

        {/* Right Side: Live Scaled Preview Window */}
        <section className={`w-full lg:w-[52%] flex flex-col border border-dashed rounded-[24px] overflow-hidden backdrop-blur-sm relative transition-colors duration-300 ${
          isDarkMode ? 'border-slate-900 bg-slate-950/20' : 'border-slate-200 bg-slate-100/30 shadow-sm'
        }`}>
          
          {/* Scaled Preview Controls Toolbar */}
          <div className={`flex items-center justify-between p-3 border-b shrink-0 transition-colors duration-300 ${
            isDarkMode ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-2">Document Canvas</span>
            
            <div className="flex items-center space-x-2">
              {/* Zoom controls */}
              <button
                onClick={() => setZoom(prev => Math.max(prev - 10, 40))}
                className={`h-7 w-7 rounded-md flex items-center justify-center transition border cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white' 
                    : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'
                }`}
                title="Zoom Out"
              >
                <ZoomOut size={12} />
              </button>
              
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md min-w-[42px] text-center border ${
                isDarkMode 
                  ? 'text-slate-400 bg-slate-900 border-slate-850' 
                  : 'text-slate-700 bg-white border-slate-200'
              }`}>
                {zoom}%
              </span>

              <button
                onClick={() => setZoom(prev => Math.min(prev + 10, 150))}
                className={`h-7 w-7 rounded-md flex items-center justify-center transition border cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white' 
                    : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'
                }`}
                title="Zoom In"
              >
                <ZoomIn size={12} />
              </button>

              <button
                onClick={() => setZoom(70)}
                className={`h-7 w-7 rounded-md flex items-center justify-center transition border cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white' 
                    : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'
                }`}
                title="Fit to Screen"
              >
                <Maximize2 size={12} />
              </button>
            </div>

            {selectedTemplate && (
              <span className={`text-[9px] font-bold uppercase tracking-widest border px-2.5 py-0.5 rounded-full mr-2 ${
                isDarkMode 
                  ? 'bg-teal-500/5 border-teal-500/10 text-teal-400' 
                  : 'bg-teal-50 border-teal-100 text-teal-655 shadow-sm'
              }`}>
                ATS: {selectedTemplate.ats_score}%
              </span>
            )}
          </div>
          
          {/* Scrollable canvas wrapper */}
          <div className={`flex-grow overflow-auto p-4 flex justify-center items-start transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-900/50' : 'bg-slate-200/50'
          }`}>
            {selectedTemplate ? (
              <div className="my-4 origin-top transition-all duration-200" id={isPreviewingPdf ? undefined : 'resume-preview-document'}>
                <TemplateRenderer 
                  templateId={selectedTemplate.id} 
                  data={getPreviewData()} 
                  zoom={zoom} 
                />
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 py-16">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-teal-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Loading Document Viewport...</span>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className={`border-t py-4 px-6 text-center text-xs transition-colors duration-500 shrink-0 ${
        isDarkMode ? 'border-slate-900 text-slate-600 bg-slate-950' : 'border-slate-200 text-slate-500 bg-white'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span className="font-semibold text-[10px]">SmartCV Canvas Workstation v2.0.0</span>
          <span className="mt-2 sm:mt-0 font-bold uppercase tracking-widest text-[8px] text-indigo-500 flex items-center gap-1.5">
            <Sparkles size={10} />
            <span>Real-Time Vector Rendering</span>
          </span>
        </div>
      </footer>

      {/* PDF Print Preview Overlay Modal */}
      {isPreviewingPdf && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-start overflow-y-auto p-6 animate-fade-in-up">
          {/* Header toolbar */}
          <div className="w-full max-w-[840px] flex items-center justify-between bg-slate-900 text-white px-6 py-4 rounded-t-2xl shadow-xl">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider">PDF Print Preview</h3>
              <p className="text-[10px] text-slate-400">Review layout margins and alignment before exporting.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="h-9 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-teal-500/10 cursor-pointer"
              >
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setIsPreviewingPdf(false)}
                className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer border border-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
          
          {/* Document Preview Pane */}
          <div className="w-full max-w-[840px] bg-slate-950/40 border-x border-b border-slate-800 rounded-b-2xl p-8 flex justify-center items-start shadow-xl">
            <div id="resume-preview-document" className="bg-white text-slate-800 shadow-2xl rounded-sm">
              <TemplateRenderer 
                templateId={selectedTemplate?.id || 'ats-professional'} 
                data={getPreviewData()} 
                zoom={100} 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
