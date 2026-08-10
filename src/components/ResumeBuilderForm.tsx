'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User, FileText, GraduationCap, Code2, FolderGit2, Briefcase,
  Award, Trophy, HelpCircle, Plus, Trash2, ArrowUp, ArrowDown,
  Check, AlertCircle, ChevronRight, Loader2, Camera, X
} from 'lucide-react';

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

const STEPS = [
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

// ── Shared field style helpers ─────────────────────────────────────
const inputClass = `w-full h-9 px-3 rounded-[10px] border text-[13px] font-medium focus:outline-none transition-all duration-150 border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 hover:border-slate-300`;
const textareaClass = `w-full px-3 py-2.5 rounded-[10px] border text-[13px] font-medium focus:outline-none transition-all duration-150 resize-none leading-relaxed border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 hover:border-slate-300`;
const labelClass = `text-[10px] font-semibold uppercase tracking-wide text-[#64748B] mb-1 block`;

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
    <div className="border border-[#E2E8F0] rounded-xl p-4 space-y-3 relative group bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-200">
      <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] disabled:opacity-25 transition-colors cursor-pointer" title="Move Up"><ArrowUp size={13} /></button>
        <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] disabled:opacity-25 transition-colors cursor-pointer" title="Move Down"><ArrowDown size={13} /></button>
        <button type="button" onClick={onDelete} className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer" title="Delete"><Trash2 size={13} /></button>
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
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const _firstLoad = useRef(true);
  const isUserEditing = useRef(false);
  // Keep latest onChange in a ref so effects don't need it as a dependency.
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

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
  // formData is the only real trigger — onChangeRef is a stable ref, not a dep.
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



  // ── Export PDF ────────────────────────────────────────────────
  const _handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await fetch('/api/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resumeId, resume_data: formData, template_id: templateId }),
      });
      const res = await fetch(`/api/resumes/export-pdf?id=${resumeId}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${(formData?.personalInfo?.fullName || 'Resume').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ── Low-confidence helpers ────────────────────────────────────
  const clearLowConfidenceField = (prev: any, field: string) => {
    if (!prev.importMetadata?.lowConfidenceFields) return prev;
    return { ...prev, importMetadata: { ...prev.importMetadata, lowConfidenceFields: prev.importMetadata.lowConfidenceFields.filter((f: string) => f !== field) } };
  };
  const isLowConf = (field: string) => !!formData?.importMetadata?.lowConfidenceFields?.includes(field);
  const getFieldClass = (field: string) => isLowConf(field)
    ? `w-full h-9 px-3 rounded-[10px] border text-[13px] focus:outline-none transition-all duration-150 border-amber-400 focus:ring-2 focus:ring-amber-400/20 bg-amber-50 text-[#111827]`
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
  const addProject = () => updateFormState((p: any) => ({ ...p, projects: [...(p.projects || []), { name: '', technologies: [], description: '' }] }));
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

  // Reorder
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
  const _isChecklistComplete = isPersonalInfoComplete && isEducationComplete && isSkillsComplete && isProjectsComplete;

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
      <div className="h-full w-full flex items-center justify-center gap-3 text-[#6B7280]">
        <Loader2 size={20} className="animate-spin text-[#2563EB]" />
        <span className="text-sm font-medium">Loading editor…</span>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="h-full flex bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-[#E2E8F0] overflow-hidden text-[#111827]">

      {/* ── Sidebar Navigation ──────────────────────────────────── */}
      <aside className="w-[175px] shrink-0 border-r border-[#ECEDF3] bg-[#F8FAFC]/90 p-2.5 flex flex-col justify-between hidden sm:flex">
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="px-2.5 py-1.5 border-b border-[#ECEDF3] shrink-0 pb-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B] mb-1">
              <span>Progress</span>
              <span className={progressPercent === 100 ? 'text-emerald-600' : 'text-[#4F46E5]'}>{progressPercent}%</span>
            </div>
            <div className="h-1 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#6366F1] to-[#2563EB]'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step Items */}
          <nav className="space-y-0.5 custom-scrollbar overflow-y-auto max-h-[calc(100vh-140px)]">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isDone = stepCompletion[step.id];
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-[7px] rounded-xl text-[11px] font-bold transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-xs border border-[#E0E7FF]'
                      : 'text-[#64748B] hover:bg-white hover:text-[#0F172A] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={isActive ? 'text-[#4F46E5]' : isDone ? 'text-emerald-500' : 'text-[#94A3B8] group-hover:text-[#64748B]'} />
                    <span>{step.label}</span>
                  </div>
                  {isDone && <Check size={11} className="text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </nav>
        </div>


      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-[#F8FAFC]/50">

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-20">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* ── STEP 1: Personal Information ─────────────── */}
            {activeStep === 1 && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-[13px] font-bold text-[#111827]">Personal Information</h3>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">Your contact details appear at the top of your resume.</p>
                </div>
                {isLowConf('fullName') && (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-[10px] text-[12px] text-amber-700">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>Some fields were auto-extracted with low confidence. Please review highlighted fields.</span>
                  </div>
                )}

                {/* ── Resume Profile Photo ──────────────── */}
                <div className="space-y-1.5">
                  <label className={labelClass}>Resume Photo <span className="text-[#9CA3AF] font-normal normal-case">(optional — for templates with headshot)</span></label>
                  <div className="flex items-center gap-3">
                    {/* Photo preview / placeholder */}
                    <div className="relative shrink-0">
                      {formData?.personalInfo?.profileImage ? (
                        <>
                          <img
                            src={formData.personalInfo.profileImage}
                            alt="Resume photo"
                            className="h-12 w-12 rounded-full object-cover border-2 border-[#E2E8F0] shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => updatePersonalInfo('profileImage', '')}
                            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow hover:bg-rose-600 transition-colors"
                            title="Remove photo"
                          >
                            <X size={8} />
                          </button>
                        </>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-[#F3F4F6] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center">
                          <Camera size={16} className="text-[#9CA3AF]" />
                        </div>
                      )}
                    </div>

                    {/* Upload controls */}
                    <div className="flex flex-col gap-1.5">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validate type
                          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                          if (!validTypes.includes(file.type)) {
                            alert('Invalid file type. Only JPG, PNG, and WebP are allowed.');
                            return;
                          }
                          // Validate size (5MB)
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
                          // Reset input so same file can be re-selected
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={photoUploading}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-[#E2E8F0] bg-white text-[11px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-sm disabled:opacity-50"
                      >
                        {photoUploading ? <Loader2 size={11} className="animate-spin" /> : <Camera size={11} />}
                        {formData?.personalInfo?.profileImage ? 'Replace Photo' : 'Upload Photo'}
                      </button>
                      {formData?.personalInfo?.profileImage && (
                        <button
                          type="button"
                          onClick={() => updatePersonalInfo('profileImage', '')}
                          className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={10} /> Remove
                        </button>
                      )}
                      <p className="text-[9px] text-[#9CA3AF]">JPG, PNG, WebP · Max 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Full-width fields — long text values */}
                  {[
                    { id: 'fullName', label: 'Full Name', placeholder: 'e.g. Vamsi Krishna Tadisetti', type: 'text' },
                    { id: 'title', label: 'Job Title / Headline', placeholder: 'e.g. Lead Full Stack Developer', type: 'text' },
                    { id: 'email', label: 'Email Address', placeholder: 'e.g. name@example.com', type: 'email' },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id} className="space-y-1">
                      <label className={labelClass}>{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={formData.personalInfo?.[id] || ''}
                        onChange={(e) => updatePersonalInfo(id, e.target.value)}
                        className={getFieldClass(id)}
                      />
                    </div>
                  ))}
                  {/* Half-width fields — short values */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'phone', label: 'Phone Number', placeholder: 'e.g. +91 99999 99999', type: 'text' },
                      { id: 'location', label: 'Location / City', placeholder: 'e.g. Hyderabad, India', type: 'text' },
                    ].map(({ id, label, placeholder, type }) => (
                      <div key={id} className="space-y-1">
                        <label className={labelClass}>{label}</label>
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
                  {/* Full-width fields — URLs */}
                  {[
                    { id: 'website', label: 'Personal Website', placeholder: 'e.g. domain.dev', type: 'text' },
                    { id: 'github', label: 'GitHub Profile', placeholder: 'e.g. github.com/username', type: 'text' },
                    { id: 'linkedin', label: 'LinkedIn Profile', placeholder: 'e.g. linkedin.com/in/username', type: 'text' },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id} className="space-y-1">
                      <label className={labelClass}>{label}</label>
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
              </div>
            )}

            {/* ── STEP 2: Professional Summary ─────────────── */}
            {activeStep === 2 && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-[13px] font-bold text-[#111827]">Professional Summary</h3>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">A concise overview of your expertise and key achievements.</p>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Summary / Professional Bio</label>
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">Education</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Academic qualifications and institutions.</p>
                  </div>
                  <button onClick={addEducation} className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-[#E2E8F0] bg-white text-[11px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-sm shrink-0">
                    <Plus size={13} />Add Education
                  </button>
                </div>
                {(formData.education || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl text-[#9CA3AF] text-[13px]">No educational entries added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.education || []).map((edu: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('education', i, 'up')} onMoveDown={() => moveItem('education', i, 'down')} onDelete={() => removeEducation(i)} canMoveUp={i > 0} canMoveDown={i < (formData.education || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}>Degree / Certification</label>
                          <input type="text" placeholder="e.g. B.Tech in Computer Science" value={edu.degree || ''} onChange={(e) => updateEducation(i, 'degree', e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>Institution / School</label>
                          <input type="text" placeholder="e.g. IIT Hyderabad" value={edu.school || ''} onChange={(e) => updateEducation(i, 'school', e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className={labelClass}>Duration / Date Range</label>
                            <input type="text" placeholder="e.g. 2018 - 2022" value={edu.duration || ''} onChange={(e) => updateEducation(i, 'duration', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}>Grades / Core Modules</label>
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">Technical Skills</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Organize skills by category (e.g., Languages, Frameworks, Tools).</p>
                  </div>
                  <button onClick={addSkill} className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-[#E2E8F0] bg-white text-[11px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-sm shrink-0">
                    <Plus size={12} />Add Category
                  </button>
                </div>
                {(formData.skills || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl text-[#9CA3AF] text-[13px]">No skill categories added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.skills || []).map((skill: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('skills', i, 'up')} onMoveDown={() => moveItem('skills', i, 'down')} onDelete={() => removeSkill(i)} canMoveUp={i > 0} canMoveDown={i < (formData.skills || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}>Category Name</label>
                          <input type="text" placeholder="e.g. Programming Languages or Cloud & Infrastructure" value={skill.category || ''} onChange={(e) => updateSkillCategory(i, e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>Skills (comma-separated)</label>
                          <input type="text" placeholder="e.g. React, Next.js, Node.js, TypeScript" value={skill.items?.join(', ') || ''} onChange={(e) => updateSkillItems(i, e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    </ItemCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 5: Projects ─────────────────────────── */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">Projects</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Showcase your key technical projects and their impact.</p>
                  </div>
                  <button onClick={addProject} className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-[#E2E8F0] bg-white text-[11px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-sm shrink-0">
                    <Plus size={12} />Add Project
                  </button>
                </div>
                {(formData.projects || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl text-[#9CA3AF] text-[13px]">No projects added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.projects || []).map((proj: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('projects', i, 'up')} onMoveDown={() => moveItem('projects', i, 'down')} onDelete={() => removeProject(i)} canMoveUp={i > 0} canMoveDown={i < (formData.projects || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <label className={labelClass}>Project Name</label>
                            <input type="text" placeholder="e.g. SmartCV Builder" value={proj.name || ''} onChange={(e) => updateProject(i, 'name', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}>Technologies (comma-separated)</label>
                            <input type="text" placeholder="e.g. Next.js, Supabase, TypeScript" value={proj.technologies?.join(', ') || ''} onChange={(e) => updateProject(i, 'technologies', e.target.value)} className={inputClass} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>Project Description</label>
                          <textarea rows={3} placeholder="Describe the purpose, your role, and the impact of this project..." value={proj.description || ''} onChange={(e) => updateProject(i, 'description', e.target.value)} className={textareaClass} />
                        </div>
                      </div>
                    </ItemCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 6: Experience ───────────────────────── */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">Work Experience</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Professional roles, internships, and responsibilities.</p>
                  </div>
                  <button onClick={addExperience} className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-[#E2E8F0] bg-white text-[11px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-sm shrink-0">
                    <Plus size={12} />Add Experience
                  </button>
                </div>
                {(formData.experience || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl text-[#9CA3AF] text-[13px]">No experience entries added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.experience || []).map((exp: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('experience', i, 'up')} onMoveDown={() => moveItem('experience', i, 'down')} onDelete={() => removeExperience(i)} canMoveUp={i > 0} canMoveDown={i < (formData.experience || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}>Job Role / Title</label>
                          <input type="text" placeholder="e.g. Software Engineer Intern" value={exp.role || ''} onChange={(e) => updateExperience(i, 'role', e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>Company / Organization</label>
                          <input type="text" placeholder="e.g. SmartTech Solutions" value={exp.company || ''} onChange={(e) => updateExperience(i, 'company', e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className={labelClass}>Duration</label>
                            <input type="text" placeholder="e.g. May 2022 – Aug 2022" value={exp.duration || ''} onChange={(e) => updateExperience(i, 'duration', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}>Location (optional)</label>
                            <input type="text" placeholder="e.g. Remote or Hyderabad, India" value={exp.location || ''} onChange={(e) => updateExperience(i, 'location', e.target.value)} className={inputClass} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>Key Responsibilities (one bullet per line)</label>
                          <textarea rows={4} placeholder={`e.g. Led design migration to Next.js boosting load by 45%\nBuilt real-time dashboard capturing 10M daily events`} value={exp.bullets?.join('\n') || ''} onChange={(e) => updateExperience(i, 'bullets', e.target.value)} className={textareaClass} />
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">Certifications</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Professional certifications, licenses, or credentials.</p>
                  </div>
                  <button onClick={addCert} className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-[#E2E8F0] bg-white text-[11px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-sm shrink-0">
                    <Plus size={12} />Add Certification
                  </button>
                </div>
                {(formData.certifications || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl text-[#9CA3AF] text-[13px]">No certifications added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.certifications || []).map((cert: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('certifications', i, 'up')} onMoveDown={() => moveItem('certifications', i, 'down')} onDelete={() => removeCert(i)} canMoveUp={i > 0} canMoveDown={i < (formData.certifications || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}>Certification Name</label>
                          <input type="text" placeholder="e.g. AWS Solutions Architect" value={cert.name || ''} onChange={(e) => updateCert(i, 'name', e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className={labelClass}>Issuing Authority</label>
                            <input type="text" placeholder="e.g. Amazon Web Services" value={cert.issuer || ''} onChange={(e) => updateCert(i, 'issuer', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className={labelClass}>Date Earned</label>
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
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">Achievements & Awards</h3>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Competitions won, recognitions received, or significant milestones.</p>
                  </div>
                  <button onClick={addAchievement} className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-[#E2E8F0] bg-white text-[11px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-sm shrink-0">
                    <Plus size={12} />Add Achievement
                  </button>
                </div>
                {(formData.achievements || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-[#E2E8F0] rounded-xl text-[#9CA3AF] text-[13px]">No achievements added yet.</div>
                )}
                <div className="space-y-3">
                  {(formData.achievements || []).map((ach: any, i: number) => (
                    <ItemCard key={i} onMoveUp={() => moveItem('achievements', i, 'up')} onMoveDown={() => moveItem('achievements', i, 'down')} onDelete={() => removeAchievement(i)} canMoveUp={i > 0} canMoveDown={i < (formData.achievements || []).length - 1}>
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className={labelClass}>Achievement Title</label>
                          <input type="text" placeholder="e.g. Winner — Smart India Hackathon 2023" value={ach.title || ''} onChange={(e) => updateAchievement(i, 'title', e.target.value)} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>Brief Description</label>
                          <textarea rows={2} placeholder="Describe the competition, scale, and your contribution..." value={ach.description || ''} onChange={(e) => updateAchievement(i, 'description', e.target.value)} className={textareaClass} />
                        </div>
                      </div>
                    </ItemCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 9: Additional Info ───────────────────── */}
            {activeStep === 9 && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-[13px] font-bold text-[#111827]">Additional Information</h3>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">Languages spoken, interests, and hobbies that round out your profile.</p>
                </div>
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <div className="space-y-1">
                    <label className={labelClass}>Languages Spoken (comma-separated)</label>
                    <input type="text" placeholder="e.g. English (Fluent), Telugu (Native), Hindi (Conversational)" value={formData.additionalInfo?.languages || ''} onChange={(e) => updateAdditionalInfo('languages', e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Interests / Hobbies (comma-separated)</label>
                    <input type="text" placeholder="e.g. Open Source, Competitive Programming, Chess" value={formData.additionalInfo?.interests || ''} onChange={(e) => updateAdditionalInfo('interests', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Optional Checklist Footer (Only when no template selected) ───── */}
        {!templateId && (
          <div className="shrink-0 border-t border-[#ECEDF3] bg-white/95 backdrop-blur-sm px-4 py-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-[10px] font-medium text-[#6B7280]">
                {[
                  { done: isPersonalInfoComplete, label: 'Personal Info' },
                  { done: isEducationComplete, label: 'Education' },
                  { done: isSkillsComplete, label: 'Skills' },
                  { done: isProjectsComplete, label: 'Projects' },
                ].map(({ done, label }) => (
                  <span key={label} className={`flex items-center gap-1 ${done ? 'text-emerald-600' : ''}`}>
                    {done ? <Check size={10} /> : <span className="h-2 w-2 rounded-full border border-current inline-block" />}
                    {label}
                  </span>
                ))}
              </div>
              <button
                onClick={() => { window.location.href = `/dashboard?tab=templates&source=builder&resumeId=${resumeId}`; }}
                className="h-8 px-3 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm text-[11px] font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                Change Template <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
