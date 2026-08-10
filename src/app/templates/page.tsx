'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles, Filter, Eye,
  Check, ArrowLeft,
  Shield, Columns
} from 'lucide-react';

import TemplateRenderer from '@/components/TemplateRenderer';
import TemplateDetailsDrawer from '@/components/TemplateDetailsDrawer';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { ResumeTemplate } from '@/types/database.types';
import { MouseGlow, AnimatedShader, Card, useToast } from '@/components/ui/design-system';
import { getTemplatePreviewData } from '@/lib/templatePreviewData';

const TEMPLATE_METADATA: ResumeTemplate[] = [
  { id: 'ats-professional', name: 'ATS Professional', ats_score: 98, recommended_role: 'Software Engineer', best_for: ['ATS Friendly', 'Fresher', 'Internship', 'Experienced'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 5 },
  { id: 'tech-minimal', name: 'Tech Minimal', ats_score: 97, recommended_role: 'AI / ML Engineer', best_for: ['ATS Friendly', 'Software Engineer', 'Internship', 'Tech Minimalist'], layout_type: 'Two Column', page_length: 'One Page', recruiter_rating: 5 },
  { id: 'silicon-valley', name: 'Silicon Valley', ats_score: 97, recommended_role: 'Software Architect', best_for: ['ATS Friendly', 'Software Engineer', 'Experienced', 'Executive'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 5 },
  { id: 'modern-gradient', name: 'Modern Gradient', ats_score: 95, recommended_role: 'Full Stack Developer', best_for: ['Designer', 'Fresher', 'Internship'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 4 },
  { id: 'executive-pro', name: 'Executive Pro', ats_score: 96, recommended_role: 'VP of Product', best_for: ['Executive', 'Experienced', 'Manager'], layout_type: 'Two Column', page_length: 'Two Page', recruiter_rating: 5 },
  { id: 'creative-portfolio', name: 'Creative Portfolio', ats_score: 90, recommended_role: 'UI UX Designer', best_for: ['Designer', 'Internship', 'Fresher'], layout_type: 'Two Column', page_length: 'Flexible', recruiter_rating: 4 },
  { id: 'clean-academic', name: 'Clean Academic', ats_score: 94, recommended_role: 'Research Fellow', best_for: ['Experienced', 'Academic', 'Publications'], layout_type: 'Single Column', page_length: 'Two Page', recruiter_rating: 4 },
  { id: 'impact-startup', name: 'Impact Startup', ats_score: 93, recommended_role: 'Growth Hacker', best_for: ['Software Engineer', 'Experienced', 'Product Manager'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 4 },
  { id: 'faang-elite', name: 'FAANG Elite', ats_score: 99, recommended_role: 'Systems Engineer', best_for: ['ATS Friendly', 'Software Engineer', 'Experienced'], layout_type: 'Single Column', page_length: 'One Page', recruiter_rating: 5 },
  { id: 'one-page-compact', name: 'One Page Compact', ats_score: 96, recommended_role: 'Frontend Developer', best_for: ['Fresher', 'Internship', 'Software Engineer'], layout_type: 'Two Column', page_length: 'One Page', recruiter_rating: 4 },
  { id: 'modern-two-column', name: 'Modern Two Column', ats_score: 95, recommended_role: 'Solutions Architect', best_for: ['Experienced', 'Software Engineer'], layout_type: 'Two Column', page_length: 'Flexible', recruiter_rating: 4 },
  { id: 'product-manager-pro', name: 'Product Manager Pro', ats_score: 97, recommended_role: 'Product Manager', best_for: ['Product Manager', 'Executive', 'Experienced'], layout_type: 'Single Column', page_length: 'Two Page', recruiter_rating: 5 }
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
  const { user, profile } = useAuth();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<string>('All');

  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState<ResumeTemplate | null>(null);
  const { toast } = useToast();

  // ── Navigation context detection ──
  // Context A (Browse Mode): Opened from Dashboard — no resumeId in URL
  // Context B (Template Selection Mode): Opened from Builder — resumeId in URL
  const [builderResumeId, setBuilderResumeId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const source = params.get('source');
      const rid = params.get('resumeId');
      if (source === 'builder' && rid) {
        setBuilderResumeId(rid);
      } else {
        setBuilderResumeId(null);
      }
    }
  }, []);

  const isBuilderContext = !!builderResumeId;

  // ── Template showcase data (NEVER uses the user's actual resume) ──
  const templatePreviewData = useMemo(
    () => getTemplatePreviewData(profile?.full_name),
    [profile?.full_name]
  );

  // ── Profile-based recommendations (not draft-based) ──
  const recommendedTemplates = useMemo(() => {
    if (!profile) return TEMPLATE_METADATA.slice(0, 3);
    const dept = (profile.department || '').toLowerCase();
    const expLevel = (profile.experience_level || 'Fresher').toLowerCase();
    const scored = TEMPLATE_METADATA.map(t => {
      let score = t.recruiter_rating;
      if (dept.includes('it') || dept.includes('software')) {
        if (t.best_for.some(b => b.toLowerCase().includes('software') || b.toLowerCase().includes('ats'))) score += 2;
      }
      if (dept.includes('mba') || dept.includes('product')) {
        if (t.best_for.some(b => b.toLowerCase().includes('product') || b.toLowerCase().includes('executive'))) score += 2;
      }
      if (dept.includes('design') || dept.includes('creative')) {
        if (t.best_for.some(b => b.toLowerCase().includes('designer'))) score += 2;
      }
      if (expLevel === 'fresher' || expLevel === 'junior') {
        if (t.best_for.some(b => b.toLowerCase().includes('fresher') || b.toLowerCase().includes('internship'))) score += 2;
      }
      if (expLevel === 'senior' || expLevel === 'lead/executive') {
        if (t.best_for.some(b => b.toLowerCase().includes('executive') || b.toLowerCase().includes('experienced'))) score += 2;
      }
      return { ...t, recScore: score };
    });
    return scored.sort((a, b) => b.recScore - a.recScore).slice(0, 3);
  }, [profile]);

  const filteredTemplates = TEMPLATE_METADATA.filter(tmpl => {
    if (activeFilter === 'All') return true;
    const filterLower = activeFilter.toLowerCase();
    return tmpl.best_for.some(tag => tag.toLowerCase() === filterLower) ||
      tmpl.recommended_role.toLowerCase().includes(filterLower);
  });

  const handleSelectTemplate = async (templateId: string) => {
    setIsSelecting(true);
    try {
      let targetId: string | null = null;

      if (isBuilderContext && builderResumeId) {
        // Context B: Change Template from Builder
        const response = await fetch('/api/resumes/select-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeId: builderResumeId,
            templateId
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to select template');
        targetId = builderResumeId;
      } else {
        // Context A: Browse mode — ALWAYS create a brand-new resume with selected template
        const createRes = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: profile?.department || 'Software & IT',
            role: profile?.career_goal || 'Software Engineer',
            title: `${profile?.full_name || 'My'} Resume`,
            templateId
          })
        });
        const newResume = await createRes.json();
        if (!createRes.ok) throw new Error(newResume.error || 'Failed to create resume draft');
        targetId = newResume.id;
      }

      toast('Template applied successfully!', 'success');
      router.push(`/builder?resumeId=${targetId}`);
    } catch (err: any) {
      toast(err.message || 'Template selection failed.', 'error');
    } finally {
      setIsSelecting(false);
      setConfirmTemplate(null);
    }
  };

  const handleUseTemplateClick = (tmpl: ResumeTemplate) => {
    setConfirmTemplate(tmpl);
  };

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
    <div className={`min-h-screen flex flex-col justify-between font-sans relative overflow-x-hidden transition-colors duration-300 ${'bg-[#FCFAF7] text-slate-800'}`}>

      <AnimatedShader />
      <MouseGlow />

      {/* Header */}
      <header className="bg-white border-b border-[#ECEDF3] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => isBuilderContext && builderResumeId
                ? router.replace(`/builder?resumeId=${builderResumeId}`)
                : router.replace('/dashboard')
              }
              className="h-8 w-8 rounded-xl bg-[#F7F8FC] border border-[#ECEDF3] flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] hover:border-[#DDDEE8] transition cursor-pointer"
              title={isBuilderContext ? 'Back to Builder' : 'Back to Dashboard'}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-px w-4 bg-[#ECEDF3]" />
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm">
                <img src="/SmartCV_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
              </div>
              <span className="font-bold text-[15px] text-[#111827] tracking-tight">SmartCV</span>
              <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Templates</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#ECEDF3] bg-[#F7F8FC] text-[11px] font-medium text-[#6B7280]">
              <span className="text-[#111827] font-semibold">{TEMPLATE_METADATA.length} Templates</span>
              <span className="text-[#D1D5DB]">|</span>
              <span>{isBuilderContext ? 'Change Template' : 'Gallery Preview'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12 relative z-10 space-y-12">

        {/* Recommended carousel */}
        {recommendedTemplates.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-purple-500" size={16} />
              <h2 className={`text-xs font-bold uppercase tracking-widest ${'text-slate-500'}`}>
                Recommended For Your Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedTemplates.map((tmpl) => (
                <Card
                  key={tmpl.id}
                  onClick={() => handleCardClick(tmpl)}
                  className="p-5 flex flex-col justify-between"

                >
                  <span className="absolute top-4 right-4 bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recommended
                  </span>

                  <div className="flex justify-center bg-slate-100 rounded-xl p-3 border border-slate-200/50 w-full h-[230px] overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 to-transparent z-10 pointer-events-none" />
                    <div className="scale-[0.20] origin-top transition duration-300 group-hover:scale-[0.205] pointer-events-none">
                      <TemplateRenderer templateId={tmpl.id} zoom={100} data={templatePreviewData} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className={`text-sm font-bold text-slate-900`}>{tmpl.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#9CA3AF]">
                        <span>ATS: {tmpl.ats_score}%</span>
                        <span className="text-[#D1D5DB]">·</span>
                        <span>{tmpl.layout_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(tmpl);
                        }}
                        className="flex-1 h-8 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye size={12} /> Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseTemplateClick(tmpl);
                        }}
                        className="flex-1 h-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Check size={12} /> Select
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Section */}
        <section className="space-y-6">

          <div className="space-y-4 border-b border-slate-200/50 pb-6">
            <div className="flex items-center space-x-2">
              <Filter className="text-purple-500" size={16} />
              <h2 className={`text-xs font-bold uppercase tracking-widest ${'text-slate-500'}`}>
                Browse Template Library
              </h2>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {FILTER_CATEGORIES.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-[10.5px] font-bold transition duration-150 whitespace-nowrap cursor-pointer ${activeFilter === filter
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-500 text-purple-600'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-350 hover:text-slate-900 shadow-sm'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.map((tmpl) => (
              <Card
                key={tmpl.id}
                onClick={() => handleCardClick(tmpl)}
                className="p-4 flex flex-col justify-between"
              >
                <div className="flex justify-center bg-slate-100 rounded-xl p-2.5 border border-slate-200/50 h-[210px] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 to-transparent z-10 pointer-events-none" />
                  <div className="scale-[0.18] origin-top transition duration-300 group-hover:scale-[0.185] pointer-events-none">
                    <TemplateRenderer templateId={tmpl.id} zoom={100} data={templatePreviewData} />
                  </div>
                </div>

                <div className="mt-3.5 space-y-2">
                  <h3 className={`text-xs font-bold truncate leading-tight text-slate-800`}>{tmpl.name}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[9px] font-bold text-emerald-700">
                      <Shield size={8} /> ATS {tmpl.ats_score}%
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[9px] font-bold text-blue-700">
                      <Columns size={8} /> {tmpl.layout_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(tmpl);
                      }}
                      className="flex-1 h-7 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Eye size={11} /> Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplateClick(tmpl);
                      }}
                      className="flex-1 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Check size={11} /> Select
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-300 rounded-[24px] text-slate-550 text-xs">
              No layouts found matching "{activeFilter}" filter yet.
            </div>
          )}

        </section>
      </main>

      {/* Confirmation Modal */}
      {confirmTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4" onClick={() => setConfirmTemplate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
              <Check size={20} className="text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Apply Template?</h3>
            <p className="text-sm text-slate-500 mt-1.5">
              Switch your resume layout to <span className="font-semibold text-slate-800">{confirmTemplate.name}</span>? Your content will be preserved.
            </p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmTemplate(null)} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
              <button
                onClick={() => handleSelectTemplate(confirmTemplate.id)}
                disabled={isSelecting}
                className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSelecting ? 'Applying...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TemplateDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        template={selectedTemplate}
        onPreview={triggerPreviewFromDrawer}
        onUse={() => selectedTemplate && handleUseTemplateClick(selectedTemplate)}
        isLoading={isSelecting}
      />

      <TemplatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        template={selectedTemplate}
        onNext={handleNextTemplate}
        onPrev={handlePrevTemplate}
        onUse={() => selectedTemplate && handleUseTemplateClick(selectedTemplate)}
        isLoading={isSelecting}
        data={templatePreviewData}
      />

      {/* Footer */}
      <footer className={`border-t py-6 px-6 text-center text-xs transition-colors duration-300 ${'border-slate-200 text-slate-450'}`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span className="font-semibold">SmartCV Design Gallery</span>
          <span className="mt-2 sm:mt-0 font-bold uppercase tracking-widest text-[9px] text-slate-500">A4 Document Engine</span>
        </div>
      </footer>

    </div>
  );
}



