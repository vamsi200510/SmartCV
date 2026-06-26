'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, FileText, GraduationCap, Code2, FolderGit2, Briefcase, 
  Award, Trophy, HelpCircle, Plus, Trash2, ArrowLeft, ArrowRight, Save, Check,
  ArrowUp, ArrowDown
} from 'lucide-react';

interface ResumeBuilderFormProps {
  resumeId: string;
  initialData: any;
  onChange: (data: any) => void;
  onSaveStatusChange: (status: 'saved' | 'saving' | 'error') => void;
  isDarkMode?: boolean;
  templateId?: string | null;
  onPreviewPdf?: () => void;
}

const TEMPLATE_NAMES: Record<string, string> = {
  'ats-professional': 'ATS Professional',
  'tech-minimal': 'Tech Minimal',
  'silicon-valley': 'Silicon Valley',
  'modern-gradient': 'Modern Gradient',
  'executive-pro': 'Executive Pro',
  'creative-portfolio': 'Creative Portfolio',
  'clean-academic': 'Clean Academic',
  'impact-startup': 'Impact Startup',
  'faang-elite': 'FAANG Elite',
  'one-page-compact': 'One Page Compact',
  'modern-two-column': 'Modern Two Column',
  'product-manager-pro': 'Product Manager Pro'
};

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Summary', icon: FileText },
  { id: 3, label: 'Education', icon: GraduationCap },
  { id: 4, label: 'Skills', icon: Code2 },
  { id: 5, label: 'Projects', icon: FolderGit2 },
  { id: 6, label: 'Experience', icon: Briefcase },
  { id: 7, label: 'Certifications', icon: Award },
  { id: 8, label: 'Achievements', icon: Trophy },
  { id: 9, label: 'Additional Info', icon: HelpCircle }
];

export default function ResumeBuilderForm({
  resumeId,
  initialData,
  onChange,
  onSaveStatusChange,
  isDarkMode = false,
  templateId = null,
  onPreviewPdf
}: ResumeBuilderFormProps) {

  const [activePanel, setActivePanel] = useState<'content' | 'design'>('content');
  const [exiting, setExiting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Customization state helpers
  const getCustomization = () => {
    return formData?.customization || {
      fontFamily: 'Inter',
      fontSize: 'medium',
      density: 'balanced',
      primaryColor: '#0f172a',
      visibleSections: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'],
      sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo']
    };
  };

  const updateCustomization = (field: string, value: any) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        customization: {
          ...getCustomization(),
          [field]: value
        }
      };
      return updated;
    });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const currentVisible = [...getCustomization().visibleSections];
    let updatedVisible;
    if (currentVisible.includes(sectionId)) {
      updatedVisible = currentVisible.filter(id => id !== sectionId);
    } else {
      updatedVisible = [...currentVisible, sectionId];
    }
    updateCustomization('visibleSections', updatedVisible);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const currentOrder = [...getCustomization().sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;
    updateCustomization('sectionOrder', currentOrder);
  };

  const saveResumeData = async (): Promise<boolean> => {
    onSaveStatusChange('saving');
    try {
      const response = await fetch('/api/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resumeId,
          resume_data: formData,
          template_id: templateId
        })
      });

      if (!response.ok) {
        throw new Error('Save operation failed');
      }

      onSaveStatusChange('saved');
      setIsDirty(false);
      return true;
    } catch (err: any) {
      console.error(err);
      onSaveStatusChange('error');
      return false;
    }
  };

  const handleSaveAndExit = async () => {
    setExiting(true);
    const success = await saveResumeData();
    setExiting(false);
    if (success) {
      window.location.href = '/dashboard';
    } else {
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);

    const saveSuccess = await saveResumeData();
    if (!saveSuccess) {
      alert('Failed to save the latest changes before exporting. Export aborted.');
      setIsExportingPdf(false);
      return;
    }

    try {
      const response = await fetch(`/api/resumes/export-pdf?id=${resumeId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to export PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Filename format: Resume_{ResumeTitle}.pdf (safe string)
      const resumeTitle = formData?.personalInfo?.fullName || 'Resume';
      const cleanTitle = resumeTitle
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '');

      a.download = `Resume_${cleanTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showToast('PDF downloaded successfully.', 'success');
    } catch (err: any) {
      console.error('[EXPORT-PDF] Client error:', err);
      alert('Export PDF failed: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };
  
  const inputClass = `w-full h-11 px-3.5 rounded-xl border text-xs focus:outline-none transition duration-150 ${
    isDarkMode 
      ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-indigo-500' 
      : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650/15 shadow-sm'
  }`;
  const textareaClass = `w-full p-3.5 rounded-xl border text-xs focus:outline-none transition resize-none leading-relaxed duration-150 ${
    isDarkMode 
      ? 'border-slate-800 bg-slate-950 text-slate-100 focus:border-indigo-500' 
      : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650/15 shadow-sm'
  }`;

  const getFieldInputClass = (fieldName: string) => {
    const isAmber = formData?.importMetadata?.lowConfidenceFields?.includes(fieldName);
    if (isAmber) {
      return `w-full h-11 px-3.5 rounded-xl border text-xs focus:outline-none transition duration-150 border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 bg-amber-500/5 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`;
    }
    return inputClass;
  };

  const renderLowConfidenceWarning = (fieldName: string) => {
    if (formData?.importMetadata?.lowConfidenceFields?.includes(fieldName)) {
      return (
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">
          Review Required: Auto-extraction confidence is low for this field.
        </span>
      );
    }
    return null;
  };

  const isLowConfidence = (fieldName: string) => {
    return !!formData?.importMetadata?.lowConfidenceFields?.includes(fieldName);
  };

  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const firstLoad = useRef(true);
  const isUserEditing = useRef(false);

  const updateFormState = (updater: (prev: any) => any) => {
    isUserEditing.current = true;
    setFormData(updater);
  };

  // Notify parent component on state changes
  useEffect(() => {
    if (formData && isUserEditing.current) {
      onChange(formData);
      setIsDirty(true);
      isUserEditing.current = false;
    }
  }, [formData, onChange]);

  // Sync initial data from parent
  useEffect(() => {
    if (initialData && firstLoad.current) {
      setFormData(initialData);
      firstLoad.current = false;
    }
  }, [initialData]);

  // Debounced Autosave Trigger
  useEffect(() => {
    if (!formData || !isDirty) return;

    onSaveStatusChange('saving');
    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch('/api/resumes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: resumeId,
            resume_data: formData
          })
        });

        if (!response.ok) {
          throw new Error('Database write operation failed');
        }

        onSaveStatusChange('saved');
        setIsDirty(false);
      } catch (err: any) {
        console.error('Autosave error:', err);
        onSaveStatusChange('error');
      }
    }, 1000); // 1000ms debounce save

    return () => clearTimeout(delayDebounce);
  }, [formData, isDirty, resumeId, onSaveStatusChange]);

  if (!formData) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500 py-12">
        <span className="h-6 w-6 rounded-full border-2 border-slate-800 border-t-teal-400 animate-spin mr-3" />
        <span className="text-xs">Initializing Editor Fields...</span>
      </div>
    );
  }

  // Update specific values in form data structure
  const clearLowConfidenceField = (prev: any, field: string) => {
    if (!prev.importMetadata?.lowConfidenceFields) return prev;
    return {
      ...prev,
      importMetadata: {
        ...prev.importMetadata,
        lowConfidenceFields: prev.importMetadata.lowConfidenceFields.filter((f: string) => f !== field)
      }
    };
  };

  const updatePersonalInfo = (field: string, value: string) => {
    updateFormState((prev: any) => {
      let updated = {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value
        }
      };
      updated = clearLowConfidenceField(updated, field);
      return updated;
    });
  };

  const updateSummary = (value: string) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          summary: value
        }
      };
      return updated;
    });
  };

  // Education Helpers
  const addEducation = () => {
    updateFormState((prev: any) => {
      const list = prev.education || [];
      const updatedList = [
        ...list,
        { degree: '', school: '', duration: '', details: '' }
      ];
      let updated = {
        ...prev,
        education: updatedList
      };
      updated = clearLowConfidenceField(updated, 'education');
      return updated;
    });
  };

  const removeEducation = (index: number) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        education: prev.education.filter((_: any, i: number) => i !== index)
      };
      return updated;
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    updateFormState((prev: any) => {
      const list = [...(prev.education || [])];
      list[index] = { ...list[index], [field]: value };
      let updated = { ...prev, education: list };
      updated = clearLowConfidenceField(updated, 'education');
      return updated;
    });
  };

  // Skills Helpers
  const addSkillCategory = () => {
    updateFormState((prev: any) => {
      let updated = {
        ...prev,
        skills: [
          ...(prev.skills || []),
          { category: '', items: [] }
        ]
      };
      updated = clearLowConfidenceField(updated, 'skills');
      return updated;
    });
  };

  const removeSkillCategory = (index: number) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        skills: prev.skills.filter((_: any, i: number) => i !== index)
      };
      return updated;
    });
  };

  const updateSkillCategory = (index: number, categoryName: string) => {
    updateFormState((prev: any) => {
      const list = [...(prev.skills || [])];
      list[index] = { ...list[index], category: categoryName };
      let updated = { ...prev, skills: list };
      updated = clearLowConfidenceField(updated, 'skills');
      return updated;
    });
  };

  const updateSkillItems = (index: number, itemsCsv: string) => {
    const arr = itemsCsv.split(',').map(s => s.trim()).filter(Boolean);
    updateFormState((prev: any) => {
      const list = [...(prev.skills || [])];
      list[index] = { ...list[index], items: arr };
      let updated = { ...prev, skills: list };
      updated = clearLowConfidenceField(updated, 'skills');
      return updated;
    });
  };

  // Projects Helpers
  const addProject = () => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        projects: [
          ...(prev.projects || []),
          { name: '', technologies: [], description: '' }
        ]
      };
      return updated;
    });
  };

  const removeProject = (index: number) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        projects: prev.projects.filter((_: any, i: number) => i !== index)
      };
      return updated;
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    updateFormState((prev: any) => {
      const list = [...(prev.projects || [])];
      if (field === 'technologies') {
        list[index] = { 
          ...list[index], 
          technologies: value.split(',').map((s: string) => s.trim()).filter(Boolean) 
        };
      } else {
        list[index] = { ...list[index], [field]: value };
      }
      const updated = { ...prev, projects: list };
      return updated;
    });
  };

  // Experience Helpers
  const addExperience = () => {
    updateFormState((prev: any) => {
      let updated = {
        ...prev,
        experience: [
          ...(prev.experience || []),
          { role: '', company: '', duration: '', location: '', bullets: [] }
        ]
      };
      updated = clearLowConfidenceField(updated, 'experience');
      return updated;
    });
  };

  const removeExperience = (index: number) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        experience: prev.experience.filter((_: any, i: number) => i !== index)
      };
      return updated;
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    updateFormState((prev: any) => {
      const list = [...(prev.experience || [])];
      if (field === 'bullets') {
        // split bullet textarea by line breaks
        list[index] = { 
          ...list[index], 
          bullets: value.split('\n').map((s: string) => s.trim()).filter(Boolean) 
        };
      } else {
        list[index] = { ...list[index], [field]: value };
      }
      let updated = { ...prev, experience: list };
      updated = clearLowConfidenceField(updated, 'experience');
      return updated;
    });
  };

  // Certifications Helpers
  const addCertification = () => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        certifications: [
          ...(prev.certifications || []),
          { name: '', issuer: '', date: '' }
        ]
      };
      return updated;
    });
  };

  const removeCertification = (index: number) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        certifications: (prev.certifications || []).filter((_: any, i: number) => i !== index)
      };
      return updated;
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    updateFormState((prev: any) => {
      const list = [...(prev.certifications || [])];
      list[index] = { ...list[index], [field]: value };
      const updated = { ...prev, certifications: list };
      return updated;
    });
  };

  // Achievements Helpers
  const addAchievement = () => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        achievements: [
          ...(prev.achievements || []),
          { title: '', description: '' }
        ]
      };
      return updated;
    });
  };

  const removeAchievement = (index: number) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        achievements: (prev.achievements || []).filter((_: any, i: number) => i !== index)
      };
      return updated;
    });
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    updateFormState((prev: any) => {
      const list = [...(prev.achievements || [])];
      list[index] = { ...list[index], [field]: value };
      const updated = { ...prev, achievements: list };
      return updated;
    });
  };

  // Additional Info Helpers
  const updateAdditionalInfo = (field: string, value: string) => {
    updateFormState((prev: any) => {
      const updated = {
        ...prev,
        additionalInfo: {
          ...(prev.additionalInfo || {}),
          [field]: value
        }
      };
      return updated;
    });
  };

  // Item Reordering Helper
  const moveItem = (section: 'education' | 'skills' | 'projects' | 'experience' | 'certifications' | 'achievements', index: number, direction: 'up' | 'down') => {
    updateFormState((prev: any) => {
      const list = [...(prev[section] || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      
      // Swap elements
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      
      const updated = { ...prev, [section]: list };
      return updated;
    });
  };

  // Validation Checklist checks
  const isPersonalInfoComplete = !!(
    formData?.personalInfo?.fullName?.trim() &&
    formData?.personalInfo?.email?.trim() &&
    formData?.personalInfo?.phone?.trim() &&
    formData?.personalInfo?.location?.trim()
  );
  
  const isSummaryComplete = !!formData?.personalInfo?.summary?.trim();
  const isEducationComplete = !!(formData?.education && formData.education.length > 0);
  const isSkillsComplete = !!(formData?.skills && formData.skills.length > 0 && formData.skills.some((s: any) => s.items && s.items.length > 0));
  const isProjectsComplete = !!(formData?.projects && formData.projects.length > 0);
  const isExperienceComplete = !!(formData?.experience && formData.experience.length > 0);
  const isCertificationsComplete = !!(formData?.certifications && formData.certifications.length > 0);
  const isAchievementsComplete = !!(formData?.achievements && formData.achievements.length > 0);
  const isAdditionalInfoComplete = !!(formData?.additionalInfo?.languages?.trim() || formData?.additionalInfo?.interests?.trim());
  
  const isChecklistComplete = isPersonalInfoComplete && isEducationComplete && isSkillsComplete && isProjectsComplete;

  // Progress Calculation - calculated dynamically based on whether each of the 9 sections has data
  const progressPercent = (() => {
    const sections = [
      isPersonalInfoComplete,
      isSummaryComplete,
      isEducationComplete,
      isSkillsComplete,
      isProjectsComplete,
      isExperienceComplete,
      isCertificationsComplete,
      isAchievementsComplete,
      isAdditionalInfoComplete
    ];
    const completedCount = sections.filter(Boolean).length;
    return Math.round((completedCount / sections.length) * 100);
  })();

  return (
    <div className={`h-full flex flex-col justify-between transition-colors duration-250 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* Panel Switcher (only shown after template selected) */}
      {templateId && (
        <div className={`flex border-b shrink-0 mb-4 transition-colors duration-200 ${isDarkMode ? 'border-slate-800' : 'border-slate-150'}`}>
          <button
            type="button"
            onClick={() => setActivePanel('content')}
            className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider transition cursor-pointer border-b-2 ${
              activePanel === 'content'
                ? isDarkMode ? 'text-teal-400 border-teal-400 font-bold' : 'text-indigo-650 border-indigo-650 font-bold'
                : 'text-slate-400 hover:text-slate-655 border-transparent'
            }`}
          >
            Resume Form
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('design')}
            className={`flex-1 py-2.5 text-center text-xs font-black uppercase tracking-wider transition cursor-pointer border-b-2 ${
              activePanel === 'design'
                ? isDarkMode ? 'text-teal-400 border-teal-400 font-bold' : 'text-indigo-650 border-indigo-650 font-bold'
                : 'text-slate-400 hover:text-slate-655 border-transparent'
            }`}
          >
            Template Customization
          </button>
        </div>
      )}

      {activePanel === 'content' ? (
        <>
          {/* Horizontal Step Tabs Selection */}
          <div className={`border-b pb-4 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-1.5 px-1 transition-colors duration-200 ${isDarkMode ? 'border-slate-800' : 'border-slate-150'}`}>
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10.5px] font-bold transition whitespace-nowrap cursor-pointer ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : isDarkMode ? 'bg-slate-900/40 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm'}`}
            >
              <StepIcon size={12} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className={`py-3 px-1 flex items-center justify-between text-[10px] font-bold text-slate-500 border-b shrink-0 transition-colors duration-200 ${isDarkMode ? 'border-slate-900' : 'border-slate-150'}`}>
        <span>Completion: {progressPercent}%</span>
        <div className={`w-40 h-1.5 rounded-full overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100 border border-slate-150 shadow-inner'}`}>
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Forms Content Area */}
      <div className="flex-grow overflow-y-auto py-5 space-y-4 px-1">
        
        {/* STEP 1: PERSONAL INFORMATION */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-fade-in-up">
            <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vamsi Krishna Tadisetti"
                  value={formData.personalInfo?.fullName || ''}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  className={getFieldInputClass('fullName')}
                />
                {renderLowConfidenceWarning('fullName')}
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Job Title / Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Full Stack Developer"
                  value={formData.personalInfo?.title || ''}
                  onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={formData.personalInfo?.email || ''}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  className={getFieldInputClass('email')}
                />
                {renderLowConfidenceWarning('email')}
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 99999 99999"
                  value={formData.personalInfo?.phone || ''}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  className={getFieldInputClass('phone')}
                />
                {renderLowConfidenceWarning('phone')}
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, India"
                  value={formData.personalInfo?.location || ''}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Personal Website</label>
                <input
                  type="text"
                  placeholder="e.g. domain.dev"
                  value={formData.personalInfo?.website || ''}
                  onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>GitHub Profile</label>
                <input
                  type="text"
                  placeholder="e.g. github.com/username"
                  value={formData.personalInfo?.github || ''}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>LinkedIn Profile</label>
                <input
                  type="text"
                  placeholder="e.g. linkedin.com/in/username"
                  value={formData.personalInfo?.linkedin || ''}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROFESSIONAL SUMMARY */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-fade-in-up">
            <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Professional Summary</h3>
            <div className="space-y-1.5">
              <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Summary / Professional Bio</label>
              <textarea
                placeholder="Write a concise overview of your expertise, achievements, and capabilities..."
                value={formData.personalInfo?.summary || ''}
                onChange={(e) => updateSummary(e.target.value)}
                className={textareaClass}
              />
              <span className="text-[9px] text-slate-600 block text-right">
                {formData.personalInfo?.summary?.length || 0} characters typed. Recommended: ~300-500 chars.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: EDUCATION */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-fade-in-up">
            {isLowConfidence('education') && (
              <div className="border border-amber-500 bg-amber-500/5 p-3.5 rounded-xl text-[10.5px] text-amber-600 dark:text-amber-400 font-bold">
                Review Required: Auto-extraction confidence is low for education. Please check or add educational entries.
              </div>
            )}
            <div className="flex justify-between items-center">
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Educational Profile</h3>
              <button
                onClick={addEducation}
                className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition duration-150 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-indigo-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-650 shadow-sm'}`}
              >
                <Plus size={12} />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-4">
              {(formData.education || []).map((edu: any, index: number) => (
                <div 
                  key={index}
                  className={`border rounded-2xl p-5 space-y-4 relative group transition-colors duration-200 ${isDarkMode ? 'border-slate-800 bg-slate-900/10 text-slate-200' : 'border-slate-200 bg-slate-50/50 text-slate-800 shadow-sm'}`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => moveItem('education', index, 'up')}
                      disabled={index === 0}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem('education', index, 'down')}
                      disabled={index === (formData.education || []).length - 1}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-450 hover:bg-rose-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Degree / Certification</label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech in Computer Science"
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Institution / School</label>
                      <input
                        type="text"
                        placeholder="e.g. IIT Hyderabad"
                        value={edu.school || ''}
                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Duration / Date Range</label>
                      <input
                        type="text"
                        placeholder="e.g. 2018 - 2022"
                        value={edu.duration || ''}
                        onChange={(e) => updateEducation(index, 'duration', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Grades / Core Modules</label>
                      <input
                        type="text"
                        placeholder="e.g. GPA: 9.4/10 or Distinction"
                        value={edu.details || ''}
                        onChange={(e) => updateEducation(index, 'details', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.education || formData.education.length === 0) && (
                <div className={`text-center py-8 border border-dashed rounded-2xl text-slate-500 text-xs ${isDarkMode ? 'border-slate-850' : 'border-slate-200'}`}>
                  No educational entries added yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: SKILLS */}
        {activeStep === 4 && (
          <div className="space-y-4 animate-fade-in-up">
            {isLowConfidence('skills') && (
              <div className="border border-amber-500 bg-amber-500/5 p-3.5 rounded-xl text-[10.5px] text-amber-600 dark:text-amber-400 font-bold">
                Review Required: Auto-extraction confidence is low for skills list. Please check or add skills.
              </div>
            )}
            <div className="flex justify-between items-center">
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Technical Skill Matrix</h3>
              <button
                onClick={addSkillCategory}
                className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition duration-150 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-indigo-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-650 shadow-sm'}`}
              >
                <Plus size={12} />
                <span>Add Category</span>
              </button>
            </div>

            <div className="space-y-4">
              {(formData.skills || []).map((skill: any, index: number) => (
                <div 
                  key={index}
                  className={`border rounded-2xl p-5 space-y-4 relative group transition-colors duration-200 ${isDarkMode ? 'border-slate-800 bg-slate-900/10 text-slate-200' : 'border-slate-200 bg-slate-50/50 text-slate-800 shadow-sm'}`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => moveItem('skills', index, 'up')}
                      disabled={index === 0}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem('skills', index, 'down')}
                      disabled={index === (formData.skills || []).length - 1}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSkillCategory(index)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-455 hover:bg-rose-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Skill Classification Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Programming Languages or Cloud & Infrastructure"
                        value={skill.category || ''}
                        onChange={(e) => updateSkillCategory(index, e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Skills list (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. React, Next.js, Node.js, Go, TypeScript"
                        value={skill.items?.join(', ') || ''}
                        onChange={(e) => updateSkillItems(index, e.target.value)}
                        className={inputClass}
                      />
                      <span className="text-[8.5px] text-slate-650 italic">Items will separate dynamically by commas in templates.</span>
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.skills || formData.skills.length === 0) && (
                <div className={`text-center py-8 border border-dashed rounded-2xl text-slate-500 text-xs ${isDarkMode ? 'border-slate-850' : 'border-slate-200'}`}>
                  No skill categories initialized yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: PROJECTS */}
        {activeStep === 5 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Project Highlights</h3>
              <button
                onClick={addProject}
                className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition duration-150 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-indigo-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-650 shadow-sm'}`}
              >
                <Plus size={12} />
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {(formData.projects || []).map((proj: any, index: number) => (
                <div 
                  key={index}
                  className={`border rounded-2xl p-5 space-y-4 relative group transition-colors duration-200 ${isDarkMode ? 'border-slate-800 bg-slate-900/10 text-slate-200' : 'border-slate-200 bg-slate-50/50 text-slate-800 shadow-sm'}`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => moveItem('projects', index, 'up')}
                      disabled={index === 0}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem('projects', index, 'down')}
                      disabled={index === (formData.projects || []).length - 1}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-455 hover:bg-rose-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Project Name</label>
                        <input
                          type="text"
                          placeholder="e.g. SmartCV Builder"
                          value={proj.name || ''}
                          onChange={(e) => updateProject(index, 'name', e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Technologies Used (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Next.js, Supabase, Go"
                          value={proj.technologies?.join(', ') || ''}
                          onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Project Description</label>
                      <textarea
                        placeholder="Briefly describe the purpose and impact of this project..."
                        value={proj.description || ''}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        className="w-full h-24 p-3 rounded-xl border border-slate-850 bg-slate-950 text-xs focus:border-indigo-500 focus:outline-none transition resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.projects || formData.projects.length === 0) && (
                <div className={`text-center py-8 border border-dashed rounded-2xl text-slate-500 text-xs ${isDarkMode ? 'border-slate-850' : 'border-slate-200'}`}>
                  No projects added yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: INTERNSHIPS & EXPERIENCE */}
        {activeStep === 6 && (
          <div className="space-y-4 animate-fade-in-up">
            {isLowConfidence('experience') && (
              <div className="border border-amber-500 bg-amber-500/5 p-3.5 rounded-xl text-[10.5px] text-amber-600 dark:text-amber-400 font-bold">
                Review Required: Auto-extraction confidence is low for work experience. Please check or add experience.
              </div>
            )}
            <div className="flex justify-between items-center">
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Internships & Experience</h3>
              <button
                onClick={addExperience}
                className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition duration-150 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-indigo-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-650 shadow-sm'}`}
              >
                <Plus size={12} />
                <span>Add Experience</span>
              </button>
            </div>

            <div className="space-y-4">
              {(formData.experience || []).map((exp: any, index: number) => (
                <div 
                  key={index}
                  className={`border rounded-2xl p-5 space-y-4 relative group transition-colors duration-200 ${isDarkMode ? 'border-slate-800 bg-slate-900/10 text-slate-200' : 'border-slate-200 bg-slate-50/50 text-slate-800 shadow-sm'}`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => moveItem('experience', index, 'up')}
                      disabled={index === 0}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem('experience', index, 'down')}
                      disabled={index === (formData.experience || []).length - 1}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-455 hover:bg-rose-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Job Role / Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineer Intern"
                        value={exp.role || ''}
                        onChange={(e) => updateExperience(index, 'role', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Organization / Company</label>
                      <input
                        type="text"
                        placeholder="e.g. SmartTech Solutions"
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Duration / Date Range</label>
                      <input
                        type="text"
                        placeholder="e.g. 2023 - Present or May 2022 - Aug 2022"
                        value={exp.duration || ''}
                        onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Location (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Remote or Hyderabad, India"
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(index, 'location', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Key Responsibilities (One bullet per line)</label>
                    <textarea
                      placeholder="e.g. Led design migration to Next.js boosting page load by 45%&#10;Built real-time dashboard analytics capturing 10M daily events"
                      value={exp.bullets?.join('\n') || ''}
                      onChange={(e) => updateExperience(index, 'bullets', e.target.value)}
                      className={textareaClass + " h-32"}
                    />
                    <span className="text-[8.5px] text-slate-650 italic">Separate each bullet achievement cleanly using line breaks.</span>
                  </div>
                </div>
              ))}

              {(!formData.experience || formData.experience.length === 0) && (
                <div className={`text-center py-8 border border-dashed rounded-2xl text-slate-500 text-xs ${isDarkMode ? 'border-slate-850' : 'border-slate-200'}`}>
                  No work experience entries added yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: CERTIFICATIONS */}
        {activeStep === 7 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Credentials & Certifications</h3>
              <button
                onClick={addCertification}
                className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition duration-150 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-indigo-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-650 shadow-sm'}`}
              >
                <Plus size={12} />
                <span>Add Credential</span>
              </button>
            </div>

            <div className="space-y-4">
              {(formData.certifications || []).map((cert: any, index: number) => (
                <div 
                  key={index}
                  className={`border rounded-2xl p-5 space-y-4 relative group transition-colors duration-200 ${isDarkMode ? 'border-slate-800 bg-slate-900/10 text-slate-200' : 'border-slate-200 bg-slate-50/50 text-slate-800 shadow-sm'}`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => moveItem('certifications', index, 'up')}
                      disabled={index === 0}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem('certifications', index, 'down')}
                      disabled={index === (formData.certifications || []).length - 1}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-455 hover:bg-rose-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Certification Name</label>
                      <input
                        type="text"
                        placeholder="e.g. AWS Certified Solutions Architect"
                        value={cert.name || ''}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Issuing Authority</label>
                      <input
                        type="text"
                        placeholder="e.g. Amazon Web Services (AWS)"
                        value={cert.issuer || ''}
                        onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Date Earned</label>
                      <input
                        type="text"
                        placeholder="e.g. Jan 2024"
                        value={cert.date || ''}
                        onChange={(e) => updateCertification(index, 'date', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.certifications || formData.certifications.length === 0) && (
                <div className={`text-center py-8 border border-dashed rounded-2xl text-slate-500 text-xs ${isDarkMode ? 'border-slate-850' : 'border-slate-200'}`}>
                  No certifications added yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 8: ACHIEVEMENTS */}
        {activeStep === 8 && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Achievements & Honors</h3>
              <button
                onClick={addAchievement}
                className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg flex items-center gap-1.5 transition duration-150 cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-indigo-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-650 shadow-sm'}`}
              >
                <Plus size={12} />
                <span>Add Achievement</span>
              </button>
            </div>

            <div className="space-y-4">
              {(formData.achievements || []).map((ach: any, index: number) => (
                <div 
                  key={index}
                  className={`border rounded-2xl p-5 space-y-4 relative group transition-colors duration-200 ${isDarkMode ? 'border-slate-800 bg-slate-900/10 text-slate-200' : 'border-slate-200 bg-slate-50/50 text-slate-800 shadow-sm'}`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => moveItem('achievements', index, 'up')}
                      disabled={index === 0}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem('achievements', index, 'down')}
                      disabled={index === (formData.achievements || []).length - 1}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition disabled:opacity-30 cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:bg-slate-50'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode 
                          ? 'border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-455 hover:bg-rose-500/5' 
                          : 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Achievement Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Winner of Smart India Hackathon 2023"
                        value={ach.title || ''}
                        onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Brief Description</label>
                      <textarea
                        placeholder="Describe your achievement, the competition, scale, or metrics..."
                        value={ach.description || ''}
                        onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                        className={textareaClass + " h-20"}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.achievements || formData.achievements.length === 0) && (
                <div className={`text-center py-8 border border-dashed rounded-2xl text-slate-500 text-xs ${isDarkMode ? 'border-slate-850' : 'border-slate-200'}`}>
                  No achievements listed yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 9: ADDITIONAL INFORMATION */}
        {activeStep === 9 && (
          <div className="space-y-4 animate-fade-in-up">
            <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>// Additional Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Languages Spoken (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. English, Telugu, Hindi"
                  value={formData.additionalInfo?.languages || ''}
                  onChange={(e) => updateAdditionalInfo('languages', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Interests / Hobbies (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Open Source Contribution, Photography, Chess"
                  value={formData.additionalInfo?.interests || ''}
                  onChange={(e) => updateAdditionalInfo('interests', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}
      </div>
        </>
      ) : (
        <div className="flex-grow overflow-y-auto py-2 space-y-5 px-1">
          <div className="space-y-1">
            <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-indigo-400' : 'text-indigo-655'}`}>// Document Layout Customizer</h3>
            <p className="text-[10.5px] text-slate-400">Configure visual themes, typography, and density ratios.</p>
          </div>

          {/* Font Family selector */}
          <div className="space-y-1.5">
            <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Font Family</label>
            <select
              value={getCustomization().fontFamily}
              onChange={(e) => updateCustomization('fontFamily', e.target.value)}
              className={inputClass}
            >
              <option value="Inter">Inter (Clean Sans)</option>
              <option value="Geist">Geist (Modern Tech)</option>
              <option value="Poppins">Poppins (Friendly Geometric)</option>
              <option value="Manrope">Manrope (Grotesque Sans)</option>
              <option value="Source Sans 3">Source Sans 3 (Adobe Classic)</option>
              <option value="IBM Plex Sans">IBM Plex Sans (Corporate)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Elegant)</option>
              <option value="Lato">Lato (Professional)</option>
            </select>
          </div>

          {/* Font Size selector */}
          <div className="space-y-1.5">
            <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Font Size</label>
            <select
              value={getCustomization().fontSize}
              onChange={(e) => updateCustomization('fontSize', e.target.value)}
              className={inputClass}
            >
              <option value="small">Small (10.5px)</option>
              <option value="medium">Medium (11.5px)</option>
              <option value="large">Large (12.5px)</option>
              <option value="extraLarge">Extra Large (13.5px)</option>
            </select>
          </div>

          {/* Spacing / Density selector */}
          <div className="space-y-1.5">
            <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Resume Density</label>
            <select
              value={getCustomization().density}
              onChange={(e) => updateCustomization('density', e.target.value)}
              className={inputClass}
            >
              <option value="compact">Compact (Tight spacing)</option>
              <option value="balanced">Balanced (Normal spacing)</option>
              <option value="spacious">Spacious (Relaxed spacing)</option>
            </select>
          </div>

          {/* Primary Theme Color buttons */}
          <div className="space-y-2">
            <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Primary Theme Color</label>
            <div className="flex items-center gap-3">
              {[
                { name: 'Slate', value: '#0f172a' },
                { name: 'Indigo', value: '#4f46e5' },
                { name: 'Emerald', value: '#10b981' },
                { name: 'Blue', value: '#2563eb' },
                { name: 'Rose', value: '#f43f5e' },
                { name: 'Amber', value: '#d97706' }
              ].map((color) => {
                const isSelected = getCustomization().primaryColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateCustomization('primaryColor', color.value)}
                    className={`h-7 w-7 rounded-full transition-transform cursor-pointer border flex items-center justify-center ${
                      isSelected ? 'scale-110 ring-2 ring-indigo-500/20' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value, borderColor: isSelected ? (isDarkMode ? '#ffffff' : '#000000') : 'transparent' }}
                    title={color.name}
                  >
                    {isSelected && (
                      <Check className="text-white drop-shadow-md" size={12} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show / Hide Sections */}
          <div className="space-y-2">
            <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Visible Sections</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'summary', label: 'Summary' },
                { id: 'experience', label: 'Experience' },
                { id: 'projects', label: 'Projects' },
                { id: 'skills', label: 'Skills' },
                { id: 'education', label: 'Education' },
                { id: 'certifications', label: 'Certifications' },
                { id: 'achievements', label: 'Achievements' },
                { id: 'additionalInfo', label: 'Additional Info' }
              ].map((sec) => {
                const isChecked = getCustomization().visibleSections.includes(sec.id);
                return (
                  <label key={sec.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSectionVisibility(sec.id)}
                      className="rounded border-slate-350 text-indigo-650 h-4.5 w-4.5 focus:ring-indigo-500"
                    />
                    <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{sec.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section Ordering */}
          <div className="space-y-2">
            <label className={`text-[9.5px] font-bold uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} block`}>Section Order</label>
            <div className={`border rounded-xl p-3 space-y-1.5 ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'}`}>
              {getCustomization().sectionOrder.map((secId: string, idx: number) => {
                const labelMap: Record<string, string> = {
                  summary: 'Summary',
                  experience: 'Experience',
                  projects: 'Projects',
                  skills: 'Skills',
                  education: 'Education',
                  certifications: 'Certifications',
                  achievements: 'Achievements',
                  additionalInfo: 'Additional Info'
                };
                return (
                  <div
                    key={secId}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold ${
                      isDarkMode ? 'bg-slate-900 border-slate-850 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                    }`}
                  >
                    <span>{labelMap[secId] || secId}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === getCustomization().sectionOrder.length - 1}
                        className="p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Checklist Card */}
      <div className={`mt-2 mb-4 border rounded-2xl p-4 transition-all duration-200 shrink-0 ${
        isChecklistComplete
          ? isDarkMode ? 'bg-emerald-950/10 border-emerald-900/40 text-emerald-450' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
          : isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-black uppercase tracking-wider">Required Sections Checklist</h4>
          {isChecklistComplete && (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
              {templateId ? "Template Selected ✓" : "Ready to Selection"}
            </span>
          )}
        </div>

        {!templateId ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                {isPersonalInfoComplete ? (
                  <Check className="text-emerald-500 shrink-0" size={13} />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-slate-350 shrink-0" />
                )}
                <span className={isPersonalInfoComplete ? 'text-emerald-600 dark:text-emerald-450 line-through' : 'text-slate-500'}>Personal Info</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isEducationComplete ? (
                  <Check className="text-emerald-500 shrink-0" size={13} />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-slate-350 shrink-0" />
                )}
                <span className={isEducationComplete ? 'text-emerald-600 dark:text-emerald-450 line-through' : 'text-slate-500'}>Education (1+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isSkillsComplete ? (
                  <Check className="text-emerald-500 shrink-0" size={13} />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-slate-350 shrink-0" />
                )}
                <span className={isSkillsComplete ? 'text-emerald-600 dark:text-emerald-450 line-through' : 'text-slate-500'}>Skills (1+)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isProjectsComplete ? (
                  <Check className="text-emerald-500 shrink-0" size={13} />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-slate-350 shrink-0" />
                )}
                <span className={isProjectsComplete ? 'text-emerald-600 dark:text-emerald-450 line-through' : 'text-slate-500'}>Projects (1+)</span>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex justify-between items-center gap-3">
              <p className="text-[9px] text-slate-450 leading-tight max-w-[220px]">
                {isChecklistComplete 
                  ? "All required sections are complete! You are ready to choose your template design."
                  : "Complete all 4 required sections to unlock the Template Gallery."}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (isChecklistComplete) {
                    window.location.href = `/templates?resumeId=${resumeId}`;
                  }
                }}
                disabled={!isChecklistComplete}
                className={`h-9 px-4 rounded-xl text-[10.5px] font-extrabold transition-all duration-200 flex items-center gap-1 cursor-pointer select-none shadow-sm ${
                  isChecklistComplete
                    ? 'bg-indigo-650 hover:bg-indigo-600 text-white shadow-indigo-600/10'
                    : 'bg-slate-200 dark:bg-slate-850 text-slate-400 dark:text-slate-600 border border-slate-300/30 cursor-not-allowed'
                }`}
              >
                <span>Choose Template Design</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${
                isDarkMode 
                  ? 'border-teal-500/20 bg-teal-500/5 text-teal-400' 
                  : 'bg-teal-50 border-teal-150 text-teal-700 shadow-sm'
              }`}>
                Selected Template: {TEMPLATE_NAMES[templateId] || templateId}
              </span>
            </div>
            
            <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[9.5px] text-slate-450 leading-tight max-w-[200px]">
                Your document layout is configured. Preview or export your PDF, or modify spacing and reorder sections.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/templates?resumeId=${resumeId}`;
                  }}
                  className={`h-8 px-3 rounded-lg text-[10px] font-extrabold transition duration-155 border cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-indigo-400 hover:bg-slate-850 hover:text-indigo-300'
                      : 'bg-indigo-50 border-indigo-100 text-indigo-655 hover:bg-indigo-100/50 shadow-sm'
                  }`}
                >
                  Change Template
                </button>
                <button
                  type="button"
                  onClick={onPreviewPdf}
                  className={`h-8 px-3 rounded-lg text-[10px] font-extrabold transition duration-155 border cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                      : 'bg-white border-slate-250 text-slate-705 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  Preview PDF
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className={`h-8 px-3 rounded-lg text-[10px] font-extrabold transition duration-155 border cursor-pointer disabled:opacity-50 ${
                    isDarkMode
                      ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 border-teal-500/20'
                      : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100 shadow-sm'
                  }`}
                >
                  {isExportingPdf ? 'Generating PDF...' : 'Export PDF'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  disabled={exiting}
                  className={`h-8 px-3 rounded-lg text-[10px] font-extrabold transition duration-155 border cursor-pointer disabled:opacity-55 ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                      : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  {exiting ? 'Saving...' : 'Save & Exit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back and Next navigation triggers */}
      <div className="pt-4 border-t border-slate-900 flex justify-between items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
          disabled={activeStep === 1}
          className={`px-4 h-11 border disabled:opacity-30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer duration-150 ${isDarkMode ? 'border-slate-850 hover:bg-slate-900 active:bg-slate-950 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm'}`}
        >
          <ArrowLeft size={14} />
          <span>Back Step</span>
        </button>

        {activeStep < STEPS.length ? (
          <button
            onClick={() => setActiveStep(prev => Math.min(prev + 1, STEPS.length))}
            className="px-5 h-11 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] shadow-lg shadow-indigo-600/10"
          >
            <span>Next Step</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <div className={`text-[10px] font-bold flex items-center gap-1 px-3 py-1 rounded-lg ${isDarkMode ? 'text-teal-400 bg-teal-500/5 border border-teal-500/10' : 'text-teal-600 bg-teal-50 border border-teal-100 shadow-sm'}`}>
            <Check size={12} className="stroke-[3]" />
            <span>Wizard Finished</span>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border text-[11px] font-bold bg-slate-900 text-white border-slate-850`}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-450 animate-pulse" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}
