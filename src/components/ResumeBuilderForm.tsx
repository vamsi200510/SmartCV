'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User, FileText, GraduationCap, Code2, FolderGit2, Briefcase,
  Award, Trophy, HelpCircle, Plus, Trash2, ArrowUp, ArrowDown,
  Check, AlertCircle, ChevronRight, Loader2, Camera, X, Globe,
  Link as LinkIcon, ExternalLink
} from 'lucide-react';

// Custom inline SVG icons
const LayersIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

const GithubIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// URL validation helper (non-blocking)
function isLikelyValidUrl(str?: string): boolean {
  if (!str || !str.trim()) return true;
  const s = str.trim();
  // Validates http://, https://, or domain.tld formats
  return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(s);
}

// ── Types ─────────────────────────────────────────────────────────
interface ResumeBuilderFormProps {
  resumeId: string;
  initialData: any;
  onChange: (data: any) => void;
  onSaveStatusChange: (status: 'saved' | 'saving' | 'error') => void;
  saveStatus?: 'saved' | 'saving' | 'error';
  templateId?: string | null;
  onPreviewPdf?: () => void;
}

const BASE_STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Summary', icon: FileText },
  { id: 3, label: 'Education', icon: GraduationCap },
  { id: 4, label: 'Skills', icon: Code2 },
  { id: 5, label: 'Projects', icon: FolderGit2 },
  { id: 6, label: 'Experience', icon: Briefcase },
  { id: 7, label: 'Certifications', icon: Award },
  { id: 8, label: 'Achievements', icon: Trophy },
  { id: 9, label: 'Additional Info', icon: HelpCircle },
];

// ── Level 2 Nested Styling Tokens ─────────────────────────────────
const inputClass = `bg-[#FAF6F2] border border-[#E8DDD0] rounded-xl w-full h-9 px-3 text-[13px] font-medium text-[#241C12] placeholder:text-[#9A8C7E]/65 focus:bg-white focus:border-[#C2600E] focus:ring-2 focus:ring-[#C2600E]/20 focus:outline-none transition-all duration-150 shadow-2xs`;
const textareaClass = `bg-[#FAF6F2] border border-[#E8DDD0] rounded-xl w-full px-3 py-2 text-[13px] font-medium resize-none leading-relaxed text-[#241C12] placeholder:text-[#9A8C7E]/65 focus:bg-white focus:border-[#C2600E] focus:ring-2 focus:ring-[#C2600E]/20 focus:outline-none transition-all duration-150 shadow-2xs`;
const labelClass = `text-[10.5px] font-bold uppercase tracking-wide text-[#5C4E3E] mb-1 flex items-center justify-between`;

// ── Item card wrapper ──────────────────────────────────────────────
function ItemCard({
  children,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: {
  children: React.ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className="bg-[#FFFEF9] border border-[#E8DDD0] rounded-2xl p-4 space-y-3 relative group shadow-xs hover:border-[#C2600E]/50 transition-all duration-200">
      <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="p-1.5 rounded-lg text-slate-400 hover:text-[#C2600E] hover:bg-[#F5EFEB] disabled:opacity-25 transition-colors cursor-pointer" title="Move Up"><ArrowUp size={13} /></button>
        <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="p-1.5 rounded-lg text-slate-400 hover:text-[#C2600E] hover:bg-[#F5EFEB] disabled:opacity-25 transition-colors cursor-pointer" title="Move Down"><ArrowDown size={13} /></button>
        <button type="button" onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-[#B23A2E] hover:bg-rose-50 transition-colors cursor-pointer" title="Delete"><Trash2 size={13} /></button>
      </div>
      {children}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function ResumeBuilderForm({
  resumeId,
  initialData,
  onChange,
  onSaveStatusChange: _onSaveStatusChange,
  saveStatus: _saveStatus = 'saved',
  templateId = null,
  onPreviewPdf: _onPreviewPdf,
}: ResumeBuilderFormProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<any>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const isUserEditing = useRef(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Track blurred fields for soft non-blocking validation
  const [blurredFields, setBlurredFields] = useState<Record<string, boolean>>({});
  const markBlurred = (fieldKey: string) => setBlurredFields(prev => ({ ...prev, [fieldKey]: true }));

  // Modal / Prompt for Adding Custom Section
  const [customSectionModalOpen, setCustomSectionModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // ── State management ───────────────────────────────────────────
  const updateFormState = (updater: (prev: any) => any) => {
    isUserEditing.current = true;
    setFormData(updater);
  };

  useEffect(() => {
    if (formData && isUserEditing.current) {
      onChangeRef.current(formData);
      isUserEditing.current = false;
    }
  }, [formData]);

  const lastInitialDataRef = useRef<string | null>(null);
  useEffect(() => {
    if (!initialData) return;
    const str = JSON.stringify(initialData);
    if (lastInitialDataRef.current !== str) {
      lastInitialDataRef.current = str;
      isUserEditing.current = false;
      setFormData(initialData);
    }
  }, [initialData]);

  // ── Low-confidence helpers ────────────────────────────────────
  const clearLowConfidenceField = (prev: any, field: string) => {
    if (!prev.importMetadata?.lowConfidenceFields) return prev;
    return { ...prev, importMetadata: { ...prev.importMetadata, lowConfidenceFields: prev.importMetadata.lowConfidenceFields.filter((f: string) => f !== field) } };
  };
  const isLowConf = (field: string) => !!formData?.importMetadata?.lowConfidenceFields?.includes(field);
  const getFieldClass = (field: string) => isLowConf(field)
    ? `w-full h-9 px-3 rounded-xl border text-[13px] focus:outline-none transition-all duration-150 border-[#B5790C] focus:ring-2 focus:ring-[#B5790C]/20 bg-[#FEF3C7] text-[#241C12]`
    : inputClass;

  // ── Field updaters ────────────────────────────────────────────
  const updatePersonalInfo = (field: string, value: string) =>
    updateFormState((prev: any) => clearLowConfidenceField({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }, field));

  // Education
  const addEducation = () => updateFormState((p: any) => ({ ...p, education: [...(p.education || []), { degree: '', school: '', duration: '', details: '' }] }));
  const removeEducation = (i: number) => updateFormState((p: any) => ({ ...p, education: p.education.filter((_: any, idx: number) => idx !== i) }));
  const updateEducation = (i: number, field: string, val: string) => updateFormState((p: any) => {
    const list = [...(p.education || [])]; list[i] = { ...list[i], [field]: val };
    return clearLowConfidenceField({ ...p, education: list }, 'education');
  });

  // Skills
  const addSkill = () => updateFormState((p: any) => ({ ...p, skills: [...(p.skills || []), { category: '', items: [] }] }));
  const removeSkill = (i: number) => updateFormState((p: any) => ({ ...p, skills: p.skills.filter((_: any, idx: number) => idx !== i) }));
  const updateSkillCategory = (i: number, v: string) => updateFormState((p: any) => { const list = [...(p.skills || [])]; list[i] = { ...list[i], category: v }; return clearLowConfidenceField({ ...p, skills: list }, 'skills'); });
  const updateSkillItems = (i: number, csv: string) => updateFormState((p: any) => { const list = [...(p.skills || [])]; list[i] = { ...list[i], items: csv.split(',').map((s: string) => s.trim()).filter(Boolean) }; return clearLowConfidenceField({ ...p, skills: list }, 'skills'); });

  // Projects
  const addProject = () => updateFormState((p: any) => ({ ...p, projects: [...(p.projects || []), { name: '', technologies: [], description: '', url: '', github: '' }] }));
  const removeProject = (i: number) => updateFormState((p: any) => ({ ...p, projects: p.projects.filter((_: any, idx: number) => idx !== i) }));
  const updateProject = (i: number, field: string, val: any) => updateFormState((p: any) => {
    const list = [...(p.projects || [])];
    list[i] = field === 'technologies' ? { ...list[i], technologies: val.split(',').map((s: string) => s.trim()).filter(Boolean) } : { ...list[i], [field]: val };
    return { ...p, projects: list };
  });

  // Experience
  const addExperience = () => updateFormState((p: any) => ({ ...p, experience: [...(p.experience || []), { role: '', company: '', duration: '', location: '', bullets: [] }] }));
  const removeExperience = (i: number) => updateFormState((p: any) => ({ ...p, experience: p.experience.filter((_: any, idx: number) => idx !== i) }));
  const updateExperience = (i: number, field: string, val: any) => updateFormState((p: any) => {
    const list = [...(p.experience || [])];
    list[i] = field === 'bullets' ? { ...list[i], bullets: val.split('\n').map((s: string) => s.trim()).filter(Boolean) } : { ...list[i], [field]: val };
    return clearLowConfidenceField({ ...p, experience: list }, 'experience');
  });

  // Certifications
  const addCert = () => updateFormState((p: any) => ({ ...p, certifications: [...(p.certifications || []), { name: '', issuer: '', date: '' }] }));
  const removeCert = (i: number) => updateFormState((p: any) => ({ ...p, certifications: (p.certifications || []).filter((_: any, idx: number) => idx !== i) }));
  const updateCert = (i: number, field: string, val: string) => updateFormState((p: any) => { const list = [...(p.certifications || [])]; list[i] = { ...list[i], [field]: val }; return { ...p, certifications: list }; });

  // Achievements
  const addAchievement = () => updateFormState((p: any) => ({ ...p, achievements: [...(p.achievements || []), { title: '', description: '' }] }));
  const removeAchievement = (i: number) => updateFormState((p: any) => ({ ...p, achievements: (p.achievements || []).filter((_: any, idx: number) => idx !== i) }));
  const updateAchievement = (i: number, field: string, val: string) => updateFormState((p: any) => { const list = [...(p.achievements || [])]; list[i] = { ...list[i], [field]: val }; return { ...p, achievements: list }; });

  // Additional info
  const updateAdditionalInfo = (field: string, val: string) => updateFormState((p: any) => ({ ...p, additionalInfo: { ...(p.additionalInfo || {}), [field]: val } }));

  // ── Custom Sections Handlers (PART 4) ─────────────────────────
  const handleAddCustomSection = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSectionTitle.trim()) return;
    const title = newSectionTitle.trim();
    const newId = `custom-${Date.now()}`;
    const newSection = {
      id: newId,
      title,
      items: [
        { id: `item-1`, heading: '', duration: '', description: '' }
      ]
    };

    updateFormState((p: any) => {
      const existing = p.customSections || [];
      const updatedOrder = p.customization?.sectionOrder ? [...p.customization.sectionOrder, newId] : undefined;
      return {
        ...p,
        customSections: [...existing, newSection],
        customization: updatedOrder ? { ...p.customization, sectionOrder: updatedOrder } : p.customization
      };
    });

    const newIndex = (formData?.customSections?.length || 0);
    setActiveStep(100 + newIndex);
    setNewSectionTitle('');
    setCustomSectionModalOpen(false);
  };

  const removeCustomSection = (secIdx: number) => {
    updateFormState((p: any) => {
      const list = [...(p.customSections || [])];
      list.splice(secIdx, 1);
      return { ...p, customSections: list };
    });
    setActiveStep(1);
  };

  const addCustomSectionItem = (secIdx: number) => {
    updateFormState((p: any) => {
      const list = [...(p.customSections || [])];
      const sec = { ...list[secIdx] };
      sec.items = [...(sec.items || []), { id: `item-${Date.now()}`, heading: '', duration: '', description: '' }];
      list[secIdx] = sec;
      return { ...p, customSections: list };
    });
  };

  const updateCustomSectionItem = (secIdx: number, itemIdx: number, field: string, val: string) => {
    updateFormState((p: any) => {
      const list = [...(p.customSections || [])];
      const sec = { ...list[secIdx] };
      const items = [...(sec.items || [])];
      items[itemIdx] = { ...items[itemIdx], [field]: val };
      sec.items = items;
      list[secIdx] = sec;
      return { ...p, customSections: list };
    });
  };

  const removeCustomSectionItem = (secIdx: number, itemIdx: number) => {
    updateFormState((p: any) => {
      const list = [...(p.customSections || [])];
      const sec = { ...list[secIdx] };
      sec.items = (sec.items || []).filter((_: any, idx: number) => idx !== itemIdx);
      list[secIdx] = sec;
      return { ...p, customSections: list };
    });
  };

  const moveCustomSectionItem = (secIdx: number, itemIdx: number, dir: 'up' | 'down') => {
    updateFormState((p: any) => {
      const list = [...(p.customSections || [])];
      const sec = { ...list[secIdx] };
      const items = [...(sec.items || [])];
      const target = dir === 'up' ? itemIdx - 1 : itemIdx + 1;
      if (target < 0 || target >= items.length) return p;
      [items[itemIdx], items[target]] = [items[target], items[itemIdx]];
      sec.items = items;
      list[secIdx] = sec;
      return { ...p, customSections: list };
    });
  };

  // Reorder for standard sections
  const moveItem = (section: string, i: number, dir: 'up' | 'down') => updateFormState((prev: any) => {
    const list = [...(prev[section] || [])];
    const target = dir === 'up' ? i - 1 : i + 1;
    if (target < 0 || target >= list.length) return prev;
    [list[i], list[target]] = [list[target], list[i]];
    return { ...prev, [section]: list };
  });

  // ── Completion states ─────────────────────────────────────────
  const isPersonalInfoComplete = !!(formData?.personalInfo?.fullName?.trim() && formData?.personalInfo?.email?.trim() && formData?.personalInfo?.phone?.trim() && formData?.personalInfo?.location?.trim());
  const isSummaryComplete = !!formData?.personalInfo?.summary?.trim();
  const isEducationComplete = !!(formData?.education?.length > 0);
  const isSkillsComplete = !!(formData?.skills?.length > 0 && formData.skills.some((s: any) => s.items?.length > 0));
  const isProjectsComplete = !!(formData?.projects?.length > 0);
  const isExperienceComplete = !!(formData?.experience?.length > 0);
  const isCertsComplete = !!(formData?.certifications?.length > 0);
  const isAchievementsComplete = !!(formData?.achievements?.length > 0);
  const isAdditionalComplete = !!(formData?.additionalInfo?.languages?.trim() || formData?.additionalInfo?.interests?.trim());

  const customSections = formData?.customSections || [];

  const progressPercent = Math.round(
    [isPersonalInfoComplete, isSummaryComplete, isEducationComplete, isSkillsComplete, isProjectsComplete, isExperienceComplete, isCertsComplete, isAchievementsComplete, isAdditionalComplete].filter(Boolean).length / 9 * 100
  );

  const stepCompletion: Record<number, boolean> = {
    1: isPersonalInfoComplete, 2: isSummaryComplete, 3: isEducationComplete,
    4: isSkillsComplete, 5: isProjectsComplete, 6: isExperienceComplete,
    7: isCertsComplete, 8: isAchievementsComplete, 9: isAdditionalComplete,
  };

  if (!formData) {
    return (
      <div className="h-full w-full flex items-center justify-center gap-3 text-[#5C4E3E]">
        <Loader2 size={20} className="animate-spin text-[#C2600E]" />
        <span className="text-sm font-medium">Loading editor…</span>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="h-full flex bg-white border border-[#E8DDD0] rounded-2xl shadow-sm overflow-hidden text-[#241C12]">

      {/* ── Sidebar Navigation ──────────────────────────────────── */}
      <aside className="w-[195px] shrink-0 border-r border-[#E8DDD0] bg-[#FFFEF9] p-3 flex flex-col justify-between hidden sm:flex">
        <div className="space-y-2.5 flex-1 flex flex-col min-h-0">
          {/* Progress Bar */}
          <div className="px-2.5 py-1.5 border-b border-[#E8DDD0] shrink-0 pb-2.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#5C4E3E] mb-1.5">
              <span>Progress</span>
              <span className={progressPercent === 100 ? 'text-[#1F7A3D]' : 'text-[#C2600E]'}>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#EDE2D0] rounded-full overflow-hidden p-px">
              <div
                className={`h-full transition-all duration-500 rounded-full ${progressPercent === 100 ? 'bg-[#1F7A3D]' : 'bg-[#C2600E]'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step Items & Custom Sections */}
          <nav className="space-y-1.5 custom-scrollbar overflow-y-auto flex-1 pr-0.5">
            {BASE_STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isDone = stepCompletion[step.id];
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center justify-between pl-3 pr-2.5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 ease-out cursor-pointer group relative overflow-hidden ${
                    isActive
                      ? 'bg-[#F5EFEB] text-[#C2600E] shadow-2xs border border-[#E8DDD0]'
                      : 'text-[#5C4E3E] hover:bg-[#F5EFEB] hover:text-[#241C12]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#C2600E]" />
                  )}
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={`stroke-[2] shrink-0 transition-colors ${isActive ? 'text-[#C2600E]' : isDone ? 'text-[#1F7A3D]' : 'text-[#9A8C7E] group-hover:text-[#5C4E3E]'}`} />
                    <span className="truncate">{step.label}</span>
                  </div>
                  {isDone && <Check size={13} className="text-[#1F7A3D] shrink-0 stroke-[2.5]" />}
                </button>
              );
            })}

            {/* Custom Sections Navigation Items */}
            {customSections.map((sec: any, idx: number) => {
              const secStepId = 100 + idx;
              const isActive = activeStep === secStepId;
              const hasItems = sec.items && sec.items.length > 0 && sec.items.some((it: any) => it.heading?.trim());
              return (
                <button
                  key={sec.id || idx}
                  onClick={() => setActiveStep(secStepId)}
                  className={`w-full flex items-center justify-between pl-3 pr-2.5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 ease-out cursor-pointer group relative overflow-hidden ${
                    isActive
                      ? 'bg-[#F5EFEB] text-[#C2600E] shadow-2xs border border-[#E8DDD0]'
                      : 'text-[#5C4E3E] hover:bg-[#F5EFEB] hover:text-[#241C12]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#C2600E]" />
                  )}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LayersIcon size={15} className={`shrink-0 transition-colors ${isActive ? 'text-[#C2600E]' : hasItems ? 'text-[#1E6FA8]' : 'text-[#9A8C7E]'}`} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  {hasItems && <Check size={13} className="text-[#1E6FA8] shrink-0 stroke-[2.5]" />}
                </button>
              );
            })}
          </nav>

          {/* + Add Custom Section Button (Bottom of Sidebar) */}
          <div className="pt-2.5 border-t border-[#E8DDD0] shrink-0">
            <button
              onClick={() => setCustomSectionModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[11.5px] font-bold text-[#C2600E] bg-[#FAF6F2] hover:bg-[#FCE3C7]/60 border border-[#F4B77E]/60 transition-all duration-200 cursor-pointer shadow-2xs group"
              title="Add a custom section (e.g. Volunteer Experience, Publications)"
            >
              <Plus size={14} className="stroke-[2.5] text-[#C2600E] group-hover:rotate-90 transition-transform duration-200" />
              <span>Add Custom Section</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-white">

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* ── STEP 1: Personal Information ─────────────── */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Personal Information</h3>
                    <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Your contact details and live profile links appear at the top of your resume.</p>
                  </div>
                </div>
                {isLowConf('fullName') && (
                  <div className="flex items-start gap-2 p-2.5 bg-[#FEF3C7]/40 border border-[#B5790C]/40 rounded-[10px] text-[12px] text-[#B5790C]">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>Some fields were auto-extracted with low confidence. Please review highlighted fields.</span>
                  </div>
                )}

                {/* ── Resume Profile Photo ──────────────── */}
                <div className="space-y-1.5">
                  <label className={labelClass}><span>Resume Photo</span> <span className="text-[#9CA3AF] font-normal normal-case">(optional — for templates with headshot)</span></label>
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {formData?.personalInfo?.profileImage ? (
                        <>
                          <img
                            src={formData.personalInfo.profileImage}
                            alt="Resume photo"
                            className="h-12 w-12 rounded-full object-cover border-2 border-[#E0D5C5] shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => updatePersonalInfo('profileImage', '')}
                            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#B23A2E] text-white flex items-center justify-center shadow hover:bg-[#8B2D22] transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X size={8} />
                          </button>
                        </>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-[#FAF6F2] border-2 border-dashed border-[#E8DDD0] flex items-center justify-center">
                          <Camera size={16} className="text-[#9A8C7E]" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                          if (!validTypes.includes(file.type)) {
                            alert('Invalid file type. Only JPG, PNG, and WebP are allowed.');
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size exceeds 5MB. Please upload a smaller image.');
                            return;
                          }
                          setPhotoUploading(true);
                          try {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const dataUrl = reader.result as string;
                              updatePersonalInfo('profileImage', dataUrl);
                              setPhotoUploading(false);
                            };
                            reader.onerror = () => { setPhotoUploading(false); };
                            reader.readAsDataURL(file);
                          } catch {
                            setPhotoUploading(false);
                          }
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={photoUploading}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-[#E8DDD0] bg-[#FAF6F2] text-[11px] font-semibold text-[#5C4E3E] hover:bg-[#F5EFEB] transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                      >
                        {photoUploading ? <Loader2 size={11} className="animate-spin" /> : <Camera size={11} />}
                        {formData?.personalInfo?.profileImage ? 'Replace Photo' : 'Upload Photo'}
                      </button>
                      <p className="text-[9px] text-[#9CA3AF]">JPG, PNG, WebP · Max 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Full-width fields */}
                  {[
                    { id: 'fullName', label: 'Full Name', placeholder: 'e.g. Vamsi Krishna Tadisetti', type: 'text' },
                    { id: 'title', label: 'Job Title / Headline', placeholder: 'e.g. Lead Full Stack Developer', type: 'text' },
                    { id: 'email', label: 'Email Address', placeholder: 'e.g. name@example.com', type: 'email' },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id} className="space-y-1">
                      <label className={labelClass}><span>{label}</span></label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={formData.personalInfo?.[id] || ''}
                        onChange={(e) => updatePersonalInfo(id, e.target.value)}
                        className={getFieldClass(id)}
                      />
                    </div>
                  ))}

                  {/* Half-width fields */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'phone', label: 'Phone Number', placeholder: 'e.g. +91 99999 99999', type: 'text' },
                      { id: 'location', label: 'Location / City', placeholder: 'e.g. Hyderabad, India', type: 'text' },
                    ].map(({ id, label, placeholder, type }) => (
                      <div key={id} className="space-y-1">
                        <label className={labelClass}><span>{label}</span></label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={formData.personalInfo?.[id] || ''}
                          onChange={(e) => updatePersonalInfo(id, e.target.value)}
                          className={getFieldClass(id)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Profile Links with Icons & Soft onBlur URL Validation */}
                  {[
                    { id: 'website', label: 'Personal Website / Portfolio', placeholder: 'e.g. domain.dev or https://myportfolio.com', icon: Globe },
                    { id: 'github', label: 'GitHub Profile', placeholder: 'e.g. github.com/username', icon: GithubIcon },
                    { id: 'linkedin', label: 'LinkedIn Profile', placeholder: 'e.g. linkedin.com/in/username', icon: LinkedinIcon },
                  ].map(({ id, label, placeholder, icon: Icon }) => {
                    const val = formData.personalInfo?.[id] || '';
                    const isValid = isLikelyValidUrl(val);
                    const isBlurred = !!blurredFields[`personalInfo.${id}`];
                    const showWarning = val.trim().length > 0 && isBlurred && !isValid;
                    return (
                      <div key={id} className="space-y-1">
                        <label className={labelClass}>
                          <span className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-[#C2600E]" />
                            {label}
                          </span>
                          {showWarning && (
                            <span className="text-[9.5px] text-[#B5790C] bg-[#FEF3C7] px-2 py-0.5 rounded-md border border-[#FDE68A]/70 normal-case font-semibold">
                              Please enter a valid URL
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={placeholder}
                            value={val}
                            onChange={(e) => updatePersonalInfo(id, e.target.value)}
                            onBlur={() => markBlurred(`personalInfo.${id}`)}
                            className={`${getFieldClass(id)} ${showWarning ? 'border-[#D97706] focus:ring-[#D97706]/20 bg-[#FFFBEB]' : ''}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 2: Professional Summary ─────────────── */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Professional Summary</h3>
                    <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">A concise overview of your expertise, achievements, and unique capabilities.</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}><span>Summary / Professional Bio</span></label>
                  <textarea
                    rows={6}
                    placeholder="Write a concise overview of your expertise, achievements, and capabilities..."
                    value={formData.personalInfo?.summary || ''}
                    onChange={(e) => updateFormState((p: any) => ({ ...p, personalInfo: { ...p.personalInfo, summary: e.target.value } }))}
                    className={textareaClass}
                  />
                  <span className="text-[10px] text-[#9CA3AF] block text-right">
                    {formData.personalInfo?.summary?.length || 0} characters. Recommended: 300–500.
                  </span>
                </div>
              </div>
            )}

            {/* ── STEP 3: Education ────────────────────────── */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Education</h3>
                      <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Academic qualifications, universities, and performance.</p>
                    </div>
                  </div>
                  <button onClick={addEducation} className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#E8DDD0] bg-[#FAF6F2] text-[11px] font-bold text-[#5C4E3E] hover:bg-[#F5EFEB] transition-colors shadow-2xs shrink-0 cursor-pointer">
                    <Plus size={13} className="stroke-[2.5]" /> Add Education
                  </button>
                </div>
                {(formData.education || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E8DDD0] rounded-xl text-[#9A8C7E] text-[13px] bg-[#FAF6F2]/50">No educational entries added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.education || []).map((edu: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('education', i, 'up')} onMoveDown={() => moveItem('education', i, 'down')} onDelete={() => removeEducation(i)} canMoveUp={i > 0} canMoveDown={i < (formData.education || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}><span>Degree / Qualification</span></label>
                          <input type="text" placeholder="e.g. B.Tech in Computer Science" value={edu.degree || ''} onChange={(e) => updateEducation(i, 'degree', e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}><span>Institution / University</span></label>
                          <input type="text" placeholder="e.g. IIT Hyderabad" value={edu.school || ''} onChange={(e) => updateEducation(i, 'school', e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className={labelClass}><span>Duration / Date Range</span></label>
                            <input type="text" placeholder="e.g. 2018 - 2022" value={edu.duration || ''} onChange={(e) => updateEducation(i, 'duration', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}><span>Grades / CGPA / Details</span></label>
                            <input type="text" placeholder="e.g. GPA: 9.4/10" value={edu.details || ''} onChange={(e) => updateEducation(i, 'details', e.target.value)} className={inputClass} />
                          </div>
                        </div>
                      </div>
                    </ItemCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4: Skills ───────────────────────────── */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                      <Code2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Technical Skills</h3>
                      <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Organize skills by domain (e.g., Languages, Frameworks, Cloud, Databases).</p>
                    </div>
                  </div>
                  <button onClick={addSkill} className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#E8DDD0] bg-[#FAF6F2] text-[11px] font-bold text-[#5C4E3E] hover:bg-[#F5EFEB] transition-colors shadow-2xs shrink-0 cursor-pointer">
                    <Plus size={13} className="stroke-[2.5]" /> Add Category
                  </button>
                </div>
                {(formData.skills || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E8DDD0] rounded-xl text-[#9A8C7E] text-[13px] bg-[#FAF6F2]/50">No skill categories added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.skills || []).map((skill: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('skills', i, 'up')} onMoveDown={() => moveItem('skills', i, 'down')} onDelete={() => removeSkill(i)} canMoveUp={i > 0} canMoveDown={i < (formData.skills || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}><span>Category Name</span></label>
                          <input type="text" placeholder="e.g. Languages or Cloud & Infrastructure" value={skill.category || ''} onChange={(e) => updateSkillCategory(i, e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}><span>Skills (comma-separated)</span></label>
                          <input type="text" placeholder="e.g. React, Next.js, Node.js, TypeScript, Docker" value={skill.items?.join(', ') || ''} onChange={(e) => updateSkillItems(i, e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    </ItemCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 5: Projects (with Live Links & Validation) ── */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                      <FolderGit2 size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Projects & Portfolio</h3>
                      <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Showcase your technical projects, live demos, and repository links.</p>
                    </div>
                  </div>
                  <button onClick={addProject} className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#E8DDD0] bg-[#FAF6F2] text-[11px] font-bold text-[#5C4E3E] hover:bg-[#F5EFEB] transition-colors shadow-2xs shrink-0 cursor-pointer">
                    <Plus size={13} className="stroke-[2.5]" /> Add Project
                  </button>
                </div>
                {(formData.projects || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E8DDD0] rounded-xl text-[#9A8C7E] text-[13px] bg-[#FAF6F2]/50">No projects added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.projects || []).map((proj: any, i: number) => {
                    const isUrlValid = isLikelyValidUrl(proj.url || proj.liveLink);
                    const isGhValid = isLikelyValidUrl(proj.github);
                    const urlVal = proj.url || proj.liveLink || '';
                    const ghVal = proj.github || '';
                    const isUrlBlurred = !!blurredFields[`project.${i}.url`];
                    const isGhBlurred = !!blurredFields[`project.${i}.github`];
                    const showUrlWarning = urlVal.trim().length > 0 && isUrlBlurred && !isUrlValid;
                    const showGhWarning = ghVal.trim().length > 0 && isGhBlurred && !isGhValid;

                    return (
                      <ItemCard key={i} onMoveUp={() => moveItem('projects', i, 'up')} onMoveDown={() => moveItem('projects', i, 'down')} onDelete={() => removeProject(i)} canMoveUp={i > 0} canMoveDown={i < (formData.projects || []).length - 1}>
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <label className={labelClass}><span>Project Title</span></label>
                            <input type="text" placeholder="e.g. SmartCV — AI Resume Platform" value={proj.name || ''} onChange={(e) => updateProject(i, 'name', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}><span>Technologies Used (comma-separated)</span></label>
                            <input type="text" placeholder="e.g. Next.js, Supabase, TypeScript, Tailwind" value={proj.technologies?.join(', ') || ''} onChange={(e) => updateProject(i, 'technologies', e.target.value)} className={inputClass} />
                          </div>
                          
                          {/* Live Demo & GitHub Link Inputs */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className={labelClass}>
                                <span className="flex items-center gap-1">
                                  <ExternalLink size={12} className="text-[#C2600E]" /> Live Demo URL
                                </span>
                                {showUrlWarning && (
                                  <span className="text-[9px] text-[#B5790C] bg-[#FEF3C7] px-1.5 py-0.5 rounded border border-[#FDE68A]/70 normal-case font-semibold">
                                    Invalid URL
                                  </span>
                                )}
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. smartcv.co or https://app.dev"
                                value={urlVal}
                                onChange={(e) => updateProject(i, 'url', e.target.value)}
                                onBlur={() => markBlurred(`project.${i}.url`)}
                                className={`${inputClass} ${showUrlWarning ? 'border-[#D97706] focus:ring-[#D97706]/20 bg-[#FFFBEB]' : ''}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className={labelClass}>
                                <span className="flex items-center gap-1">
                                  <GithubIcon className="h-3 w-3 text-[#C2600E]" /> GitHub Repo URL
                                </span>
                                {showGhWarning && (
                                  <span className="text-[9px] text-[#B5790C] bg-[#FEF3C7] px-1.5 py-0.5 rounded border border-[#FDE68A]/70 normal-case font-semibold">
                                    Invalid URL
                                  </span>
                                )}
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. github.com/user/project"
                                value={ghVal}
                                onChange={(e) => updateProject(i, 'github', e.target.value)}
                                onBlur={() => markBlurred(`project.${i}.github`)}
                                className={`${inputClass} ${showGhWarning ? 'border-[#D97706] focus:ring-[#D97706]/20 bg-[#FFFBEB]' : ''}`}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className={labelClass}><span>Project Description</span></label>
                            <textarea rows={3} placeholder="Describe key achievements, architecture, and measurable impact..." value={proj.description || ''} onChange={(e) => updateProject(i, 'description', e.target.value)} className={textareaClass} />
                          </div>
                        </div>
                      </ItemCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 6: Experience ───────────────────────── */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Work Experience</h3>
                      <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Professional employment, internships, and key accomplishments.</p>
                    </div>
                  </div>
                  <button onClick={addExperience} className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#E8DDD0] bg-[#FAF6F2] text-[11px] font-bold text-[#5C4E3E] hover:bg-[#F5EFEB] transition-colors shadow-2xs shrink-0 cursor-pointer">
                    <Plus size={13} className="stroke-[2.5]" /> Add Experience
                  </button>
                </div>
                {(formData.experience || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E8DDD0] rounded-xl text-[#9A8C7E] text-[13px] bg-[#FAF6F2]/50">No experience entries added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.experience || []).map((exp: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('experience', i, 'up')} onMoveDown={() => moveItem('experience', i, 'down')} onDelete={() => removeExperience(i)} canMoveUp={i > 0} canMoveDown={i < (formData.experience || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}><span>Job Title / Position</span></label>
                          <input type="text" placeholder="e.g. Senior Full Stack Engineer" value={exp.role || ''} onChange={(e) => updateExperience(i, 'role', e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}><span>Company / Organization</span></label>
                          <input type="text" placeholder="e.g. Google or TechCorp Inc." value={exp.company || ''} onChange={(e) => updateExperience(i, 'company', e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className={labelClass}><span>Duration</span></label>
                            <input type="text" placeholder="e.g. May 2022 – Present" value={exp.duration || ''} onChange={(e) => updateExperience(i, 'duration', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}><span>Location (optional)</span></label>
                            <input type="text" placeholder="e.g. Bengaluru, India (Hybrid)" value={exp.location || ''} onChange={(e) => updateExperience(i, 'location', e.target.value)} className={inputClass} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}><span>Key Accomplishments (one bullet per line)</span></label>
                          <textarea rows={4} placeholder={`Architected real-time streaming pipeline processing 20M events/day\nReduced API latency by 45% using Redis caching and Next.js ISR`} value={exp.bullets?.join('\n') || ''} onChange={(e) => updateExperience(i, 'bullets', e.target.value)} className={textareaClass} />
                        </div>
                      </div>
                    </ItemCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 7: Certifications ───────────────────── */}
            {activeStep === 7 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                      <Award size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Certifications</h3>
                      <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Industry certifications, licenses, and verified credentials.</p>
                    </div>
                  </div>
                  <button onClick={addCert} className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#E8DDD0] bg-[#FAF6F2] text-[11px] font-bold text-[#5C4E3E] hover:bg-[#F5EFEB] transition-colors shadow-2xs shrink-0 cursor-pointer">
                    <Plus size={13} className="stroke-[2.5]" /> Add Certification
                  </button>
                </div>
                {(formData.certifications || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E8DDD0] rounded-xl text-[#9A8C7E] text-[13px] bg-[#FAF6F2]/50">No certifications added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.certifications || []).map((cert: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('certifications', i, 'up')} onMoveDown={() => moveItem('certifications', i, 'down')} onDelete={() => removeCert(i)} canMoveUp={i > 0} canMoveDown={i < (formData.certifications || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}><span>Certification Name</span></label>
                          <input type="text" placeholder="e.g. AWS Solutions Architect — Associate" value={cert.name || ''} onChange={(e) => updateCert(i, 'name', e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className={labelClass}><span>Issuing Organization</span></label>
                            <input type="text" placeholder="e.g. Amazon Web Services" value={cert.issuer || ''} onChange={(e) => updateCert(i, 'issuer', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}><span>Date Earned</span></label>
                            <input type="text" placeholder="e.g. Jan 2024" value={cert.date || ''} onChange={(e) => updateCert(i, 'date', e.target.value)} className={inputClass} />
                          </div>
                        </div>
                      </div>
                    </ItemCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 8: Achievements ──────────────────────── */}
            {activeStep === 8 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Achievements & Honors</h3>
                      <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Competitions won, hackathons, and special honors.</p>
                    </div>
                  </div>
                  <button onClick={addAchievement} className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#E8DDD0] bg-[#FAF6F2] text-[11px] font-bold text-[#5C4E3E] hover:bg-[#F5EFEB] transition-colors shadow-2xs shrink-0 cursor-pointer">
                    <Plus size={13} className="stroke-[2.5]" /> Add Achievement
                  </button>
                </div>
                {(formData.achievements || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E8DDD0] rounded-xl text-[#9A8C7E] text-[13px] bg-[#FAF6F2]/50">No achievements added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.achievements || []).map((ach: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('achievements', i, 'up')} onMoveDown={() => moveItem('achievements', i, 'down')} onDelete={() => removeAchievement(i)} canMoveUp={i > 0} canMoveDown={i < (formData.achievements || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}><span>Award / Achievement Title</span></label>
                          <input type="text" placeholder="e.g. Winner — Smart India Hackathon 2023" value={ach.title || ''} onChange={(e) => updateAchievement(i, 'title', e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}><span>Description</span></label>
                          <textarea rows={2} placeholder="Describe the achievement, scale, and specific contributions..." value={ach.description || ''} onChange={(e) => updateAchievement(i, 'description', e.target.value)} className={textareaClass} />
                        </div>
                      </div>
                    </ItemCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 9: Additional Info ───────────────────── */}
            {activeStep === 9 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E8DDD0]/80">
                  <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">Additional Information</h3>
                    <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Languages spoken, personal interests, and hobbies.</p>
                  </div>
                </div>
                <div className="bg-[#FAF6F2]/60 rounded-2xl border border-[#E8DDD0] p-4 space-y-3 shadow-2xs">
                  <div className="space-y-1">
                    <label className={labelClass}><span>Languages Spoken (comma-separated)</span></label>
                    <input type="text" placeholder="e.g. English (Fluent), Telugu (Native), Hindi (Conversational)" value={formData.additionalInfo?.languages || ''} onChange={(e) => updateAdditionalInfo('languages', e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}><span>Interests / Hobbies (comma-separated)</span></label>
                    <input type="text" placeholder="e.g. Open Source, Cloud Architecture, Chess" value={formData.additionalInfo?.interests || ''} onChange={(e) => updateAdditionalInfo('interests', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* ── DYNAMIC CUSTOM SECTIONS (PART 4) ───────────── */}
            {activeStep >= 100 && (() => {
              const secIdx = activeStep - 100;
              const sec = customSections[secIdx];
              if (!sec) return null;

              return (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD0]/80">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-[#FAF6F2] border border-[#E8DDD0] flex items-center justify-center text-[#C2600E] shrink-0 shadow-2xs">
                        <LayersIcon size={16} />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-[#241C12] tracking-tight">{sec.title}</h3>
                        <p className="text-[11.5px] text-[#5C4E3E] mt-0.5">Custom section entries render live on your resume and in PDF exports.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeCustomSection(secIdx)}
                        className="flex items-center gap-1 h-8 px-2.5 rounded-xl border border-rose-200 bg-rose-50 text-[11px] font-bold text-[#B23A2E] hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                        title="Delete this custom section"
                      >
                        <Trash2 size={12} /> Delete Section
                      </button>
                      <button
                        onClick={() => addCustomSectionItem(secIdx)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-[#E8DDD0] bg-[#FAF6F2] text-[11px] font-bold text-[#5C4E3E] hover:bg-[#F5EFEB] transition-colors shadow-2xs shrink-0 cursor-pointer"
                      >
                        <Plus size={13} className="stroke-[2.5]" /> Add Entry
                      </button>
                    </div>
                  </div>

                  {(sec.items || []).length === 0 && (
                    <div className="text-center py-6 border border-dashed border-[#E8DDD0] rounded-xl text-[#9A8C7E] text-[13px] bg-[#FAF6F2]/50">
                      No entries in this section yet. Click "+ Add Entry" to add one.
                    </div>
                  )}

                  <div className="space-y-3">
                    {(sec.items || []).map((item: any, i: number) => (
                      <ItemCard
                        key={item.id || i}
                        onMoveUp={() => moveCustomSectionItem(secIdx, i, 'up')}
                        onMoveDown={() => moveCustomSectionItem(secIdx, i, 'down')}
                        onDelete={() => removeCustomSectionItem(secIdx, i)}
                        canMoveUp={i > 0}
                        canMoveDown={i < (sec.items || []).length - 1}
                      >
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <label className={labelClass}><span>Heading / Role / Title</span></label>
                            <input
                              type="text"
                              placeholder="e.g. Volunteer Lead or Research Author"
                              value={item.heading || ''}
                              onChange={(e) => updateCustomSectionItem(secIdx, i, 'heading', e.target.value)}
                              className={inputClass}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className={labelClass}><span>Date Range / Organization (optional)</span></label>
                            <input
                              type="text"
                              placeholder="e.g. 2023 - Present or IEEE Conference"
                              value={item.duration || ''}
                              onChange={(e) => updateCustomSectionItem(secIdx, i, 'duration', e.target.value)}
                              className={inputClass}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className={labelClass}><span>Description / Details (multiline)</span></label>
                            <textarea
                              rows={3}
                              placeholder="Describe your contributions, key responsibilities, and highlights..."
                              value={item.description || ''}
                              onChange={(e) => updateCustomSectionItem(secIdx, i, 'description', e.target.value)}
                              className={textareaClass}
                            />
                          </div>
                        </div>
                      </ItemCard>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* ── Bottom Checklist Footer (when no template selected) ───── */}
        {!templateId && (
          <div className="shrink-0 border-t border-[#E8DDD0] bg-white/95 backdrop-blur-sm px-4 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-[10px] font-medium text-[#9A8C7E]">
                {[
                  { done: isPersonalInfoComplete, label: 'Personal Info' },
                  { done: isEducationComplete, label: 'Education' },
                  { done: isSkillsComplete, label: 'Skills' },
                  { done: isProjectsComplete, label: 'Projects' },
                ].map(({ done, label }) => (
                  <span key={label} className={`flex items-center gap-1 ${done ? 'text-[#1F7A3D]' : ''}`}>
                    {done ? <Check size={10} /> : <span className="h-2 w-2 rounded-full border border-current inline-block" />}
                    {label}
                  </span>
                ))}
              </div>
              <button
                onClick={() => { window.location.href = `/dashboard?tab=templates&source=builder&resumeId=${resumeId}`; }}
                className="h-8 px-3 rounded-[10px] bg-[#C2600E] hover:bg-[#9C4A08] text-white shadow-sm text-[11px] font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                Change Template <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Add Custom Section (PART 4) ──────────────────── */}
      {customSectionModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => e.target === e.currentTarget && setCustomSectionModalOpen(false)}
        >
          <div className="bg-white rounded-3xl border border-[#E8DDD0] shadow-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#241C12]">Add Custom Section</h3>
                <p className="text-[11px] text-[#5C4E3E]">Create a new custom section for your resume.</p>
              </div>
              <button
                onClick={() => setCustomSectionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#241C12] hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1.5">
              <label className={labelClass}><span>Popular Section Titles</span></label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Volunteer Experience',
                  'Publications',
                  'Languages',
                  'Awards & Honors',
                  'Patents',
                  'Leadership & Activities',
                  'Courses & Workshops',
                  'Key Strengths'
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setNewSectionTitle(suggestion)}
                    className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#FAF6F2] hover:bg-[#F5EFEB] text-[#5C4E3E] hover:text-[#C2600E] border border-[#E8DDD0] transition cursor-pointer"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Title Input */}
            <div className="space-y-1">
              <label className={labelClass}><span>Section Title</span></label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Volunteer Experience or Publications"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCustomSection();
                  if (e.key === 'Escape') setCustomSectionModalOpen(false);
                }}
                className={inputClass}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCustomSectionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C4E3E] hover:bg-[#F5EFEB] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddCustomSection()}
                disabled={!newSectionTitle.trim()}
                className="px-4 py-2 rounded-xl bg-[#C2600E] hover:bg-[#9C4A08] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={13} className="stroke-[2.5]" /> Create Section
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
