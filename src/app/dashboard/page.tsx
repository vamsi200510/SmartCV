'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, CircuitBoard, Zap, Wrench, Building, Briefcase, 
  Calculator, Grid, ArrowLeft, ArrowRight, Plus, Eye, 
  Trash2, Clock, Check, AlertCircle, FileText, Database,
  Cpu, Battery, Settings, Compass, PenTool, Flame, Box, 
  ClipboardList, Globe, Users, TrendingUp, Home, Shield, 
  ShieldAlert, Sparkles, Menu, CheckCircle2, User, BookOpen, GraduationCap,
  Search, Sliders, ChevronRight, Moon, Sun, ArrowUpRight, Copy, MessageSquare, Loader2,
  Layout
} from 'lucide-react';

import TemplateRenderer from '@/components/TemplateRenderer';
import TemplateDetailsDrawer from '@/components/TemplateDetailsDrawer';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { ResumeTemplate } from '@/types/database.types';

// The 12 premium templates definitions
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

const FILTER_CATEGORIES = ['All', 'ATS Friendly', 'Fresher', 'Internship', 'Software Engineer', 'Product Manager', 'Designer', 'Experienced', 'Executive'];

// Category mapping to roles
const CATEGORY_ROLES: Record<string, string[]> = {
  'IT / Software': ['Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'AI/ML Engineer', 'Cyber Security Engineer'],
  'ECE': ['Embedded Engineer', 'VLSI Engineer', 'Electronics Engineer'],
  'EEE': ['Electrical Design Engineer', 'Power Systems Engineer', 'Control Systems Engineer', 'Renewable Energy Engineer'],
  'Mechanical': ['CAD Designer', 'Thermal Power Engineer', 'Automotive Systems Engineer', 'Robotics Engineer'],
  'Civil': ['Structural Designer', 'Geotechnical Engineer', 'Construction Project Manager', 'Urban Infrastructure Planner'],
  'MBA': ['Product Manager', 'Management Consultant', 'Financial Analyst', 'Business Development Manager'],
  'Commerce': ['Accountant', 'Tax Consultant', 'Audit Associate', 'Investment Analyst']
};



export default function DashboardPage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const router = useRouter();
  
  // Theme state: default white/light theme
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Sidebar tabs: 'home' | 'resumes' | 'templates' | 'ats' | 'ai' | 'settings'
  const [activeTab, setActiveTab] = useState<'home' | 'resumes' | 'templates' | 'ats' | 'ai' | 'settings'>('home');
  
  // Creation Flow step: 'dashboard' | 'creation-method-selection' | 'type-selection' | 'import-resume' | 'import-summary'
  const [step, setStep] = useState<'dashboard' | 'creation-method-selection' | 'type-selection' | 'import-resume' | 'import-summary'>('dashboard');
  const [selectedType, setSelectedType] = useState<string>('');

  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('Extracting resume data...');
  const [importError, setImportError] = useState<string | null>(null);

  const [importedData, setImportedData] = useState<any>(null);
  const [selectedCategoryOverride, setSelectedCategoryOverride] = useState('Experienced');

  const handleImportResume = async (file: File) => {
    setImportError(null);

    if (file.size > 10 * 1024 * 1024) {
      setImportError("File exceeds maximum size limit of 10MB.");
      return;
    }

    setIsImporting(true);
    setImportStatus('Extracting resume data...');

    // 10-second warning timer
    const warningTimer = setTimeout(() => {
      setImportStatus('Still processing your resume...');
    }, 10000);

    try {
      const formData = new FormData();
      formData.append('file', file);


      const response = await fetch('/api/resumes/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to extract resume data. Please complete fields manually.');
      }



      // Success! Move to summary
      setImportedData(result);
      setSelectedCategoryOverride(result.detectedType);
      setStep('import-summary');
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || 'Unable to extract resume data. Please complete fields manually.');
    } finally {
      setIsImporting(false);
      clearTimeout(warningTimer);
    }
  };

  const handleReviewAndContinue = async () => {
    if (!importedData) return;
    
    // If the category was overridden, update it in Supabase
    if (selectedCategoryOverride !== importedData.detectedType) {
      try {
        const { error } = await supabase
          .from('resumes')
          .update({ category: selectedCategoryOverride })
          .eq('id', importedData.id);
        if (error) throw error;
      } catch (err) {
        console.error('Failed to update overridden category in database:', err);
      }
    }

    // Stage 7: Builder redirect on client
    console.log('[DEBUG-STAGE-7-CLIENT] Redirecting to builder:', {
      redirectUrl: `/builder?resumeId=${importedData.id}`,
      resumeId: importedData.id
    });

    router.push(`/builder?resumeId=${importedData.id}`);
  };

  // Resumes list state
  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [migrationSql, setMigrationSql] = useState<string | null>(null);
  const [isCreatingResume, setIsCreatingResume] = useState(false);

  // Settings tab form values state
  const [profileName, setProfileName] = useState('');
  const [profileDept, setProfileDept] = useState('IT / Software');
  const [profileGoal, setProfileGoal] = useState('');
  const [profileExp, setProfileExp] = useState('Fresher');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSettingsStatus, setSaveSettingsStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Inline Templates Gallery Filter
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  // Drawer & Preview states (used in templates tab)
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  
  // ATS Analyzer View states
  const [atsFile, setAtsFile] = useState<File | null>(null);
  const [atsUploading, setAtsUploading] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsFeedback, setAtsFeedback] = useState<any | null>(null);

  // AI Assistant View states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Optimization Assistant. Choose one of the quick suggestions below or type your summary description to optimize it for ATS metrics.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Sync client query parameters safely to avoid Next.js static Suspense issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsNewUser(params.get('new') === 'true');
      const tabParam = params.get('tab') as any;
      if (tabParam && ['home', 'resumes', 'templates', 'ats', 'ai', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Fetch user resumes
  const fetchResumes = async () => {
    setLoadingResumes(true);
    setApiError(null);
    try {
      const response = await fetch('/api/resumes');
      const data = await response.json();
      
      if (!response.ok) {
        if (data.migrationRequired) {
          setMigrationRequired(true);
          if (data.sql) setMigrationSql(data.sql);
        }
        throw new Error(data.error || 'Failed to fetch resumes');
      }
      
      setResumes(data);
      setMigrationRequired(false); // Clear warning on success
    } catch (err: any) {
      console.error(err);
      setApiError(err.message);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    if (user && step === 'dashboard') {
      fetchResumes();
    }
  }, [user, step]);

  // Sync profile details to Settings edit fields when profile shifts
  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || '');
      setProfileDept(profile.department || 'IT / Software');
      setProfileGoal(profile.career_goal || '');
      setProfileExp(profile.experience_level || 'Fresher');
    }
  }, [profile]);

  if (!user || !profile) {
    return null;
  }

  // Get first name from profile.full_name
  const emailPrefix = user.email?.split('@')[0];
  let firstName = '';
  if (profile.full_name && profile.full_name.trim() && profile.full_name !== emailPrefix) {
    firstName = profile.full_name.trim().split(' ')[0];
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  } else {
    firstName = 'Member';
  }

  // Starts resume wizard at Method Selection step
  const handleCreateResumeStart = () => {
    console.log('[CLIENT] Create Resume click. Current migrationRequired status:', migrationRequired);
    if (migrationRequired) {
      alert('Please execute SQL schema migrations before creating resumes in your Supabase SQL Editor.');
      return;
    }
    setSelectedType('');
    setStep('creation-method-selection');
  };

  // Delete resume
  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume draft?')) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh list
      setResumes(prev => prev.filter(r => r.id !== resumeId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete resume');
    }
  };

  // Handle profile settings updates submit
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      alert('Full Name is required.');
      return;
    }
    setSavingSettings(true);
    setSaveSettingsStatus('idle');
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileName,
          department: profileDept,
          careerGoal: profileGoal,
          experienceLevel: profileExp
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update settings');
      }
      
      await refreshProfile();
      setSaveSettingsStatus('success');
      setTimeout(() => setSaveSettingsStatus('idle'), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveSettingsStatus('error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle resume creation submission
  const handleCreateResumeSubmit = async (selectedResumeType: string) => {
    console.log('[CLIENT] handleCreateResumeSubmit triggered. selectedResumeType:', selectedResumeType);
    setIsCreatingResume(true);
    try {
      const userRole = profile?.career_goal || profile?.department || 'Job Candidate';
      const payload = {
        category: selectedResumeType,
        role: userRole,
        title: `${profile?.full_name || 'My'} - ${selectedResumeType}`
      };
      
      console.log('[CLIENT] Dispatching POST /api/resumes API request. Payload:', payload);
      
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[CLIENT] POST /api/resumes API response status:', response.status);
      
      const data = await response.json();
      console.log('[CLIENT] POST /api/resumes API response data:', data);

      if (!response.ok) {
        if (data.migrationRequired) {
          console.warn('[CLIENT] Schema migration is required according to server.');
          setMigrationRequired(true);
          if (data.sql) setMigrationSql(data.sql);
        }
        console.error('[CLIENT] Create resume draft failed. Server error:', data.error || data);
        throw new Error(data.error || 'Failed to create resume draft');
      }

      // Success -> Clear warning
      setMigrationRequired(false);

      const redirectUrl = `/builder?resumeId=${data.id}`;
      console.log('[CLIENT] Create resume draft successful. Redirecting to:', redirectUrl);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('[CLIENT] Exception in handleCreateResumeSubmit:', err);
      alert(err.message || 'Failed to create resume draft.');
    } finally {
      setIsCreatingResume(false);
    }
  };

  // Handle template selection from inline gallery in dashboard
  const handleSelectTemplate = async (templateId: string) => {
    if (resumes.length > 0) {
      const latestDraft = resumes[0]; // bind to most recent draft
      setIsSelecting(true);
      try {
        const response = await fetch('/api/resumes/select-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeId: latestDraft.id,
            templateId
          })
        });
        const d = await response.json();
        if (!response.ok) throw new Error(d.error || 'Failed to select template');
        router.push(`/builder?resumeId=${latestDraft.id}`);
      } catch (err: any) {
        alert(err.message || 'Failed to apply template design');
      } finally {
        setIsSelecting(false);
        setIsDrawerOpen(false);
        setIsPreviewModalOpen(false);
      }
    } else {
      // Redirect to type selection wizard
      handleCreateResumeStart();
      setIsDrawerOpen(false);
      setIsPreviewModalOpen(false);
    }
  };

  // Inline Templates Gallery Filter
  const filteredTemplates = TEMPLATE_METADATA.filter(tmpl => {
    if (activeFilter === 'All') return true;
    const filterLower = activeFilter.toLowerCase();
    return tmpl.best_for.some(tag => tag.toLowerCase() === filterLower) || 
           tmpl.recommended_role.toLowerCase().includes(filterLower);
  });

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

  // Mock ATS upload handler
  const handleAtsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAtsFile(file);
    setAtsUploading(true);
    setAtsScore(null);
    
    // Mock parsing latency
    setTimeout(() => {
      setAtsUploading(false);
      setAtsScore(88);
      setAtsFeedback({
        keywords: [
          { name: 'React', found: true },
          { name: 'Next.js', found: true },
          { name: 'TypeScript', found: true },
          { name: 'CI/CD Pipelines', found: false, rec: 'Add CI/CD pipelines deployment experience under SmartTech Solutions projects.' },
          { name: 'AWS Cloud', found: true },
          { name: 'Redis Caching', found: false, rec: 'Include Redis or caching optimization keywords in skills matrix.' }
        ],
        formatting: {
          spacing: 'Pass (Clean 8px padding structure detected)',
          headings: 'Pass (H1 tags clearly isolated)',
          fonts: 'Pass (Inter/Geist family parsed successfully)'
        },
        missingSections: []
      });
    }, 2500);
  };

  // Mock AI optimization handler
  const handleAiOptimize = (shortcut?: string) => {
    const promptText = shortcut || aiPrompt;
    if (!promptText.trim()) return;

    setAiChat(prev => [...prev, { sender: 'user', text: promptText }]);
    setAiPrompt('');
    setAiLoading(true);

    setTimeout(() => {
      let aiResponse = '';
      if (promptText.toLowerCase().includes('summary') || promptText.toLowerCase().includes('bio')) {
        aiResponse = 'Optimized ATS Summary:\n\n"Goal-driven Lead Full Stack and Product Engineer with 6+ years of verified software development experience. Technical specialization in Next.js, React, Node.js microservices, and GCP/AWS clouds. Proven track record leading agile developer engineering teams, reducing system latencies by 35%, and launching secure product features from ideation to production."';
      } else if (promptText.toLowerCase().includes('project') || promptText.toLowerCase().includes('bullet')) {
        aiResponse = 'Optimized Project Achievement Bullet:\n\n"• Designed and deployed an AI-assisted resume canvas builder using Next.js 16 and Supabase SSE, improving client edit render updates latency by 45% and boosting user conversion rates by 22%."';
      } else {
        aiResponse = `Optimized Technical Competencies listing for "${promptText}":\n\n"Languages & Core: JavaScript (ES6+), TypeScript, SQL, Go Lang, HTML5/CSS3\nFrameworks: React, Next.js, Node.js, Express, Tailwind CSS, Redux Toolkit\nDatabase & Cloud Infrastructure: PostgreSQL, Redis Caching, MongoDB, GCP, AWS, Docker."`;
      }
      setAiChat(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setAiLoading(false);
    }, 1800);
  };

  // Helper to calculate resume completion percentage based on 9 sections
  const calculateResumeCompletion = (resumeData: any) => {
    if (!resumeData) return 0;
    const pi = resumeData.personalInfo || {};
    const isPersonalInfoComplete = !!(
      pi.fullName?.trim() &&
      pi.email?.trim() &&
      pi.phone?.trim() &&
      pi.location?.trim()
    );
    
    const isSummaryComplete = !!pi.summary?.trim();
    const isEducationComplete = !!(resumeData.education && resumeData.education.length > 0);
    const isSkillsComplete = !!(
      resumeData.skills && 
      resumeData.skills.length > 0 && 
      resumeData.skills.some((s: any) => s.items && s.items.length > 0)
    );
    const isProjectsComplete = !!(resumeData.projects && resumeData.projects.length > 0);
    const isExperienceComplete = !!(resumeData.experience && resumeData.experience.length > 0);
    const isCertificationsComplete = !!(resumeData.certifications && resumeData.certifications.length > 0);
    const isAchievementsComplete = !!(resumeData.achievements && resumeData.achievements.length > 0);
    const isAdditionalInfoComplete = !!(
      resumeData.additionalInfo?.languages?.trim() || 
      resumeData.additionalInfo?.interests?.trim()
    );
    
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
  };

  // Helper to format last updated relative date
  const getRelativeLastUpdated = (resumesList: any[]) => {
    if (!resumesList || resumesList.length === 0) return '-';
    
    const dates = resumesList.map(r => new Date(r.updated_at).getTime()).filter(t => !isNaN(t));
    if (dates.length === 0) return '-';
    
    const latestTime = Math.max(...dates);
    const latestDate = new Date(latestTime);
    const nowDate = new Date();
    
    const latestDateMidnight = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate());
    const nowDateMidnight = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
    
    const diffTime = nowDateMidnight.getTime() - latestDateMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  // Real database-driven stats
  const totalResumes = resumes.length;
  const templatesUsed = new Set(resumes.map(r => r.template_id).filter(Boolean)).size;
  const lastUpdatedText = getRelativeLastUpdated(resumes);
  const completionRate = resumes.length > 0
    ? Math.round(resumes.reduce((acc, r) => acc + calculateResumeCompletion(r.resume_data), 0) / resumes.length)
    : 0;

  // Navigation Items Sidebar
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'resumes', label: 'My Resumes', icon: FileText },
    { id: 'templates', label: 'Templates Gallery', icon: Grid },
    { id: 'settings', label: 'Profile Settings', icon: Settings }
  ];

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background neon elements for dark mode */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
        </div>
      )}

      {/* Persistent Left Sidebar Workspace */}
      <aside className={`w-[260px] shrink-0 border-r flex flex-col justify-between p-6 transition-all duration-300 relative z-20 ${
        isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="space-y-8">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-650 flex items-center justify-center font-bold text-white shadow-md shadow-teal-500/10">
              S
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">
                SmartCV
              </span>
              <span className={`text-[8px] block font-bold tracking-widest uppercase -mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Member Space
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setStep('dashboard'); // return from Role selection if in progress
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? isDarkMode
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/10'
                        : 'bg-indigo-50 border border-indigo-100/30 text-indigo-650 shadow-sm shadow-indigo-650/5'
                      : 'border border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card Bottom area */}
        <div className={`border-t pt-4 flex items-center justify-between ${isDarkMode ? 'border-slate-900' : 'border-slate-150'}`}>
          <div className="flex items-center space-x-3 min-w-0">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 select-none ${
              isDarkMode ? 'bg-slate-900 border border-slate-850 text-teal-455' : 'bg-slate-100 text-indigo-650 border border-slate-200/50'
            }`}>
              {firstName ? firstName[0] : 'U'}
            </div>
            <div className="min-w-0">
              <span className={`text-xs font-bold block truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {profile?.full_name || 'User Member'}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">
                {profile?.email || user?.email}
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="h-8 w-8 rounded-lg hover:bg-rose-500/5 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
            title="Log Out"
          >
            <ArrowRight size={13} className="rotate-180" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* Header toolbar */}
        <header className={`h-[68px] px-8 border-b flex items-center justify-between shrink-0 transition-colors duration-300 ${
          isDarkMode ? 'border-slate-900 bg-slate-950/40' : 'bg-white border-slate-150 shadow-sm'
        }`}>
          <div>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">SmartCV Dashboard</span>
            <h2 className={`text-base font-extrabold capitalize -mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              {step === 'creation-method-selection' ? 'New Resume Wizard' : step === 'type-selection' ? 'Select Resume Type' : step === 'import-resume' ? 'Import Existing Resume' : step === 'import-summary' ? 'Import Summary Checklist' : activeTab === 'home' ? 'Workspace Hub' : activeTab === 'resumes' ? 'Your Resume Library' : activeTab === 'templates' ? 'Premium Document Gallery' : activeTab === 'ats' ? 'ATS Feedback Audit' : activeTab === 'ai' ? 'AI Optimization Studio' : 'Edit Profile Settings'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Direct resume trigger badge */}
            {step === 'dashboard' && resumes.length > 0 && !migrationRequired && (
              <button
                onClick={() => handleCreateResumeStart()}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                  isDarkMode
                    ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/10'
                    : 'bg-indigo-650 hover:bg-indigo-600 text-white shadow-indigo-650/10'
                }`}
              >
                <Plus size={13} className="stroke-[3]" />
                <span>New Resume</span>
              </button>
            )}

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-yellow-450 hover:text-yellow-400' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </header>

        {/* Content Pane Area */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto">
          {migrationRequired && (
            <div className={`mb-6 border rounded-2xl p-5 relative overflow-hidden transition-all duration-200 animate-fade-in-up ${
              isDarkMode 
                ? 'bg-rose-950/20 border-rose-900/40 text-rose-200' 
                : 'bg-rose-50 border-rose-100 text-rose-800 shadow-sm'
            }`}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${
                    isDarkMode ? 'bg-rose-900/30 border-rose-850 text-rose-400' : 'bg-white border-rose-250 text-rose-600 shadow-sm'
                  }`}>
                    <AlertCircle size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider">Database Setup Required</h3>
                    <p className={`text-[11px] leading-relaxed mt-1 ${isDarkMode ? 'text-rose-350' : 'text-rose-700'}`}>
                      SmartCV requires the correct <code className="font-mono bg-rose-500/10 px-1 py-0.5 rounded text-rose-650 font-bold text-[10px]">resumes</code> table structure to store your resume data. 
                      Please execute the SQL migration script in your Supabase SQL Editor to align the schema.
                    </p>
                  </div>
                </div>

                {migrationSql && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>Migration Script</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(migrationSql);
                          alert('SQL Script copied to clipboard!');
                        }}
                        className={`h-7 px-3 rounded-lg border text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                          isDarkMode 
                            ? 'bg-slate-900 hover:bg-slate-850 text-slate-350 border-slate-800' 
                            : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <Copy size={11} />
                        <span>Copy Script</span>
                      </button>
                    </div>
                    <pre className={`p-4 rounded-xl font-mono text-[10.5px] max-h-48 overflow-auto border leading-normal whitespace-pre ${
                      isDarkMode 
                        ? 'bg-slate-950/80 border-slate-900 text-slate-400' 
                        : 'bg-white border-slate-150 text-slate-655'
                    }`}>
                      {migrationSql}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            
            {/* Step 1: Default dashboard Views mapping active tabs */}
            {step === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-8 h-full"
              >
                
                {/* 1. HOME TAB */}
                {activeTab === 'home' && (
                  <div className="space-y-8 animate-fade-in-up">
                    
                    {/* Welcome banner */}
                    <div className={`relative border rounded-3xl p-6 sm:p-8 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${
                      isDarkMode ? 'bg-slate-900/35 border-slate-900' : 'bg-white border-slate-150'
                    }`}>
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-widest ${
                            isDarkMode ? 'bg-teal-500/10 text-teal-400 border border-teal-500/10' : 'bg-indigo-50 text-indigo-650'
                          }`}>
                            ✨ AI Portfolio gateway
                          </span>
                          <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                            Welcome back, {firstName} 👋
                          </h1>
                          <p className={`text-xs max-w-xl leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Build ATS-friendly resumes, audit compliance rates, and customize layout metrics. Let's create your next professional opportunity.
                          </p>
                        </div>

                        <button
                          onClick={() => handleCreateResumeStart()}
                          className={`h-11 px-5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.01] shadow-md cursor-pointer flex items-center gap-2 ${
                            isDarkMode ? 'bg-teal-500 hover:bg-teal-400 text-slate-950' : 'bg-indigo-650 hover:bg-indigo-600 text-white shadow-indigo-600/15'
                          }`}
                        >
                          <Plus size={15} />
                          <span>Create Resume</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats metrics widgets grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className={`p-5 border rounded-2xl ${isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150 shadow-sm'}`}>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Total Resumes</span>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{totalResumes}</span>
                          <span className="text-[10px] text-teal-500 font-bold">Drafts</span>
                        </div>
                      </div>

                      <div className={`p-5 border rounded-2xl ${isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150 shadow-sm'}`}>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Templates Used</span>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{templatesUsed}</span>
                          <span className="text-[10px] text-indigo-500 font-bold">Unique Designs</span>
                        </div>
                      </div>

                      <div className={`p-5 border rounded-2xl ${isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150 shadow-sm'}`}>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Last Updated</span>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{lastUpdatedText}</span>
                          <span className="text-[10px] text-teal-500 font-bold">Relative Date</span>
                        </div>
                      </div>

                      <div className={`p-5 border rounded-2xl ${isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150 shadow-sm'}`}>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">Completion Rate</span>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{completionRate}%</span>
                          <span className="text-[10px] text-slate-400 font-bold">Average Progress</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent resumes block */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">// Recent Resumes</span>
                        {resumes.length > 3 && (
                          <button onClick={() => setActiveTab('resumes')} className="text-xs font-bold text-indigo-650 hover:underline">
                            View All Resumes
                          </button>
                        )}
                      </div>

                      {resumes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {resumes.slice(0, 3).map((resume) => (
                            <div 
                              key={resume.id}
                              className={`border rounded-2xl p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between relative overflow-hidden group ${
                                isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150'
                              }`}
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                    isDarkMode ? 'bg-slate-950 text-indigo-400' : 'bg-slate-50 text-indigo-650'
                                  }`}>
                                    {resume.category}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteResume(resume.id);
                                    }}
                                    className="text-slate-400 hover:text-rose-500 transition duration-150 p-1 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Delete Draft"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <h3 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                  {resume.title}
                                </h3>
                                <p className="text-xs text-slate-400">Target: {resume.role}</p>

                                <div className="space-y-1.5 mt-2 text-[10px] text-slate-500 font-medium">
                                  <div>Template: <span className="font-bold text-slate-700 dark:text-slate-350">{TEMPLATE_METADATA.find(t => t.id === resume.template_id)?.name || 'None Selected'}</span></div>
                                  <div className="flex items-center gap-2">
                                    <span>Completion:</span>
                                    <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                      <div className="h-full bg-indigo-500" style={{ width: `${calculateResumeCompletion(resume.resume_data)}%` }} />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{calculateResumeCompletion(resume.resume_data)}%</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border-t border-slate-100 dark:border-slate-900 mt-4 pt-4 flex items-center justify-between">
                                <span className="text-[9.5px] text-slate-450 flex items-center gap-1">
                                  <Clock size={11} />
                                  <span>Updated {getRelativeLastUpdated([resume])}</span>
                                </span>
                                <button
                                  onClick={() => router.push(`/builder?resumeId=${resume.id}`)}
                                  className={`h-8 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                                    isDarkMode ? 'bg-slate-900 text-teal-400 hover:bg-slate-850' : 'bg-indigo-50 text-indigo-650 hover:bg-indigo-100/50 shadow-sm'
                                  }`}
                                >
                                  <span>Edit Resume</span>
                                  <ArrowRight size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`border border-dashed rounded-3xl p-10 text-center ${
                          isDarkMode ? 'border-slate-900 bg-slate-950/20' : 'border-slate-200 bg-white'
                        }`}>
                          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
                            <FileText size={20} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-850">No resume drafts initialized yet</h4>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-5">
                            Create your first resume optimized specifically for recruiter scanning databases.
                          </p>
                          <button
                            onClick={() => handleCreateResumeStart()}
                            className="h-10 px-4 rounded-xl text-xs font-bold bg-indigo-650 hover:bg-indigo-600 text-white shadow-md shadow-indigo-600/10 cursor-pointer"
                          >
                            Create a Resume
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. MY RESUMES TAB */}
                {activeTab === 'resumes' && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">// Your Resumes Collection</span>
                      <button
                        onClick={() => handleCreateResumeStart()}
                        className="h-9 px-4 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus size={13} className="stroke-[3]" />
                        <span>Create New Draft</span>
                      </button>
                    </div>

                    {loadingResumes ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                          <div key={`skeleton-${i}`} className="border border-slate-150 bg-white rounded-2xl p-5 h-44 animate-pulse" />
                        ))}
                      </div>
                    ) : resumes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                          <div 
                            key={resume.id}
                            className={`border rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group relative overflow-hidden ${
                              isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150'
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className={`text-[8.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                  isDarkMode ? 'bg-slate-950 text-indigo-400' : 'bg-slate-50 text-indigo-650'
                                }`}>
                                  {resume.category}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteResume(resume.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-500 transition duration-150 p-1 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <h3 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {resume.title}
                              </h3>
                              <p className="text-xs text-slate-450">Target Role: {resume.role}</p>

                              <div className="space-y-1.5 mt-2 text-[10px] text-slate-500 font-medium">
                                <div>Template: <span className="font-bold text-slate-700 dark:text-slate-355">{TEMPLATE_METADATA.find(t => t.id === resume.template_id)?.name || 'None Selected'}</span></div>
                                <div className="flex items-center gap-2">
                                  <span>Completion:</span>
                                  <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${calculateResumeCompletion(resume.resume_data)}%` }} />
                                  </div>
                                  <span className="font-bold text-slate-700 dark:text-slate-355">{calculateResumeCompletion(resume.resume_data)}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-900 mt-4 pt-4 flex items-center justify-between">
                              <span className="text-[9.5px] text-slate-455 flex items-center gap-1">
                                <Clock size={11} />
                                <span>Updated {getRelativeLastUpdated([resume])}</span>
                              </span>
                              <button
                                onClick={() => router.push(`/builder?resumeId=${resume.id}`)}
                                className={`h-8 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                                  isDarkMode ? 'bg-slate-900 text-teal-400 hover:bg-slate-850' : 'bg-indigo-50 text-indigo-650 hover:bg-indigo-100/50 shadow-sm'
                                }`}
                              >
                                <span>Edit Resume</span>
                                <ArrowRight size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 border border-dashed rounded-3xl bg-white border-slate-200">
                        <FileText size={24} className="mx-auto text-slate-400 mb-3" />
                        <h4 className="font-bold text-slate-850">Your library is currently empty</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-5">
                          Start by setting up your onboarding role and choose one of our 12 premium layouts.
                        </p>
                        <button
                          onClick={() => handleCreateResumeStart()}
                          className="h-10 px-4 rounded-xl text-xs font-bold bg-indigo-655 hover:bg-indigo-600 text-white cursor-pointer"
                        >
                          Create New Resume
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. INLINE TEMPLATES GALLERY TAB */}
                {activeTab === 'templates' && (
                  <div className="space-y-8 animate-fade-in-up">
                    {/* Gallery Filters */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-5">
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                        {FILTER_CATEGORIES.map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition duration-150 whitespace-nowrap cursor-pointer ${
                              activeFilter === filter
                                ? 'bg-indigo-50 border border-indigo-100 text-indigo-650'
                                : 'bg-white border border-slate-200 text-slate-550 hover:border-slate-350'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Canva Style Templates Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredTemplates.map((tmpl) => (
                        <div 
                          key={tmpl.id}
                          onClick={() => handleCardClick(tmpl)}
                          className={`border rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group flex flex-col justify-between ${
                            isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150'
                          }`}
                        >
                          {/* Scaled Mini Document */}
                          <div className="flex justify-center bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3 border border-slate-250/30 h-[210px] overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/5 to-transparent z-10 pointer-events-none" />
                            <div className="scale-[0.18] origin-top transition duration-300 group-hover:scale-[0.185] pointer-events-none">
                              <TemplateRenderer templateId={tmpl.id} zoom={100} />
                            </div>
                          </div>

                          <div className="mt-3.5 space-y-1">
                            <h3 className="text-xs font-bold truncate text-slate-800 dark:text-white leading-tight">{tmpl.name}</h3>
                            <div className="flex items-center justify-between text-[9px] text-slate-400">
                              <span>ATS {tmpl.ats_score}%</span>
                              <span className="font-semibold text-slate-500">{tmpl.page_length}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                {/* 4. ATS ANALYZER VIEW */}
                {activeTab === 'ats' && (
                  <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
                    <div className={`border rounded-3xl p-12 text-center space-y-4 ${
                      isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150 shadow-sm'
                    }`}>
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 mx-auto">
                        <Shield size={22} />
                      </div>
                      <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>ATS Analyzer</h2>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        ATS Analyzer is under development and will be available in a future release.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. AI ASSISTANT VIEW */}
                {activeTab === 'ai' && (
                  <div className="max-w-3xl mx-auto border rounded-3xl overflow-hidden flex flex-col h-[520px] bg-white border-slate-150 shadow-sm">
                    {/* Chat header */}
                    <div className="p-4 border-b border-slate-150 flex items-center gap-3 bg-slate-50">
                      <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-655 shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-none">SmartCV AI Editor</h3>
                        <span className="text-[8.5px] text-slate-400 block mt-0.5">ATS-Optimization feedback loop</span>
                      </div>
                    </div>

                    {/* Chat messages viewport */}
                    <div className="flex-grow overflow-y-auto p-5 space-y-4">
                      {aiChat.map((msg, idx) => (
                        <div key={`msg-${idx}-${msg.sender}`} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-4 text-xs font-medium leading-relaxed text-justify ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/5'
                              : 'bg-slate-50 border border-slate-200/50 text-slate-750'
                          }`}>
                            {msg.text.split('\n').map((para, pIdx) => (
                              <p key={`para-${pIdx}`} className={pIdx > 0 ? 'mt-2 font-mono text-[11px] bg-slate-950 text-slate-200 p-3 rounded-xl select-all border border-slate-800' : ''}>
                                {para}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                      {aiLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-2 text-slate-500 text-xs">
                            <Loader2 size={13} className="animate-spin text-indigo-650" />
                            <span>Optimizing bullet metrics...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prompt shortcuts & input */}
                    <div className="p-4 border-t border-slate-150 space-y-3 bg-slate-50">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <button
                          onClick={() => handleAiOptimize('Refine professional summary bio details')}
                          className="px-3 py-1 bg-white border border-slate-200 hover:border-slate-350 rounded-lg text-[9.5px] font-bold text-slate-600 whitespace-nowrap cursor-pointer"
                        >
                          Optimize Summary Bio
                        </button>
                        <button
                          onClick={() => handleAiOptimize('Suggest resume skills listing for Lead Full Stack Developer')}
                          className="px-3 py-1 bg-white border border-slate-200 hover:border-slate-350 rounded-lg text-[9.5px] font-bold text-slate-600 whitespace-nowrap cursor-pointer"
                        >
                          Suggest Skills List
                        </button>
                        <button
                          onClick={() => handleAiOptimize('Refine Next.js projects experience achievement bullet point')}
                          className="px-3 py-1 bg-white border border-slate-200 hover:border-slate-350 rounded-lg text-[9.5px] font-bold text-slate-600 whitespace-nowrap cursor-pointer"
                        >
                          Refine Project Bullet
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ask AI to refine summaries, suggest formatting styles, or structure bullet points..."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiOptimize()}
                          className="flex-grow h-11 px-4 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-600 focus:outline-none"
                        />
                        <button
                          onClick={() => handleAiOptimize()}
                          className="h-11 px-4 bg-indigo-655 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-md"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. SETTINGS / PROFILE TAB */}
                {activeTab === 'settings' && (
                  <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
                    <form onSubmit={handleSaveSettings} className={`border rounded-3xl p-6 sm:p-8 space-y-6 bg-white border-slate-150 shadow-sm`}>
                      
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Workspace User Profile</h2>
                          <p className="text-[10px] text-slate-400 mt-0.5">Manage details used in initialization algorithms.</p>
                        </div>
                        
                        {/* Status Message */}
                        {saveSettingsStatus === 'success' && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
                            <Check size={11} className="stroke-[3]" />
                            <span>Saved changes</span>
                          </div>
                        )}
                        {saveSettingsStatus === 'error' && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1 rounded-lg">
                            <AlertCircle size={11} />
                            <span>Error saving</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[9.5px] font-bold uppercase text-slate-500 block">Full Candidate Name</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="e.g. Vamsi Krishna Tadisetti"
                            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-600 focus:outline-none transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9.5px] font-bold uppercase text-slate-500 block">Onboarding Department</label>
                          <select
                            value={profileDept}
                            onChange={(e) => setProfileDept(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-600 focus:outline-none transition"
                          >
                            {Object.keys(CATEGORY_ROLES).map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9.5px] font-bold uppercase text-slate-500 block">Experience Level</label>
                          <select
                            value={profileExp}
                            onChange={(e) => setProfileExp(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-600 focus:outline-none transition"
                          >
                            <option value="Fresher">Fresher (0-1 yrs)</option>
                            <option value="Junior">Junior Developer (1-3 yrs)</option>
                            <option value="Mid-Level">Mid-Level Engineer (3-5 yrs)</option>
                            <option value="Senior">Senior Architect (5-8 yrs)</option>
                            <option value="Lead/Executive">Lead / Executive Manager (8+ yrs)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 col-span-2">
                          <label className="text-[9.5px] font-bold uppercase text-slate-500 block">Career Goal Statement</label>
                          <textarea
                            value={profileGoal}
                            onChange={(e) => setProfileGoal(e.target.value)}
                            placeholder="State your professional career trajectory goals..."
                            className="w-full h-24 p-3.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-600 focus:outline-none transition resize-none leading-relaxed"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={savingSettings}
                        className="w-full h-12 bg-indigo-655 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md transition duration-250 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {savingSettings ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Check size={14} className="stroke-[3]" />
                            <span>Save Profile Configuration</span>
                          </>
                        )}
                      </button>

</form>
                  </div>
                )}

              </motion.div>
            )}

              {/* Step 1.5: CREATION METHOD SELECTION */}
              {step === 'creation-method-selection' && (
                <motion.div
                  key="creation-method-selection"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-xl mx-auto w-full py-6 space-y-6"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-4">
                    <button
                      onClick={() => setStep('dashboard')}
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <div>
                      <h2 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Create New Resume</h2>
                      <p className="text-[10.5px] font-semibold text-slate-400 mt-0.5">Choose how you want to start building your professional profile</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Option 1: Create From Scratch */}
                    <div
                      onClick={() => setStep('type-selection')}
                      className={`border rounded-2xl p-6 cursor-pointer transition-all duration-200 flex items-start gap-4 shadow-sm select-none group ${
                        isDarkMode ? 'bg-slate-900/10 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-150 hover:border-slate-250'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                        isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:text-indigo-650 group-hover:border-indigo-150 group-hover:bg-indigo-50/20'
                      }`}>
                        <Plus size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-650 transition-colors`}>Create From Scratch</h3>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed pr-2">Start with a blank canvas and use our structured wizard to input your details section by section.</p>
                      </div>
                    </div>

                    {/* Option 2: Import Existing Resume */}
                    <div
                      onClick={() => setStep('import-resume')}
                      className={`border rounded-2xl p-6 cursor-pointer transition-all duration-200 flex items-start gap-4 shadow-sm select-none group ${
                        isDarkMode ? 'bg-slate-900/10 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-150 hover:border-slate-250'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                        isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:text-indigo-650 group-hover:border-indigo-150 group-hover:bg-indigo-50/20'
                      }`}>
                        <Layout size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-indigo-650 transition-colors`}>Import Existing Resume</h3>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed pr-2">Upload your existing PDF or DOCX resume, and our rule-based parser will automatically extract your details.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
             )}

            {/* Step 2: RESUME TYPE SELECTION CREATION FLOW WIZARD */}
            {step === 'type-selection' && (
              <motion.div
                key="type-selection"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto w-full py-2 space-y-6"
              >
                {/* Header Back */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep('creation-method-selection')}
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <div>
                      <h2 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Select Resume Type</h2>
                      <p className={`text-[10.5px] font-semibold text-slate-400 mt-0.5`}>Choose a layout style tailored to your experience level</p>
                    </div>
                  </div>
                </div>

                {/* Resume Type selection card grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'Fresher',
                      name: 'Fresher Resume',
                      desc: 'Highlights education, personal projects, and core technical skills. Ideal for recent graduates.',
                      icon: GraduationCap,
                      trend: 'Standard Entry Layout'
                    },
                    {
                      id: 'Experienced',
                      name: 'Experienced Resume',
                      desc: 'Highlights work history, metric achievements, and leadership. Best for industry professionals.',
                      icon: Briefcase,
                      trend: 'Recruiter Preferred'
                    },
                    {
                      id: 'Internship',
                      name: 'Internship Resume',
                      desc: 'Tailored for coursework, academic projects, and internship applications.',
                      icon: Compass,
                      trend: 'Academic Alignment'
                    },
                    {
                      id: 'Academic',
                      name: 'Academic Resume',
                      desc: 'Showcases publications, teaching credentials, academic research, and credentials.',
                      icon: BookOpen,
                      trend: 'Curriculum Vitae'
                    }
                  ].map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = selectedType === type.id;
                    
                    return (
                      <div
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`border rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm relative overflow-hidden select-none group ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-500/5 shadow-md shadow-indigo-600/5'
                            : isDarkMode ? 'bg-slate-900/10 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-150 hover:border-slate-250'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Type Icon */}
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${
                            isSelected 
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:text-indigo-650 group-hover:border-indigo-100 group-hover:bg-indigo-50/20'
                          }`}>
                            <TypeIcon size={18} />
                          </div>

                          <div className="space-y-1">
                            <h3 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{type.name}</h3>
                            <p className="text-[10.5px] text-slate-400 leading-relaxed pr-2">{type.desc}</p>
                          </div>
                        </div>

                        {/* Card bottom trend metrics */}
                        <div className="border-t border-slate-100 dark:border-slate-900 mt-4 pt-3 flex items-center justify-between text-[9px] font-bold text-slate-400">
                          <span className="text-emerald-500">{type.trend}</span>
                          <span className={`text-[8.5px] font-bold uppercase transition ${isSelected ? 'text-indigo-650' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {isSelected ? 'Selected' : 'Choose Type'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* wizard controls */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-between gap-3">
                  <button
                    onClick={() => setStep('creation-method-selection')}
                    className="w-1/3 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleCreateResumeSubmit(selectedType)}
                    disabled={isCreatingResume || !selectedType}
                    className="w-2/3 h-12 bg-indigo-655 hover:bg-indigo-600 disabled:opacity-55 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    {isCreatingResume ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <span>Initialize Resume Builder</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: IMPORT RESUME PANEL */}
            {step === 'import-resume' && (
              <motion.div
                key="import-resume"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl mx-auto w-full py-6 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep('creation-method-selection')}
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <div>
                      <h2 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Import Existing Resume</h2>
                      <p className="text-[10.5px] font-semibold text-slate-400 mt-0.5">Upload a PDF or DOCX format resume (&lt; 10MB)</p>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {importError && (
                  <div className="border border-rose-500 bg-rose-500/5 p-4 rounded-xl text-xs font-bold text-rose-600 flex items-start gap-2 animate-fade-in-up">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Drag & Drop zone */}
                {!isImporting ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setImportFile(file);
                        handleImportResume(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-3xl p-12 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 relative ${
                      isDarkMode 
                        ? 'border-slate-800 bg-slate-900/10 hover:border-indigo-500/50' 
                        : 'border-slate-250 bg-white hover:border-indigo-650/40 hover:bg-indigo-50/5'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImportFile(file);
                          handleImportResume(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-655">
                      <FileText size={22} />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Drag & drop your resume file here</span>
                      <span className="text-[10.5px] text-slate-450 block mt-1">or click to browse from explorer (.pdf or .docx)</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 mt-2">Maximum file upload size limit: 10MB</span>
                  </div>
                ) : (
                  <div className={`border rounded-3xl p-16 text-center space-y-4 ${
                    isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150 shadow-sm'
                  }`}>
                    <Loader2 size={32} className="animate-spin text-indigo-650 mx-auto" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{importStatus}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Processing file layout nodes and parsing candidate details</p>
                    </div>
                  </div>
                )}

                {/* Footer Back */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-900">
                  <button
                    onClick={() => setStep('creation-method-selection')}
                    disabled={isImporting}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: IMPORT SUMMARY PANEL */}
            {step === 'import-summary' && importedData && (
              <motion.div
                key="import-summary"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-w-xl mx-auto w-full py-6 space-y-6"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-4">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h2 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>Resume Imported Successfully</h2>
                    <p className="text-[10.5px] font-semibold text-slate-400 mt-0.5">Please review the auto-extracted section statistics before editing</p>
                  </div>
                </div>

                {/* Checklist */}
                <div className={`border rounded-2xl p-5 space-y-4 ${
                  isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150 shadow-sm'
                }`}>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Extraction Summary Checklist</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {importedData.stats?.name ? (
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle size={14} className="text-amber-500 shrink-0" />
                      )}
                      <span className="text-xs font-medium">Candidate Name: {importedData.stats?.name ? 'Extracted' : 'Missing'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {importedData.stats?.email ? (
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle size={14} className="text-amber-500 shrink-0" />
                      )}
                      <span className="text-xs font-medium">Email Address: {importedData.stats?.email ? 'Extracted' : 'Missing'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={importedData.stats?.educationCount > 0 ? "text-emerald-500 shrink-0" : "text-slate-400 shrink-0"} />
                      <span className="text-xs font-medium">Education entries: {importedData.stats?.educationCount || 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={importedData.stats?.skillsCount > 0 ? "text-emerald-500 shrink-0" : "text-slate-400 shrink-0"} />
                      <span className="text-xs font-medium">Skill categories: {importedData.stats?.skillsCount || 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={importedData.stats?.projectsCount > 0 ? "text-emerald-500 shrink-0" : "text-slate-400 shrink-0"} />
                      <span className="text-xs font-medium">Projects: {importedData.stats?.projectsCount || 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={importedData.stats?.experienceCount > 0 ? "text-emerald-500 shrink-0" : "text-slate-400 shrink-0"} />
                      <span className="text-xs font-medium">Work experience: {importedData.stats?.experienceCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Detected Resume Type Dropdown Override */}
                <div className={`border rounded-2xl p-5 space-y-3 ${
                  isDarkMode ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-150 shadow-sm'
                }`}>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">Detected Resume Type</label>
                    <span className="text-[10.5px] text-slate-450 block mt-0.5">We categorized this resume based on content. Override it if needed.</span>
                  </div>

                  <select
                    value={selectedCategoryOverride}
                    onChange={(e) => setSelectedCategoryOverride(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-indigo-650 focus:outline-none transition"
                  >
                    <option value="Fresher">Fresher Resume</option>
                    <option value="Experienced">Experienced Resume</option>
                    <option value="Internship">Internship Resume</option>
                    <option value="Academic">Academic Resume</option>
                  </select>
                </div>

                {/* wizard controls */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-between gap-3">
                  <button
                    onClick={() => setStep('import-resume')}
                    className="w-1/3 h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleReviewAndContinue}
                    className="w-2/3 h-12 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>Review & Continue</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
              )}

          </AnimatePresence>

        </main>
      </div>

      {/* Slide-over Details Drawer */}
      <TemplateDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        template={selectedTemplate}
        onPreview={() => {
          setIsDrawerOpen(false);
          setIsPreviewModalOpen(true);
        }}
        onUse={() => selectedTemplate && handleSelectTemplate(selectedTemplate.id)}
        isLoading={isSelecting}
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
      />

    </div>
  );
}
