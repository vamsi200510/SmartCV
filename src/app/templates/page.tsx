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
import A4ResumePreview from '@/components/A4ResumePreview';
import TemplateDetailsDrawer from '@/components/TemplateDetailsDrawer';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { ResumeTemplate } from '@/types/database.types';
import { Badge, useToast } from '@/components/ui/design-system';
import { ColorMeshBackdrop } from '@/components/ui/ColorMeshBackdrop';
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
    <div className="min-h-screen level-0-base flex flex-col justify-between text-[#241C12] relative overflow-x-hidden color-mesh-backdrop" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <ColorMeshBackdrop />

      {/* ── FLOATING LIQUID GLASS NAVBAR ── */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 max-w-7xl mx-auto pointer-events-none">
        <div className="liquid-glass-nav rounded-[28px] px-5 py-2.5 flex items-center justify-between shadow-lg pointer-events-auto border border-white/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => isBuilderContext && builderResumeId
                ? router.replace(`/builder?resumeId=${builderResumeId}`)
                : router.replace('/dashboard')
              }
              className="h-8 w-8 rounded-full bg-white/70 hover:bg-white border border-white/80 flex items-center justify-center text-slate-700 hover:text-[#241C12] transition cursor-pointer shadow-xs"
              title={isBuilderContext ? 'Back to Builder' : 'Back to Dashboard'}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-[#E8DDD0]" />
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-white/70 border border-white/80 flex items-center justify-center shadow-xs">
                <img src="/SmartCV_logo.png" alt="Logo" className="h-4 w-4 object-contain" />
              </div>
              <span className="font-black text-sm text-[#172B4D] tracking-tight">SmartCV</span>
              <span className="text-[10px] font-bold text-[#C2600E] uppercase tracking-wider">Templates</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/60 border border-white/80 text-[11px] font-bold text-[#5C4E3E] shadow-xs">
              <span className="text-[#241C12] font-black">{TEMPLATE_METADATA.length} Templates</span>
              <span className="text-[#E8DDD0]">|</span>
              <span>{isBuilderContext ? 'Change Template' : 'Gallery Preview'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 pt-24 pb-12 relative z-10 space-y-12">

        {/* Recommended carousel */}
        {recommendedTemplates.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-[#C2600E]" size={15} />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#5C4E3E]">
                Recommended For Your Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recommendedTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleCardClick(tmpl)}
                  className="level-1-card p-5 flex flex-col justify-between rounded-3xl shadow-sm cursor-pointer relative group hover:-translate-y-0.5 hover:border-[#C2600E] hover:shadow-md transition-all"
                >
                  <span className="absolute top-4 right-4 bg-[#C2600E] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-20 shadow-xs">
                    Recommended
                  </span>

                  {/* Exact A4 Portrait Box */}
                  <div className="w-full aspect-[210/297] rounded-xl border border-[#E8DDD0] bg-[#F5EFEB] overflow-hidden relative shadow-xs">
                    <A4ResumePreview templateId={tmpl.id} data={templatePreviewData} />
                  </div>

                  <div className="mt-4 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#241C12]">{tmpl.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#5C4E3E] font-medium">
                        <span className="font-bold badge-emerald px-2 py-0.5 rounded-full shadow-xs">ATS: {tmpl.ats_score}%</span>
                        <span className="text-slate-300">·</span>
                        <span>{tmpl.layout_type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(tmpl);
                        }}
                        className="flex-1 h-8 rounded-full bg-white border border-[#E8DDD0] text-[11px] font-bold text-[#241C12] hover:bg-[#F5EFEB] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Eye size={12} /> Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseTemplateClick(tmpl);
                        }}
                        className="flex-1 h-8 rounded-full bg-[#C2600E] hover:bg-[#9C4A08] text-white text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Check size={12} /> Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Section */}
        <section className="space-y-6">

          <div className="space-y-4 border-b border-[#E8DDD0] pb-5">
            <div className="flex items-center space-x-2">
              <Filter className="text-[#C2600E]" size={15} />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#5C4E3E]">
                Browse Template Library
              </h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none liquid-glass-toolbar p-1.5 rounded-full border border-white/60">
              {FILTER_CATEGORIES.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${activeFilter === filter
                      ? 'bg-[#C2600E] text-white shadow-xs'
                      : 'text-[#5C4E3E] hover:text-[#241C12]'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleCardClick(tmpl)}
                className="level-1-card p-4 flex flex-col justify-between rounded-2xl shadow-xs cursor-pointer group hover:-translate-y-0.5 hover:border-[#C2600E] hover:shadow-md transition-all"
              >
                {/* Exact A4 Portrait Box */}
                <div className="w-full aspect-[210/297] rounded-xl border border-[#E8DDD0] bg-[#F5EFEB] overflow-hidden relative shadow-xs">
                  <A4ResumePreview templateId={tmpl.id} data={templatePreviewData} />
                </div>

                <div className="mt-3.5 space-y-2">
                  <h3 className="text-xs font-bold truncate leading-tight text-[#241C12]">{tmpl.name}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full badge-emerald text-[9px] font-bold shadow-xs">
                      <Shield size={8} /> ATS {tmpl.ats_score}%
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full badge-orange text-[9px] font-bold shadow-xs">
                      <Columns size={8} /> {tmpl.layout_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(tmpl);
                      }}
                      className="flex-1 h-7 rounded-full bg-white border border-[#E8DDD0] text-[10px] font-bold text-[#241C12] hover:bg-[#F5EFEB] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Eye size={11} /> Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplateClick(tmpl);
                      }}
                      className="flex-1 h-7 rounded-full bg-[#C2600E] hover:bg-[#9C4A08] text-white text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Check size={11} /> Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 liquid-glass-card-primary rounded-2xl text-[#64748B] text-xs font-medium">
              No layouts found matching &ldquo;{activeFilter}&rdquo; filter yet.
            </div>
          )}

        </section>
      </main>

      {/* Confirmation Modal */}
      {confirmTemplate && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => !isSelecting && setConfirmTemplate(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#E8DDD0] shadow-2xl p-6 max-w-sm w-full animate-scale-in space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[#FCE3C7] border border-[#F4B77E] flex items-center justify-center shadow-xs">
                <Check className="text-[#C2600E]" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#241C12]">Use This Template?</h3>
                <p className="text-xs text-[#5C4E3E] font-medium">{confirmTemplate.name}</p>
              </div>
            </div>

            <p className="text-xs text-[#5C4E3E] leading-relaxed font-medium">
              {isBuilderContext
                ? 'Your resume content will be preserved and rendered in the new layout.'
                : 'A new resume draft will be created with this template and your profile details.'}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                disabled={isSelecting}
                onClick={() => setConfirmTemplate(null)}
                className="flex-1 h-9 rounded-xl border border-[#E8DDD0] text-xs font-bold text-[#241C12] hover:bg-[#F5EFEB] transition cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                disabled={isSelecting}
                onClick={() => handleSelectTemplate(confirmTemplate.id)}
                className="flex-1 h-9 rounded-xl bg-[#C2600E] hover:bg-[#9C4A08] text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-md"
              >
                {isSelecting ? 'Applying…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Details Drawer */}
      <TemplateDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        template={selectedTemplate}
        onPreview={triggerPreviewFromDrawer}
        onUse={() => selectedTemplate && handleUseTemplateClick(selectedTemplate)}
        isLoading={isSelecting}
      />

      {/* Template Full-Screen Preview Modal */}
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
      <footer className="py-6 px-6 text-center text-xs border-t border-white/60 text-[#64748B] font-medium">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span>SmartCV Design Gallery</span>
          <span className="mt-2 sm:mt-0 font-bold uppercase tracking-widest text-[9px] text-[#94A3B8]">A4 Document Engine</span>
        </div>
      </footer>

    </div>
  );
}
