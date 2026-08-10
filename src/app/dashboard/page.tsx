'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Clock, Check, AlertCircle, FileText,
  Settings, Sparkles, ArrowRight, ArrowLeft,
  Copy, Loader2, Grid, Home, Search, Bell, X,
  LogOut, ChevronRight, Lightbulb, TrendingUp, Info,
  Shield, Upload, Eye, BadgeCheck, LayoutTemplate,
  PenTool, Paperclip, ClipboardCheck, Bookmark, Star,
  Zap, User, Heart, GraduationCap, Briefcase, Compass,
  BookOpen, CheckCircle2
} from 'lucide-react';

// ── Decorative SVG Micro-Illustrations ─────────────────────────
const ResumeSheetSVG = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="52" height="72" rx="6" fill="white" stroke="#DDDEE8" strokeWidth="1.5" />
    <rect x="12" y="14" width="28" height="3" rx="1.5" fill="#D1D5DB" />
    <rect x="12" y="22" width="36" height="2" rx="1" fill="#E5E7EB" />
    <rect x="12" y="28" width="32" height="2" rx="1" fill="#E5E7EB" />
    <rect x="12" y="34" width="36" height="2" rx="1" fill="#E5E7EB" />
    <rect x="12" y="42" width="20" height="3" rx="1.5" fill="#D1D5DB" />
    <rect x="12" y="50" width="36" height="2" rx="1" fill="#E5E7EB" />
    <rect x="12" y="56" width="28" height="2" rx="1" fill="#E5E7EB" />
    <rect x="12" y="62" width="34" height="2" rx="1" fill="#E5E7EB" />
  </svg>
);

const EmptyStateIllustration = () => (
  <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Desk/surface */}
    <ellipse cx="60" cy="90" rx="50" ry="6" fill="#F0F1F8" />
    {/* Main document */}
    <rect x="30" y="10" width="48" height="65" rx="6" fill="white" stroke="#DDDEE8" strokeWidth="1.5" />
    <rect x="38" y="20" width="24" height="3" rx="1.5" fill="#BFDBFE" />
    <rect x="38" y="27" width="32" height="2" rx="1" fill="#E5E7EB" />
    <rect x="38" y="32" width="28" height="2" rx="1" fill="#E5E7EB" />
    <rect x="38" y="37" width="32" height="2" rx="1" fill="#E5E7EB" />
    <rect x="38" y="44" width="18" height="3" rx="1.5" fill="#BFDBFE" />
    <rect x="38" y="51" width="32" height="2" rx="1" fill="#E5E7EB" />
    <rect x="38" y="56" width="24" height="2" rx="1" fill="#E5E7EB" />
    <rect x="38" y="61" width="30" height="2" rx="1" fill="#E5E7EB" />
    {/* Second document behind */}
    <rect x="36" y="14" width="48" height="65" rx="6" fill="white" stroke="#ECEDF3" strokeWidth="1" opacity="0.5" transform="rotate(5 60 46)" />
    {/* Pencil */}
    <rect x="88" y="30" width="4" height="30" rx="1" fill="#FBBF24" transform="rotate(15 90 45)" />
    <polygon points="88,60 92,60 90,66" fill="#F59E0B" transform="rotate(15 90 45)" />
    {/* Checkmark badge */}
    <circle cx="85" cy="22" r="10" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
    <path d="M80 22 L83.5 25.5 L90 19" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Star */}
    <path d="M22 25 L23.5 28 L27 28.5 L24.5 31 L25 34.5 L22 33 L19 34.5 L19.5 31 L17 28.5 L20.5 28 Z" fill="#FDE68A" stroke="#F59E0B" strokeWidth="0.5" />
  </svg>
);

import TemplateRenderer from '@/components/TemplateRenderer';
import TemplateDetailsDrawer from '@/components/TemplateDetailsDrawer';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { ResumeTemplate } from '@/types/database.types';
import { Button, Badge, ATSRing } from '@/components/ui/design-system';
import { getTemplatePreviewData } from '@/lib/templatePreviewData';

// ── Data (UNCHANGED) ────────────────────────────────────────────
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

const CATEGORY_ROLES: Record<string, string[]> = {
  'IT / Software': ['Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'AI/ML Engineer', 'Cyber Security Engineer'],
  'ECE': ['Embedded Engineer', 'VLSI Engineer', 'Electronics Engineer'],
  'EEE': ['Electrical Design Engineer', 'Power Systems Engineer', 'Control Systems Engineer', 'Renewable Energy Engineer'],
  'Mechanical': ['CAD Designer', 'Thermal Power Engineer', 'Automotive Systems Engineer', 'Robotics Engineer'],
  'Civil': ['Structural Designer', 'Geotechnical Engineer', 'Construction Project Manager', 'Urban Infrastructure Planner'],
  'MBA': ['Product Manager', 'Management Consultant', 'Financial Analyst', 'Business Development Manager'],
  'Commerce': ['Accountant', 'Tax Consultant', 'Audit Associate', 'Investment Analyst']
};

const CAREER_TIPS = [
  { title: 'ATS Optimization', text: 'Resumes with measurable metrics receive 3x more recruiter callbacks. Use numbers wherever possible.' },
  { title: 'Interview Prep', text: 'Tailor your resume for each application. Match keywords from the job description to your experience.' },
  { title: 'Writing Tip', text: 'Start bullet points with strong action verbs: Led, Built, Designed, Optimized, Increased, Reduced.' },
];

// ── Component ────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const router = useRouter();

  // ── Template showcase data (NEVER uses the user's actual resume) ──
  const templatePreviewData = useMemo(
    () => getTemplatePreviewData(profile?.full_name),
    [profile?.full_name]
  );

  const [_isNewUser, setIsNewUser] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };
  const [activeTab, setActiveTab] = useState<'home' | 'resumes' | 'templates' | 'ats' | 'ai' | 'settings'>('home');
  const [step, setStep] = useState<'dashboard' | 'creation-method-selection' | 'type-selection' | 'import-resume' | 'import-summary'>('dashboard');
  const [selectedType, setSelectedType] = useState<string>('');

  const [_importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('Extracting resume data...');
  const [importError, setImportError] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<any>(null);
  const [selectedCategoryOverride, setSelectedCategoryOverride] = useState('Experienced');

  // ── All handlers UNCHANGED ────────────────────────────────
  const handleImportResume = async (file: File) => {
    setImportError(null);
    if (file.size > 10 * 1024 * 1024) {
      setImportError("File exceeds maximum size limit of 10MB.");
      return;
    }
    setIsImporting(true);
    setImportStatus('Extracting resume data...');
    const warningTimer = setTimeout(() => {
      setImportStatus('Still processing your resume...');
    }, 10000);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/resumes/import', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to extract resume data. Please complete fields manually.');
      }
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
    router.push(`/builder?resumeId=${importedData.id}`);
  };

  const [resumes, setResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [_apiError, setApiError] = useState<string | null>(null);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [migrationSql, setMigrationSql] = useState<string | null>(null);
  const [isCreatingResume, setIsCreatingResume] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profileDept, setProfileDept] = useState('IT / Software');
  const [profileGoal, setProfileGoal] = useState('');
  const [profileExp, setProfileExp] = useState('Fresher');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSettingsStatus, setSaveSettingsStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const [_atsFile, setAtsFile] = useState<File | null>(null);
  const [_atsUploading, setAtsUploading] = useState(false);
  const [_atsScore, setAtsScore] = useState<number | null>(null);
  const [_atsFeedback, setAtsFeedback] = useState<any | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Optimization Assistant. Choose one of the quick suggestions below or type your summary description to optimize it for ATS metrics.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [_resumeFilter, _setResumeFilter] = useState<'all' | 'favorites' | 'recent'>('all');
  const [atsSelectedResumeId, setAtsSelectedResumeId] = useState<string | null>(null);
  const [atsJobDescription, setAtsJobDescription] = useState('');
  const [atsAnalyzing, setAtsAnalyzing] = useState(false);
  const [atsResults, setAtsResults] = useState<any>(null);
  const [targetResumeId, setTargetResumeId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsNewUser(params.get('new') === 'true');
      const tabParam = params.get('tab') as any;
      if (tabParam && ['home', 'resumes', 'templates', 'ats', 'ai', 'settings'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      const sourceParam = params.get('source');
      const resIdParam = params.get('resumeId');
      if (sourceParam === 'builder' && resIdParam) {
        setTargetResumeId(resIdParam);
      } else {
        setTargetResumeId(null);
      }
    }
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`smartcv_favorites_${user.id}`);
        if (stored) setFavorites(JSON.parse(stored));
      } catch { }
    }
  }, [user?.id]);

  const toggleFavorite = (resumeId: string) => {
    setFavorites(prev => {
      const next = prev.includes(resumeId) ? prev.filter(id => id !== resumeId) : [...prev, resumeId];
      if (user?.id) localStorage.setItem(`smartcv_favorites_${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(p => (p + 1) % CAREER_TIPS.length), 8000);
    return () => clearInterval(interval);
  }, []);

  const hasFetchedResumes = useRef(false);
  const syncedProfileRef = useRef<string | null>(null);

  const fetchResumes = async (force = false) => {
    if (hasFetchedResumes.current && !force && resumes.length > 0) return;
    setLoadingResumes(true);
    setApiError(null);
    try {
      console.time('[Dashboard] Resumes fetch');
      const response = await fetch('/api/resumes');
      const data = await response.json();
      console.timeEnd('[Dashboard] Resumes fetch');
      if (!response.ok) {
        if (data.migrationRequired) {
          setMigrationRequired(true);
          if (data.sql) setMigrationSql(data.sql);
        }
        throw new Error(data.error || 'Failed to fetch resumes');
      }
      setResumes(data);
      hasFetchedResumes.current = true;
      setMigrationRequired(false);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    if (user && step === 'dashboard') { fetchResumes(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, step]);

  useEffect(() => {
    if (profile) {
      const key = `${profile.id}_${profile.full_name}_${profile.department}_${profile.career_goal}_${profile.experience_level}`;
      if (syncedProfileRef.current !== key) {
        syncedProfileRef.current = key;
        setProfileName(profile.full_name || '');
        setProfileDept(profile.department || 'IT / Software');
        setProfileGoal(profile.career_goal || '');
        setProfileExp(profile.experience_level || 'Fresher');
      }
    }
  }, [profile]);

  if (!user || !profile) return null;

  const emailPrefix = user.email?.split('@')[0];
  let firstName = '';
  if (profile.full_name && profile.full_name.trim() && profile.full_name !== emailPrefix) {
    firstName = profile.full_name.trim().split(' ')[0];
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  } else {
    firstName = 'Member';
  }

  const handleCreateResumeStart = () => {
    if (migrationRequired) {
      showToast('Database setup required. Please run the migration script shown above.', 'error');
      return;
    }
    setSelectedType('');
    setStep('creation-method-selection');
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const { error } = await supabase.from('resumes').delete().eq('id', resumeId).eq('user_id', user!.id);
      if (error) throw error;
      setResumes(prev => prev.filter(r => r.id !== resumeId));
      setDeleteConfirmId(null);
      showToast('Resume deleted.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete resume.', 'error');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) { showToast('Full name is required.', 'error'); return; }
    setSavingSettings(true);
    setSaveSettingsStatus('idle');
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: profileName, department: profileDept, careerGoal: profileGoal, experienceLevel: profileExp })
      });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Failed to update settings'); }
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

  const handleCreateResumeSubmit = async (selectedResumeType: string) => {
    setIsCreatingResume(true);
    try {
      const userRole = profile?.career_goal || profile?.department || 'Job Candidate';
      const payload = { category: selectedResumeType, role: userRole, title: `${profile?.full_name || 'My'} - ${selectedResumeType}` };
      const response = await fetch('/api/resumes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) {
        if (data.migrationRequired) { setMigrationRequired(true); if (data.sql) setMigrationSql(data.sql); }
        throw new Error(data.error || 'Failed to create resume draft');
      }
      setMigrationRequired(false);
      router.push(`/builder?resumeId=${data.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create resume.', 'error');
    } finally {
      setIsCreatingResume(false);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    const validTargetResume = targetResumeId ? resumes.find(r => r.id === targetResumeId) : null;
    setIsSelecting(true);
    try {
      if (validTargetResume) {
        // Context B: Came from Builder via "Change Template"
        const response = await fetch('/api/resumes/select-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeId: validTargetResume.id, templateId })
        });
        const d = await response.json();
        if (!response.ok) throw new Error(d.error || 'Failed to select template');
        router.push(`/builder?resumeId=${validTargetResume.id}`);
      } else {
        // Context A: Browse Mode — Create a new resume with this template
        const userRole = profile?.career_goal || profile?.department || 'Software Engineer';
        const userCategory = profile?.department || 'Software & IT';
        const response = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: userCategory,
            role: userRole,
            title: `${profile?.full_name || 'My'} Resume`,
            templateId
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create resume');
        router.push(`/builder?resumeId=${data.id}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to apply template.', 'error');
    } finally {
      setIsSelecting(false);
      setIsDrawerOpen(false);
      setIsPreviewModalOpen(false);
    }
  };

  // Personalized template recommendations
  const getRecommendedTemplates = () => {
    if (!profile) return [];
    const dept = (profile.department || '').toLowerCase();
    const expLevel = (profile.experience_level || 'Fresher').toLowerCase();
    const scored = TEMPLATE_METADATA.map(t => {
      let score = t.recruiter_rating;
      if (dept.includes('it') || dept.includes('software')) {
        if (t.best_for.some(b => b.toLowerCase().includes('software') || b.toLowerCase().includes('ats'))) score += 2;
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
  };

  const recommendedTemplates = getRecommendedTemplates();

  const filteredTemplates = TEMPLATE_METADATA.filter(tmpl => {
    if (activeFilter === 'All') return true;
    const filterLower = activeFilter.toLowerCase();
    return tmpl.best_for.some(tag => tag.toLowerCase() === filterLower) || tmpl.recommended_role.toLowerCase().includes(filterLower);
  });

  const handleNextTemplate = () => {
    if (!selectedTemplate) return;
    const currentIndex = filteredTemplates.findIndex(t => t.id === selectedTemplate.id);
    setSelectedTemplate(filteredTemplates[(currentIndex + 1) % filteredTemplates.length]);
  };

  const handlePrevTemplate = () => {
    if (!selectedTemplate) return;
    const currentIndex = filteredTemplates.findIndex(t => t.id === selectedTemplate.id);
    setSelectedTemplate(filteredTemplates[(currentIndex - 1 + filteredTemplates.length) % filteredTemplates.length]);
  };

  const handleCardClick = (tmpl: ResumeTemplate) => { setSelectedTemplate(tmpl); setIsDrawerOpen(true); };

  const _handleAtsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAtsFile(file);
    setAtsUploading(true);
    setAtsScore(null);
    setTimeout(() => {
      setAtsUploading(false);
      setAtsScore(88);
      setAtsFeedback({
        keywords: [
          { name: 'React', found: true }, { name: 'Next.js', found: true }, { name: 'TypeScript', found: true },
          { name: 'CI/CD Pipelines', found: false, rec: 'Add CI/CD pipelines deployment experience under SmartTech Solutions projects.' },
          { name: 'AWS Cloud', found: true },
          { name: 'Redis Caching', found: false, rec: 'Include Redis or caching optimization keywords in skills matrix.' }
        ],
        formatting: { spacing: 'Pass', headings: 'Pass', fonts: 'Pass' },
        missingSections: []
      });
    }, 2500);
  };

  const handleAiOptimize = (shortcut?: string) => {
    const promptText = shortcut || aiPrompt;
    if (!promptText.trim()) return;
    setAiChat(prev => [...prev, { sender: 'user', text: promptText }]);
    setAiPrompt('');
    setAiLoading(true);
    setTimeout(() => {
      let aiResponse = '';
      if (promptText.toLowerCase().includes('summary') || promptText.toLowerCase().includes('bio')) {
        aiResponse = 'Optimized ATS Summary:\n\n"Goal-driven Lead Full Stack and Product Engineer with 6+ years of verified software development experience. Technical specialization in Next.js, React, Node.js microservices, and GCP/AWS clouds."';
      } else if (promptText.toLowerCase().includes('project') || promptText.toLowerCase().includes('bullet')) {
        aiResponse = 'Optimized Project Achievement:\n\n"Designed and deployed an AI-assisted resume canvas builder using Next.js 16 and Supabase SSE, improving edit render latency by 45% and boosting conversion rates by 22%."';
      } else {
        aiResponse = `Optimized listing for "${promptText}":\n\n"Languages: JavaScript, TypeScript, SQL, Go\nFrameworks: React, Next.js, Node.js, Express, Tailwind\nInfra: PostgreSQL, Redis, MongoDB, GCP, AWS, Docker."`;
      }
      setAiChat(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setAiLoading(false);
    }, 1800);
  };

  const calculateResumeCompletion = (resumeData: any) => {
    if (!resumeData) return 0;
    const pi = resumeData.personalInfo || {};
    const sections = [
      !!(pi.fullName?.trim() && pi.email?.trim() && pi.phone?.trim() && pi.location?.trim()),
      !!pi.summary?.trim(),
      !!(resumeData.education && resumeData.education.length > 0),
      !!(resumeData.skills && resumeData.skills.length > 0 && resumeData.skills.some((s: any) => s.items && s.items.length > 0)),
      !!(resumeData.projects && resumeData.projects.length > 0),
      !!(resumeData.experience && resumeData.experience.length > 0),
      !!(resumeData.certifications && resumeData.certifications.length > 0),
      !!(resumeData.achievements && resumeData.achievements.length > 0),
      !!(resumeData.additionalInfo?.languages?.trim() || resumeData.additionalInfo?.interests?.trim()),
    ];
    return Math.round((sections.filter(Boolean).length / sections.length) * 100);
  };

  const getRelativeLastUpdated = (resumesList: any[]) => {
    if (!resumesList || resumesList.length === 0) return '-';
    const dates = resumesList.map(r => new Date(r.updated_at).getTime()).filter(t => !isNaN(t));
    if (dates.length === 0) return '-';
    const latestTime = Math.max(...dates);
    const diffDays = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(latestTime).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const totalResumes = resumes.length;
  const templatesUsed = new Set(resumes.map(r => r.template_id).filter(Boolean)).size;
  const lastUpdatedText = getRelativeLastUpdated(resumes);
  const completionRate = resumes.length > 0
    ? Math.round(resumes.reduce((acc, r) => acc + calculateResumeCompletion(r.resume_data), 0) / resumes.length)
    : 0;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'resumes', label: 'My Resumes', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Grid },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // ── RENDER ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F8FC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ============================================================
          TOP NAVIGATION — Like Resumind reference (screenshot 3)
          Centered nav pills, logo left, user right
          ============================================================ */}
      <nav className="bg-white border-b border-[#ECEDF3] sticky top-0 z-50">
        <div className="max-w-[1320px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-xl bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm">
              <img src="/SmartCV_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
            </div>
            <span className="font-bold text-[15px] text-[#111827] tracking-tight">SmartCV</span>
          </div>

          {/* Center Nav Pills — Liquid Glass pill container */}
          <div className="hidden md:flex items-center liquid-glass-toolbar p-1 rounded-full gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setStep('dashboard'); }}
                  className={`liquid-glass-interactive flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'liquid-glass-active text-[#2563EB]'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  <span className="liquid-glass-specular" aria-hidden="true" />
                  <span className="liquid-glass-refraction" aria-hidden="true" />
                  <span className="relative z-10 flex items-center gap-2 liquid-glass-content">
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Search, Bell, Avatar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="liquid-glass-interactive liquid-glass-square h-9 w-9 text-[#64748B] hover:text-[#0F172A] transition cursor-pointer shadow-xs"
              title="Search resumes and templates"
            >
              <span className="liquid-glass-specular" aria-hidden="true" />
              <span className="liquid-glass-refraction" aria-hidden="true" />
              <Search size={15} className="relative z-10 liquid-glass-content" />
            </button>
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(o => !o); setProfileMenuOpen(false); }}
                className="liquid-glass-interactive liquid-glass-square h-9 w-9 text-[#64748B] hover:text-[#0F172A] transition cursor-pointer relative shadow-xs"
                title="Notifications"
              >
                <span className="liquid-glass-specular" aria-hidden="true" />
                <span className="liquid-glass-refraction" aria-hidden="true" />
                <Bell size={15} className="relative z-10 liquid-glass-content" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2563EB] shadow-xs border border-white z-20" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_12px_32px_rgba(0,0,0,0.12)] py-2 z-50 animate-fade-in-down">
                  <div className="px-4 py-2.5 border-b border-[#F0F1F8] flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#111827]">Notifications</h4>
                    <button onClick={() => setNotifOpen(false)} className="text-[#9CA3AF] hover:text-[#6B7280]"><X size={13} /></button>
                  </div>
                  <div className="px-4 py-3 space-y-3">
                    {[{ icon: Check, color: 'text-emerald-500 bg-emerald-50', text: 'Resume autosaved successfully', time: 'Just now' },
                    { icon: Zap, color: 'text-[#2563EB] bg-blue-50', text: 'ATS Analyzer coming soon — stay tuned!', time: '1 day ago' },
                    { icon: Star, color: 'text-amber-500 bg-amber-50', text: '12 new templates available in the gallery', time: '3 days ago' },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                          <n.icon size={12} />
                        </div>
                        <div>
                          <p className="text-xs text-[#374151] leading-relaxed">{n.text}</p>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* User Avatar + Click-based Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => { setProfileMenuOpen(o => !o); setNotifOpen(false); }}
                className="liquid-glass-interactive liquid-glass-circle h-9 w-9 text-white text-xs font-bold cursor-pointer shadow-sm overflow-hidden"
              >
                <span className="liquid-glass-specular" aria-hidden="true" />
                <span className="liquid-glass-refraction" aria-hidden="true" />
                <span className="relative z-10 flex items-center justify-center w-full h-full liquid-glass-content bg-[#2563EB]/90">
                  {profile?.profile_image ? (
                    <img src={profile.profile_image} alt={profile?.full_name || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    firstName ? firstName[0].toUpperCase() : 'U'
                  )}
                </span>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_12px_32px_rgba(0,0,0,0.12)] py-2 z-50 animate-fade-in-down">
                  <div className="px-4 py-2.5 border-b border-[#F0F1F8]">
                    <p className="text-sm font-semibold text-[#111827] truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-[11px] text-[#9CA3AF] truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { router.push('/profile'); setProfileMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F7F8FC] cursor-pointer transition-colors">
                    <User size={14} /> Profile
                  </button>
                  <button onClick={() => { setActiveTab('settings'); setStep('dashboard'); setProfileMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#4B5563] hover:bg-[#F7F8FC] cursor-pointer transition-colors">
                    <Settings size={14} /> Settings
                  </button>
                  <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer transition-colors">
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================================
          MAIN CONTENT
          ============================================================ */}
      <main className="max-w-[1320px] mx-auto px-6 py-8">

        {/* Migration warning */}
        {migrationRequired && (
          <div className="mb-6 border border-red-200 rounded-2xl p-5 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Database Setup Required</h3>
                <p className="text-xs text-red-700 mt-1">
                  Execute the SQL migration in your Supabase SQL Editor to align the <code className="font-mono bg-red-100 px-1 rounded text-xs">resumes</code> table schema.
                </p>
                {migrationSql && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-semibold text-red-600 uppercase">Migration Script</span>
                      <button onClick={() => { navigator.clipboard.writeText(migrationSql); alert('Copied!'); }}
                        className="text-[11px] font-medium text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer">
                        <Copy size={11} /> Copy
                      </button>
                    </div>
                    <pre className="p-3 rounded-xl bg-white border border-red-100 font-mono text-[11px] text-red-800 max-h-40 overflow-auto whitespace-pre">{migrationSql}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── DASHBOARD VIEWS ──────────────────────────── */}
          {step === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>

              {/* · HOME TAB
          ============================================================ */}
              {activeTab === 'home' && (
                <div className="space-y-8">

                  {/* ── HERO SECTION ─ Large, asymmetric, with subtle decorative graphics ── */}
                  <div className="bg-white rounded-3xl border border-[#ECEDF3] shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-8 md:p-10 relative overflow-hidden">
                    {/* Subtle decorative elements — floating resume sheets, pen, paperclip */}
                    <div className="absolute top-6 right-[340px] opacity-[0.04] pointer-events-none hidden lg:block">
                      <ResumeSheetSVG className="w-14 h-auto rotate-[-8deg]" />
                    </div>
                    <div className="absolute bottom-4 left-16 opacity-[0.04] pointer-events-none hidden lg:block">
                      <Paperclip size={32} className="text-[#6B7280] rotate-[25deg]" />
                    </div>
                    <div className="absolute top-8 left-[45%] opacity-[0.04] pointer-events-none hidden lg:block">
                      <PenTool size={24} className="text-[#6B7280] rotate-[-15deg]" />
                    </div>
                    <div className="absolute bottom-8 right-[360px] opacity-[0.04] pointer-events-none hidden lg:block">
                      <Bookmark size={20} className="text-[#6B7280]" />
                    </div>
                    {/* Subtle dot pattern in hero background */}
                    <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #6B7280 0.7px, transparent 0.7px)', backgroundSize: '20px 20px' }} />

                    <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
                      {/* Left: Welcome */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider mb-3">Personal Workspace</p>
                        <h1 className="text-3xl md:text-[36px] font-bold text-[#111827] tracking-tight leading-tight">
                          Welcome back, {firstName}
                        </h1>
                        <p className="text-[15px] text-[#6B7280] mt-3 leading-relaxed max-w-lg">
                          Build and optimize ATS-friendly resumes. Continue where you left off or start something new.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                          <Button onClick={handleCreateResumeStart} size="lg">
                            <Plus size={16} /> Create Resume
                          </Button>
                          <Button onClick={() => setStep('import-resume')} variant="secondary" size="lg">
                            <Upload size={15} /> Import Resume
                          </Button>
                        </div>
                      </div>

                      {/* Right: ATS Score Widget — large, visual */}
                      <div className="lg:w-[320px] shrink-0">
                        <div className="bg-[#F7F8FC] rounded-2xl p-6 flex flex-col items-center text-center relative">
                          {/* Subtle grid in ATS widget */}
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl overflow-hidden" style={{ backgroundImage: 'linear-gradient(#D1D5DB 1px, transparent 1px), linear-gradient(90deg, #D1D5DB 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                          <ATSRing score={completionRate} size={110} />
                          <h3 className="text-base font-semibold text-[#111827] mt-4">Resume Health</h3>
                          <p className="text-sm text-[#6B7280] mt-1">{totalResumes} resume{totalResumes !== 1 ? 's' : ''} in workspace</p>
                          <div className="flex items-center gap-4 mt-4 text-xs text-[#6B7280]">
                            <div className="text-center">
                              <p className="text-lg font-semibold text-[#111827]">{templatesUsed}</p>
                              <p>Templates</p>
                            </div>
                            <div className="h-8 w-px bg-[#ECEDF3]" />
                            <div className="text-center">
                              <p className="text-lg font-semibold text-[#111827]">{lastUpdatedText}</p>
                              <p>Last Edit</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── RECOMMENDED FOR YOU ──────────────────── */}
                  {profile && (profile.department || profile.experience_level) && (
                    <div>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                          <Zap size={13} className="text-amber-500" />
                        </div>
                        <h2 className="text-base font-semibold text-[#111827]">Recommended For You</h2>
                        <span className="text-xs text-[#9CA3AF]">Based on your profile</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {recommendedTemplates.map((tmpl) => (
                          <button
                            key={tmpl.id}
                            onClick={() => handleCardClick(tmpl)}
                            className="bg-white border border-[#ECEDF3] rounded-2xl overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition-all group cursor-pointer text-left"
                          >
                            <div className="bg-[#F7F8FC] h-[180px] overflow-hidden relative flex justify-center border-b border-[#ECEDF3]">
                              <div className="scale-[0.20] origin-top pointer-events-none" style={{ width: '900px', height: '1200px', position: 'relative', top: '12px' }}>
                                <TemplateRenderer templateId={tmpl.id} zoom={100} />
                              </div>
                              <div className="absolute top-2 left-2">
                                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Recommended</span>
                              </div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                                <span className="bg-white shadow-lg text-[#111827] px-3 py-1.5 rounded-xl text-xs font-medium">Preview</span>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-[13px] font-semibold text-[#111827]">{tmpl.name}</p>
                              <p className="text-[11px] text-[#9CA3AF] mt-0.5">ATS {tmpl.ats_score}% · {tmpl.layout_type}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── QUICK ACTIONS ─ Large feature tiles like Resumind ── */}
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827] mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'New Resume', desc: 'Start fresh and build a professional resume in minutes.', icon: PenTool, color: 'bg-blue-50 text-[#2563EB]', decoIcon: FileText, decoColor: 'text-blue-100', onClick: () => handleCreateResumeStart() },
                        { label: 'Browse Templates', desc: 'Explore 12+ ATS-optimized templates for every career stage.', icon: LayoutTemplate, color: 'bg-purple-50 text-[#7C3AED]', decoIcon: Grid, decoColor: 'text-purple-100', onClick: () => setActiveTab('templates') },
                        { label: 'Import Resume', desc: 'Upload your existing resume and we will extract details.', icon: Upload, color: 'bg-orange-50 text-[#EA580C]', decoIcon: ClipboardCheck, decoColor: 'text-orange-100', onClick: () => setStep('import-resume') },
                        { label: 'ATS Checker', desc: 'See how your resume performs against ATS algorithms.', icon: BadgeCheck, color: 'bg-emerald-50 text-[#10B981]', decoIcon: Shield, decoColor: 'text-emerald-100', onClick: () => setActiveTab('ats') },
                      ].map((action, i) => (
                        <motion.button
                          key={action.label}
                          onClick={action.onClick}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          className="flex flex-col items-start bg-white border border-[#ECEDF3] rounded-2xl p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition-all duration-250 group cursor-pointer text-left relative overflow-hidden"
                        >
                          {/* Decorative large icon in background */}
                          <action.decoIcon size={64} className={`absolute -bottom-3 -right-3 ${action.decoColor} opacity-60 pointer-events-none transition-transform group-hover:scale-110 group-hover:rotate-[-3deg]`} />
                          <div className={`h-12 w-12 rounded-2xl ${action.color} flex items-center justify-center mb-4 relative z-10`}>
                            <action.icon size={20} />
                          </div>
                          <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors relative z-10">{action.label}</h3>
                          <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed relative z-10">{action.desc}</p>
                          <ArrowRight size={14} className="mt-3 text-[#D1D5DB] group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all relative z-10" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* ── TWO-COLUMN: Recent Drafts + Sidebar ── */}
                  <div className="flex flex-col lg:flex-row gap-6">

                    {/* Left Column — Recent Drafts (65%) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[#111827]">Recent Drafts</h2>
                        {resumes.length > 3 && (
                          <button onClick={() => setActiveTab('resumes')} className="text-xs font-medium text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1">
                            View All <ArrowRight size={12} />
                          </button>
                        )}
                      </div>

                      {loadingResumes ? (
                        <div className="space-y-3">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-white border border-[#ECEDF3] rounded-2xl p-5 h-36 animate-pulse">
                              <div className="flex gap-4">
                                <div className="w-24 h-[120px] rounded-xl skeleton" />
                                <div className="flex-1 space-y-2 pt-1">
                                  <div className="h-4 w-1/3 skeleton rounded-lg" />
                                  <div className="h-3 w-1/2 skeleton rounded-lg" />
                                  <div className="h-2 w-full skeleton rounded-full" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : resumes.length > 0 ? (
                        <div className="space-y-3">
                          {resumes.slice(0, 4).map((resume, i) => {
                            const completion = calculateResumeCompletion(resume.resume_data);
                            const templateName = TEMPLATE_METADATA.find(t => t.id === resume.template_id)?.name;
                            const ats = TEMPLATE_METADATA.find(t => t.id === resume.template_id)?.ats_score;
                            return (
                              <motion.div
                                key={resume.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white border border-[#ECEDF3] rounded-2xl p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition-all duration-250 group"
                              >
                                <div className="flex items-start gap-4">
                                  {/* Mini Resume Preview — 96x128, real template render */}
                                  <div className="w-24 h-[128px] rounded-xl bg-[#F7F8FC] border border-[#ECEDF3] shrink-0 overflow-hidden relative group/thumb">
                                    {resume.template_id ? (
                                      <>
                                        <div className="scale-[0.10] origin-top-left pointer-events-none" style={{ width: '900px', height: '1200px', position: 'relative', left: '3px', top: '3px' }}>
                                          <TemplateRenderer templateId={resume.template_id} zoom={100} data={resume.resume_data} />
                                        </div>
                                        {/* Subtle hover overlay on thumbnail */}
                                        <div className="absolute inset-0 bg-[#2563EB]/0 group-hover/thumb:bg-[#2563EB]/5 transition-colors rounded-xl" />
                                      </>
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                        <ResumeSheetSVG className="w-10 h-auto opacity-40" />
                                        <span className="text-[8px] text-[#9CA3AF] font-medium">No template</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <h4 className="text-sm font-medium text-[#111827] truncate">{resume.title}</h4>
                                        <p className="text-xs text-[#9CA3AF] mt-0.5">Target: {resume.role}</p>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {ats && <Badge variant="success" className="text-[10px]">ATS {ats}%</Badge>}
                                        <Badge variant="secondary" className="text-[10px]">{resume.category}</Badge>
                                      </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-3 flex items-center gap-3">
                                      <div className="flex-1">
                                        <div className="w-full h-1.5 rounded-full bg-[#F0F1F8] overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completion}%` }}
                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                            className="h-full bg-[#2563EB] rounded-full"
                                          />
                                        </div>
                                      </div>
                                      <span className="text-[11px] font-medium text-[#4B5563] shrink-0">{completion}%</span>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-3 flex items-center justify-between">
                                      <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                                        <Clock size={11} /> {getRelativeLastUpdated([resume])}
                                        {templateName && <span className="ml-2 text-[#6B7280]">Template: {templateName}</span>}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(resume.id); }}
                                          className={`h-7 w-7 rounded-lg flex items-center justify-center transition cursor-pointer ${favorites.includes(resume.id) ? 'text-amber-400 bg-amber-50 hover:bg-amber-100' : 'text-[#D1D5DB] hover:text-amber-400 hover:bg-amber-50 opacity-0 group-hover:opacity-100'}`} title="Favorite">
                                          <Star size={13} className={favorites.includes(resume.id) ? 'fill-amber-400' : ''} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(resume.id); }}
                                          className="h-7 w-7 rounded-lg text-[#D1D5DB] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition cursor-pointer opacity-0 group-hover:opacity-100" title="Delete">
                                          <Trash2 size={13} />
                                        </button>
                                        <button onClick={() => router.push(`/builder?resumeId=${resume.id}`)}
                                          className="h-7 px-3 rounded-lg bg-[#EFF6FF] text-[#2563EB] text-[11px] font-medium flex items-center gap-1 hover:bg-[#DBEAFE] transition cursor-pointer">
                                          Continue <ArrowRight size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white border border-dashed border-[#DDDEE8] rounded-2xl py-14 px-6 text-center relative overflow-hidden">
                          {/* Subtle dot pattern background */}
                          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #6B7280 0.7px, transparent 0.7px)', backgroundSize: '16px 16px' }} />
                          {/* SVG illustration instead of generic icon */}
                          <div className="mx-auto mb-5">
                            <EmptyStateIllustration />
                          </div>
                          <h4 className="text-base font-semibold text-[#111827]">No resumes yet</h4>
                          <p className="text-sm text-[#6B7280] max-w-xs mx-auto mt-1.5 mb-5">
                            Create your first ATS-optimized resume and start landing interviews.
                          </p>
                          <div className="flex items-center justify-center gap-3">
                            <Button onClick={handleCreateResumeStart}>
                              <Plus size={14} /> Create Resume
                            </Button>
                            <Button onClick={() => setStep('import-resume')} variant="secondary">
                              Import Resume
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column — Insights (35%) */}
                    <div className="lg:w-[340px] shrink-0 space-y-4">
                      {/* Recruiter Approved Layouts */}
                      <div className="bg-white border border-[#ECEDF3] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-sm font-semibold text-[#111827]">Recruiter Approved</h3>
                            <p className="text-[11px] text-[#9CA3AF]">Highest rated by hiring managers</p>
                          </div>
                          <button onClick={() => setActiveTab('templates')} className="text-[11px] font-medium text-[#2563EB] hover:underline cursor-pointer flex items-center gap-0.5">
                            All <ArrowRight size={10} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {TEMPLATE_METADATA.filter(t => t.recruiter_rating === 5).slice(0, 4).map((tmpl) => (
                            <button key={tmpl.id} onClick={() => handleCardClick(tmpl)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F7F8FC] transition cursor-pointer text-left group">
                              <div className="w-12 h-[60px] rounded-lg bg-[#F7F8FC] border border-[#ECEDF3] shrink-0 overflow-hidden relative">
                                <div className="scale-[0.055] origin-top-left pointer-events-none" style={{ width: '900px', height: '1200px', position: 'relative', left: '2px', top: '2px' }}>
                                  <TemplateRenderer templateId={tmpl.id} zoom={100} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-[#111827] truncate">{tmpl.name}</p>
                                <p className="text-[10px] text-[#9CA3AF]">ATS {tmpl.ats_score}% · ★ {tmpl.recruiter_rating}/5</p>
                              </div>
                              <ChevronRight size={13} className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Career Tip — with subtle illustration */}
                      <div className="bg-white border border-[#ECEDF3] rounded-2xl p-5 relative overflow-hidden">
                        {/* Subtle decorative graphic */}
                        <div className="absolute -bottom-2 -right-2 opacity-[0.05] pointer-events-none">
                          <TrendingUp size={56} className="text-[#6B7280]" />
                        </div>
                        <div className="flex items-center gap-2.5 mb-3 relative z-10">
                          <div className="h-8 w-8 rounded-xl bg-[#FFFBEB] border border-amber-100 flex items-center justify-center">
                            <Lightbulb size={14} className="text-amber-500" />
                          </div>
                          <h3 className="text-sm font-semibold text-[#111827]">Career Tip</h3>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.div key={tipIndex} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="relative z-10">
                            <h4 className="text-xs font-semibold text-[#4B5563]">{CAREER_TIPS[tipIndex].title}</h4>
                            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{CAREER_TIPS[tipIndex].text}</p>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-white border border-[#ECEDF3] rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-[#111827] mb-3">Recent Activity</h3>
                        {resumes.length > 0 ? (
                          <div className="space-y-3">
                            {resumes.slice(0, 3).map((r) => (
                              <div key={r.id} className="flex items-start gap-2.5">
                                <div className="h-2 w-2 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                                <div>
                                  <p className="text-xs text-[#4B5563]">
                                    Edited <span className="font-medium text-[#111827]">{r.title}</span>
                                  </p>
                                  <p className="text-[10px] text-[#9CA3AF]">{getRelativeLastUpdated([r])}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#9CA3AF]">No recent activity. Create your first resume to get started.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* · MY RESUMES TAB
          ============================================================ */}
              {activeTab === 'resumes' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-[#111827]">My Resumes</h1>
                      <p className="text-sm text-[#6B7280] mt-0.5">{totalResumes} resume{totalResumes !== 1 ? 's' : ''} in your workspace</p>
                    </div>
                    <Button onClick={handleCreateResumeStart}>
                      <Plus size={15} /> New Resume
                    </Button>
                  </div>

                  {loadingResumes ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white border border-[#ECEDF3] rounded-2xl overflow-hidden">
                          <div className="h-60 skeleton" />
                          <div className="p-4 space-y-2">
                            <div className="h-4 w-2/3 skeleton rounded-lg" />
                            <div className="h-3 w-1/2 skeleton rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : resumes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {resumes.map((resume) => {
                        const completion = calculateResumeCompletion(resume.resume_data);
                        const tmpl = TEMPLATE_METADATA.find(t => t.id === resume.template_id);
                        return (
                          <div key={resume.id} className="bg-white border border-[#ECEDF3] rounded-2xl overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition-all duration-250 group">
                            {/* Large Preview Area */}
                            {/* LARGE Resume Preview — ~70% of card, real template render */}
                            <div className="bg-[#F7F8FC] border-b border-[#ECEDF3] h-60 relative flex justify-center overflow-hidden">
                              {resume.template_id ? (
                                <div className="scale-[0.20] origin-top pointer-events-none" style={{ width: '900px', height: '1200px', position: 'relative', top: '24px' }}>
                                  <TemplateRenderer templateId={resume.template_id} zoom={100} data={resume.resume_data} />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <ResumeSheetSVG className="w-16 h-auto opacity-30" />
                                  <span className="text-[10px] text-[#9CA3AF] font-medium">No template selected</span>
                                </div>
                              )}
                              {/* Hover Overlay with actions */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button onClick={() => router.push(`/builder?resumeId=${resume.id}`)}
                                  className="bg-white shadow-md text-[#111827] px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-[#F7F8FC] transition">
                                  <Eye size={13} /> Edit
                                </button>
                              </div>
                            </div>
                            {/* Info */}
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="text-sm font-medium text-[#111827] truncate">{resume.title}</h4>
                                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{resume.role}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteResume(resume.id); }}
                                  className="h-7 w-7 rounded-lg text-[#D1D5DB] hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition cursor-pointer opacity-0 group-hover:opacity-100 shrink-0" title="Delete">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                              <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1 h-1.5 rounded-full bg-[#F0F1F8] overflow-hidden">
                                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${completion}%` }} />
                                </div>
                                <span className="text-[11px] font-medium text-[#4B5563]">{completion}%</span>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="secondary" className="text-[10px]">{resume.category}</Badge>
                                  {tmpl && <Badge variant="success" className="text-[10px]">ATS {tmpl.ats_score}%</Badge>}
                                </div>
                                <span className="text-[10px] text-[#9CA3AF]">{getRelativeLastUpdated([resume])}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-dashed border-[#DDDEE8] rounded-2xl py-14 text-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #6B7280 0.7px, transparent 0.7px)', backgroundSize: '16px 16px' }} />
                      <div className="mx-auto mb-4">
                        <EmptyStateIllustration />
                      </div>
                      <h4 className="text-base font-semibold text-[#111827]">No resumes yet</h4>
                      <p className="text-sm text-[#6B7280] mt-1 max-w-xs mx-auto mb-5">Start by creating your first resume or importing an existing one.</p>
                      <Button onClick={handleCreateResumeStart}><Plus size={14} /> Create Resume</Button>
                    </div>
                  )}
                </div>
              )}

              {/* · TEMPLATES TAB
          ============================================================ */}
              {activeTab === 'templates' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (targetResumeId) {
                            // Flow B: Came from Builder — return to Builder
                            router.replace(`/builder?resumeId=${targetResumeId}`);
                          } else {
                            // Flow A: Browsing from Dashboard — return to Home tab directly (never mounts Builder)
                            setTargetResumeId(null);
                            setActiveTab('home');
                          }
                        }}
                        className="h-8 w-8 rounded-xl bg-[#F7F8FC] border border-[#ECEDF3] flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] hover:border-[#DDDEE8] transition cursor-pointer"
                        title={targetResumeId ? 'Back to Builder' : 'Back to Home'}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <div>
                        <h1 className="text-2xl font-bold text-[#111827]">Templates</h1>
                        <p className="text-sm text-[#6B7280] mt-0.5">
                          {targetResumeId
                            ? 'Select a new template for your resume. Your content will be preserved.'
                            : 'Explore ATS-optimized templates designed for every career stage.'}
                        </p>
                      </div>
                    </div>
                    {targetResumeId && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-[11px] font-bold text-purple-700">
                        Change Template
                      </span>
                    )}
                  </div>

                  {/* Filter pills */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {FILTER_CATEGORIES.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${activeFilter === filter
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-white border border-[#ECEDF3] text-[#6B7280] hover:border-[#DDDEE8] hover:text-[#374151]'
                          }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Template Grid — 3 columns, LARGE cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((tmpl, i) => (
                      <motion.div
                        key={tmpl.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleCardClick(tmpl)}
                        className="bg-white border border-[#ECEDF3] rounded-2xl overflow-hidden cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition-all duration-250 group"
                      >
                        {/* Template Preview — LARGE: ~420px */}
                        <div className="bg-[#F7F8FC] border-b border-[#ECEDF3] h-[420px] overflow-hidden relative flex justify-center">
                          <div className="scale-[0.32] origin-top transition-transform duration-250 group-hover:scale-[0.34] pointer-events-none" style={{ position: 'relative', top: '0px' }}>
                            <TemplateRenderer templateId={tmpl.id} zoom={100} data={templatePreviewData} />
                          </div>
                          {/* Hover controls — real buttons */}
                          <div className="absolute inset-0 flex items-end justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gradient-to-t from-black/20 to-transparent pb-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedTemplate(tmpl); setIsPreviewModalOpen(true); }}
                              className="bg-white shadow-lg text-[#111827] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F9FAFB] transition cursor-pointer"
                            >
                              <Eye size={13} /> Preview
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSelectTemplate(tmpl.id); }}
                              className="bg-[#2563EB] shadow-lg text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1D4ED8] transition cursor-pointer"
                            >
                              Use Template
                            </button>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="text-[13px] font-semibold text-[#111827]">{tmpl.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="success" className="text-[10px]">ATS {tmpl.ats_score}%</Badge>
                              <span className="text-[11px] text-[#9CA3AF]">{tmpl.layout_type} &middot; {tmpl.page_length}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-[#D1D5DB] group-hover:text-[#9CA3AF] transition" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* · ATS TAB
          ============================================================ */}
              {activeTab === 'ats' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-[#111827]">ATS Analyzer</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">Check how your resume matches a job description.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white border border-[#ECEDF3] rounded-2xl p-5">
                      <label className="text-xs font-medium text-[#6B7280] mb-2 block">Select Resume</label>
                      {resumes.length === 0 ? (
                        <p className="text-sm text-[#9CA3AF]">No resumes yet.</p>
                      ) : (
                        <select value={atsSelectedResumeId || ''} onChange={e => setAtsSelectedResumeId(e.target.value || null)}
                          className="w-full h-11 px-4 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50 transition">
                          <option value="">Choose a resume…</option>
                          {resumes.map(r => <option key={r.id} value={r.id}>{r.title} — {r.role}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="bg-white border border-[#ECEDF3] rounded-2xl p-5">
                      <label className="text-xs font-medium text-[#6B7280] mb-2 block">Job Description</label>
                      <textarea value={atsJobDescription} onChange={e => setAtsJobDescription(e.target.value)}
                        placeholder="Paste the full job description here…" rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50 transition resize-none" />
                    </div>
                  </div>

                  <button onClick={async () => {
                    if (!atsSelectedResumeId) return;
                    setAtsAnalyzing(true); setAtsResults(null);
                    try {
                      const res = await fetch('/api/resumes/ats-analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          resumeId: atsSelectedResumeId,
                          jobDescription: atsJobDescription
                        })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'ATS Analysis failed');
                      setAtsResults(data.analysis);
                    } catch (err: any) {
                      alert(err.message || 'ATS Analysis failed');
                    } finally {
                      setAtsAnalyzing(false);
                    }
                  }} disabled={atsAnalyzing || !atsSelectedResumeId}
                    className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    {atsAnalyzing ? <><Loader2 size={16} className="animate-spin" /> Performing Real-Time ATS Analysis…</> : <><Shield size={16} /> Run Real-Time ATS Analysis</>}
                  </button>

                  {atsResults && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#ECEDF3] rounded-2xl p-6 space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                          <svg width="80" height="80" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="36" fill="none" stroke="#ECEDF3" strokeWidth="4" />
                            <circle cx="40" cy="40" r="36" fill="none" stroke={atsResults.score >= 75 ? '#22C55E' : atsResults.score >= 50 ? '#F59E0B' : '#EF4444'}
                              strokeWidth="4" strokeDasharray={`${atsResults.score * 2.26} ${226 - atsResults.score * 2.26}`} strokeDashoffset="56.5" strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-lg font-bold ${atsResults.score >= 75 ? 'text-emerald-600' : atsResults.score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{atsResults.score}%</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#111827]">{atsResults.jobRoleMatch || (atsResults.score >= 75 ? 'Strong Match' : atsResults.score >= 50 ? 'Moderate Match' : 'Needs Improvement')}</h3>
                          <p className="text-xs text-[#6B7280] mt-0.5">Role Evaluated: <span className="font-semibold text-[#111827]">{atsResults.evaluatedRole || 'Target Role'}</span></p>
                          <p className="text-xs text-[#9CA3AF] mt-0.5">Keyword Match: {atsResults.keywordMatchScore}% · Formatting: {atsResults.formattingScore}% · Impact: {atsResults.impactScore}%</p>
                        </div>
                      </div>

                      {Array.isArray(atsResults.matchedKeywords) && atsResults.matchedKeywords.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-[#111827] mb-2 flex items-center gap-1.5"><Check size={12} className="text-emerald-500" /> Matched Keywords ({atsResults.matchedKeywords.length})</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResults.matchedKeywords.map((kw: string) => <span key={kw} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">{kw}</span>)}
                          </div>
                        </div>
                      )}

                      {Array.isArray(atsResults.missingKeywords) && atsResults.missingKeywords.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-[#111827] mb-2 flex items-center gap-1.5"><AlertCircle size={12} className="text-amber-500" /> Missing Required Keywords ({atsResults.missingKeywords.length})</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {atsResults.missingKeywords.map((kw: string) => <span key={kw} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">{kw}</span>)}
                          </div>
                        </div>
                      )}

                      {Array.isArray(atsResults.actionableSuggestions) && atsResults.actionableSuggestions.length > 0 && (
                        <div className="bg-[#F7F8FC] rounded-xl p-4 border border-[#ECEDF3]">
                          <h4 className="text-xs font-semibold text-[#111827] mb-2 flex items-center gap-1.5"><Lightbulb size={12} className="text-blue-500" /> Actionable Improvement Tips</h4>
                          <ul className="space-y-1.5 text-xs text-[#6B7280]">
                            {atsResults.actionableSuggestions.map((tip: string, idx: number) => (
                              <li key={idx}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* · AI TAB
          ============================================================ */}
              {activeTab === 'ai' && (
                <div className="max-w-2xl mx-auto bg-white border border-[#ECEDF3] rounded-2xl overflow-hidden flex flex-col h-[520px]">
                  <div className="p-4 border-b border-[#ECEDF3] flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                      <Sparkles size={14} className="text-[#2563EB]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#111827]">AI Assistant</h3>
                      <span className="text-[10px] text-[#9CA3AF]">ATS optimization suggestions</span>
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto p-4 space-y-3">
                    {aiChat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === 'user'
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-[#F7F8FC] text-[#374151]'
                          }`}>
                          {msg.text.split('\n').map((para, pIdx) => (
                            <p key={pIdx} className={pIdx > 0 ? 'mt-2 font-mono text-xs bg-[#111827] text-gray-200 p-3 rounded-xl' : ''}>
                              {para}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#F7F8FC] rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-[#6B7280]">
                          <Loader2 size={13} className="animate-spin text-[#2563EB]" /> Optimizing...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-[#ECEDF3] space-y-2.5">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                      {['Optimize Summary', 'Suggest Skills', 'Refine Bullet'].map((label) => (
                        <button key={label} onClick={() => handleAiOptimize(label)}
                          className="px-3 py-1.5 bg-white border border-[#ECEDF3] rounded-xl text-[11px] font-medium text-[#6B7280] hover:border-[#DDDEE8] whitespace-nowrap cursor-pointer">
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Ask AI to optimize your resume content..." value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiOptimize()}
                        className="flex-grow h-10 px-4 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50" />
                      <Button onClick={() => handleAiOptimize()}>Send</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* · SETTINGS TAB
          ============================================================ */}
              {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>
                    <p className="text-sm text-[#6B7280] mt-0.5">Manage your profile and workspace preferences.</p>
                  </div>

                  {/* Profile Card */}
                  <div className="bg-white border border-[#ECEDF3] rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[#F0F1F8]">
                      <div className="h-14 w-14 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                        {profile?.profile_image ? (
                          <img src={profile.profile_image} alt={profile?.full_name || 'User'} className="h-full w-full object-cover" />
                        ) : (
                          firstName ? firstName[0] : 'U'
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[#111827]">{profile?.full_name || 'User'}</h3>
                        <p className="text-sm text-[#9CA3AF]">{user?.email}</p>
                      </div>
                      {saveSettingsStatus === 'success' && (
                        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl">
                          <Check size={12} /> Saved
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs font-medium text-[#6B7280]">Full Name</label>
                          <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="e.g. Vamsi Krishna"
                            className="w-full h-11 px-4 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50 transition" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#6B7280]">Department</label>
                          <select value={profileDept} onChange={(e) => setProfileDept(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50 transition">
                            {Object.keys(CATEGORY_ROLES).map(dept => (<option key={dept} value={dept}>{dept}</option>))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-[#6B7280]">Experience Level</label>
                          <select value={profileExp} onChange={(e) => setProfileExp(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50 transition">
                            <option value="Fresher">Fresher (0-1 yrs)</option>
                            <option value="Junior">Junior (1-3 yrs)</option>
                            <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                            <option value="Senior">Senior (5-8 yrs)</option>
                            <option value="Lead/Executive">Lead / Executive (8+ yrs)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <label className="text-xs font-medium text-[#6B7280]">Career Goal</label>
                          <textarea value={profileGoal} onChange={(e) => setProfileGoal(e.target.value)} placeholder="Your professional goals..."
                            className="w-full h-24 p-4 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50 transition resize-none" />
                        </div>
                      </div>

                      <button type="submit" disabled={savingSettings}
                        className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                        {savingSettings ? <Loader2 size={15} className="animate-spin" /> : <><Check size={15} /> Save Changes</>}
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* ── CREATION METHOD SELECTION ─────────────────── */}
          {step === 'creation-method-selection' && (
            <motion.div key="creation-method" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="max-w-md mx-auto py-8 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#ECEDF3]">
                <button onClick={() => setStep('dashboard')} className="h-9 w-9 rounded-xl border border-[#ECEDF3] bg-white hover:bg-[#F7F8FC] flex items-center justify-center text-[#6B7280] cursor-pointer">
                  <ArrowLeft size={15} />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Create New Resume</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">Choose how you want to start</p>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => setStep('type-selection')} className="w-full flex items-start gap-4 bg-white border border-[#ECEDF3] rounded-2xl p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition cursor-pointer text-left group">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                    <Plus size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#111827]">Create From Scratch</h3>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">Start with a blank canvas and fill in your details section by section.</p>
                  </div>
                  <ArrowRight size={14} className="text-[#D1D5DB] group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all mt-1 shrink-0" />
                </button>
                <button onClick={() => setStep('import-resume')} className="w-full flex items-start gap-4 bg-white border border-[#ECEDF3] rounded-2xl p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition cursor-pointer text-left group">
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0">
                    <Upload size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#111827]">Import Existing Resume</h3>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">Upload a PDF or DOCX and we will extract your details automatically.</p>
                  </div>
                  <ArrowRight size={14} className="text-[#D1D5DB] group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all mt-1 shrink-0" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── TYPE SELECTION ────────────────────────────── */}
          {step === 'type-selection' && (
            <motion.div key="type-selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="max-w-xl mx-auto py-8 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#ECEDF3]">
                <button onClick={() => setStep('creation-method-selection')} className="h-9 w-9 rounded-xl border border-[#ECEDF3] bg-white hover:bg-[#F7F8FC] flex items-center justify-center text-[#6B7280] cursor-pointer">
                  <ArrowLeft size={15} />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Select Resume Type</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">Choose a layout style for your experience level</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'Fresher', name: 'Fresher Resume', desc: 'Highlights education, projects, and core skills. For recent graduates.', icon: GraduationCap, color: 'bg-blue-50 text-[#2563EB]' },
                  { id: 'Experienced', name: 'Experienced Resume', desc: 'Highlights work history, achievements, and leadership.', icon: Briefcase, color: 'bg-emerald-50 text-[#10B981]' },
                  { id: 'Internship', name: 'Internship Resume', desc: 'Tailored for coursework, academic projects, and applications.', icon: Compass, color: 'bg-purple-50 text-[#7C3AED]' },
                  { id: 'Academic', name: 'Academic Resume', desc: 'Showcases publications, research, and academic credentials.', icon: BookOpen, color: 'bg-orange-50 text-[#EA580C]' },
                ].map((type) => {
                  const TypeIcon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button key={type.id} onClick={() => setSelectedType(type.id)}
                      className={`flex items-start gap-4 p-5 rounded-2xl border transition-all text-left cursor-pointer ${isSelected ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_3px_rgba(37,99,235,0.1)]' : 'border-[#ECEDF3] bg-white hover:border-[#DDDEE8] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
                        }`}>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#2563EB] text-white' : type.color}`}>
                        <TypeIcon size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#111827]">{type.name}</h4>
                        <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-3">
                <button onClick={() => setStep('creation-method-selection')}
                  className="flex-1 h-11 rounded-xl border border-[#ECEDF3] bg-white text-sm font-medium text-[#374151] hover:bg-[#F7F8FC] transition cursor-pointer">
                  Back
                </button>
                <button onClick={() => handleCreateResumeSubmit(selectedType)} disabled={isCreatingResume || !selectedType}
                  className="flex-[2] h-11 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition cursor-pointer">
                  {isCreatingResume ? <Loader2 size={15} className="animate-spin" /> : <>Continue <ArrowRight size={15} /></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── IMPORT RESUME ─────────────────────────────── */}
          {step === 'import-resume' && (
            <motion.div key="import-resume" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="max-w-md mx-auto py-8 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#ECEDF3]">
                <button onClick={() => setStep('creation-method-selection')} className="h-9 w-9 rounded-xl border border-[#ECEDF3] bg-white hover:bg-[#F7F8FC] flex items-center justify-center text-[#6B7280] cursor-pointer">
                  <ArrowLeft size={15} />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Import Existing Resume</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">Upload a PDF or DOCX file (max 10MB)</p>
                </div>
              </div>

              {importError && (
                <div className="border border-red-200 bg-red-50 p-4 rounded-2xl text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {!isImporting ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) { setImportFile(file); handleImportResume(file); } }}
                  className="border-2 border-dashed border-[#DDDEE8] rounded-2xl p-14 text-center bg-white hover:border-[#2563EB] hover:bg-[#EFF6FF]/30 transition cursor-pointer relative"
                >
                  <input type="file" accept=".pdf,.docx"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) { setImportFile(file); handleImportResume(file); } }}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-14 h-14 rounded-2xl bg-[#F7F8FC] border border-[#ECEDF3] flex items-center justify-center mx-auto mb-4">
                    <Upload size={22} className="text-[#9CA3AF]" />
                  </div>
                  <p className="text-sm font-semibold text-[#111827]">Drop your resume here</p>
                  <p className="text-xs text-[#6B7280] mt-1">or click to browse (.pdf or .docx)</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-3">Maximum file size: 10MB</p>
                </div>
              ) : (
                <div className="bg-white border border-[#ECEDF3] rounded-2xl p-16 text-center space-y-4">
                  <Loader2 size={28} className="animate-spin text-[#2563EB] mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{importStatus}</p>
                    <p className="text-xs text-[#6B7280] mt-1">Parsing document structure and extracting details</p>
                  </div>
                </div>
              )}

              <button onClick={() => setStep('creation-method-selection')} disabled={isImporting}
                className="w-full h-11 rounded-xl border border-[#ECEDF3] bg-white text-sm font-medium text-[#374151] hover:bg-[#F7F8FC] transition cursor-pointer disabled:opacity-50">
                Back
              </button>
            </motion.div>
          )}

          {/* ── IMPORT SUMMARY ────────────────────────────── */}
          {step === 'import-summary' && importedData && (
            <motion.div key="import-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="max-w-md mx-auto py-8 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#ECEDF3]">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Resume Imported</h2>
                  <p className="text-sm text-[#6B7280] mt-0.5">Review the extracted data before editing</p>
                </div>
              </div>

              <div className="bg-white border border-[#ECEDF3] rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-[#111827]">Extraction Summary</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Name', ok: importedData.stats?.name },
                    { label: 'Email', ok: importedData.stats?.email },
                    { label: `Education (${importedData.stats?.educationCount || 0})`, ok: importedData.stats?.educationCount > 0 },
                    { label: `Skills (${importedData.stats?.skillsCount || 0})`, ok: importedData.stats?.skillsCount > 0 },
                    { label: `Projects (${importedData.stats?.projectsCount || 0})`, ok: importedData.stats?.projectsCount > 0 },
                    { label: `Experience (${importedData.stats?.experienceCount || 0})`, ok: importedData.stats?.experienceCount > 0 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.ok ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <AlertCircle size={14} className="text-amber-500 shrink-0" />}
                      <span className="text-sm text-[#374151]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#ECEDF3] rounded-2xl p-5 space-y-2.5">
                <label className="text-xs font-medium text-[#6B7280]">Resume Type</label>
                <p className="text-[11px] text-[#9CA3AF]">Auto-detected from content. Override if needed.</p>
                <select value={selectedCategoryOverride} onChange={(e) => setSelectedCategoryOverride(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#ECEDF3] bg-white text-sm text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-50 transition">
                  <option value="Fresher">Fresher Resume</option>
                  <option value="Experienced">Experienced Resume</option>
                  <option value="Internship">Internship Resume</option>
                  <option value="Academic">Academic Resume</option>
                </select>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Real-Time ATS Analysis</h4>
                </div>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  Evaluate your imported resume keywords and structure against real job roles before opening the builder.
                </p>
                <button
                  onClick={() => {
                    setAtsSelectedResumeId(importedData.id);
                    setActiveTab('ats');
                    setStep('dashboard');
                  }}
                  className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Shield size={14} /> Run Real-Time ATS Analysis Now
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('import-resume')}
                  className="flex-1 h-11 rounded-xl border border-[#ECEDF3] bg-white text-sm font-medium text-[#374151] hover:bg-[#F7F8FC] transition cursor-pointer">
                  Back
                </button>
                <button onClick={handleReviewAndContinue}
                  className="flex-[2] h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition cursor-pointer">
                  Review & Continue <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Drawers & Modals ────────────────────────────────── */}
      <TemplateDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        template={selectedTemplate}
        onPreview={() => { setIsDrawerOpen(false); setIsPreviewModalOpen(true); }}
        onUse={() => selectedTemplate && handleSelectTemplate(selectedTemplate.id)}
        isLoading={isSelecting}
      />
      <TemplatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        template={selectedTemplate}
        onNext={handleNextTemplate}
        onPrev={handlePrevTemplate}
        onUse={() => selectedTemplate && handleSelectTemplate(selectedTemplate.id)}
        isLoading={isSelecting}
        data={templatePreviewData}
      />
      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-24 px-4" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#ECEDF3] overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#ECEDF3]">
              <Search size={16} className="text-[#9CA3AF] shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search resumes, templates, sections…"
                className="flex-grow text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none bg-transparent"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-[#9CA3AF] hover:text-[#6B7280] transition"><X size={16} /></button>
            </div>
            {/* Suggestion Tags */}
            {!searchQuery && (
              <div className="px-4 pt-3 flex flex-wrap gap-1.5">
                {['Fresher', 'ATS', 'Projects', 'Skills', 'Experience'].map(tag => (
                  <button key={tag} onClick={() => setSearchQuery(tag)}
                    className="px-2.5 py-1 rounded-lg bg-[#F7F8FC] border border-[#ECEDF3] text-[10px] font-semibold text-[#6B7280] hover:bg-[#EFF6FF] hover:border-blue-200 hover:text-[#2563EB] transition cursor-pointer">
                    {tag}
                  </button>
                ))}
              </div>
            )}
            <div className="p-4 space-y-1 max-h-[400px] overflow-y-auto">
              {/* Navigation Shortcuts */}
              {(() => {
                const q = searchQuery.toLowerCase().trim();
                if (!q) return null;
                const matches: Array<{ label: string; action: () => void; icon: any; color: string }> = [];

                if (q.includes('profile') || q.includes('settings') || q.includes('account')) {
                  matches.push({ label: 'Go to Profile Settings', action: () => router.push('/profile'), icon: User, color: 'text-emerald-500 bg-emerald-50' });
                }
                if (q.includes('create') || q.includes('new') || q.includes('builder')) {
                  matches.push({ label: 'Start New Resume Builder', action: () => handleCreateResumeStart(), icon: Plus, color: 'text-blue-500 bg-blue-50' });
                }
                if (q.includes('resume') || q.includes('dashboard') || q.includes('my')) {
                  matches.push({ label: 'View My Resumes Dashboard', action: () => { setActiveTab('home'); setStep('dashboard'); }, icon: FileText, color: 'text-indigo-500 bg-indigo-50' });
                }
                if (q.includes('ats') || q.includes('score') || q.includes('analyze') || q.includes('keywords')) {
                  matches.push({ label: 'Open ATS Keyword Analyzer', action: () => { setActiveTab('ats'); setStep('dashboard'); }, icon: Zap, color: 'text-amber-500 bg-amber-50' });
                }
                if (q.includes('template') || q.includes('gallery') || q.includes('change')) {
                  matches.push({ label: 'Browse Template Gallery', action: () => { setActiveTab('templates'); setStep('dashboard'); }, icon: LayoutTemplate, color: 'text-purple-500 bg-purple-50' });
                }
                if (q.includes('about') || q.includes('help') || q.includes('info')) {
                  matches.push({ label: 'Read About SmartCV', action: () => router.push('/about'), icon: Info, color: 'text-slate-500 bg-slate-50' });
                }

                if (matches.length === 0) return null;

                return (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 mb-2">Navigation Shortcuts</p>
                    <div className="space-y-1">
                      {matches.map((m, i) => (
                        <button
                          key={i}
                          onClick={() => { m.action(); setSearchOpen(false); setSearchQuery(''); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F3F4F6] transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                              <m.icon size={13} />
                            </div>
                            <span className="text-xs font-semibold text-[#111827]">{m.label}</span>
                          </div>
                          <ChevronRight size={13} className="text-[#94A3B8]" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] px-2 mb-2">Your Resumes</p>
              {(() => {
                const q = searchQuery.toLowerCase().trim();
                const filtered = resumes.filter(r => {
                  if (!q) return true;
                  return r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.role.toLowerCase().includes(q);
                });

                const qLower = q.toLowerCase();
                const hasNavMatches = qLower.includes('profile') || qLower.includes('settings') || qLower.includes('create') || qLower.includes('new') || qLower.includes('builder') || qLower.includes('dashboard') || qLower.includes('ats') || qLower.includes('template') || qLower.includes('about');

                if (filtered.length === 0 && !hasNavMatches) {
                  return (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#9CA3AF] mb-3">
                        <AlertCircle size={16} />
                      </div>
                      <p className="text-xs font-bold text-[#111827]">No results found</p>
                      <p className="text-[11px] text-[#6B7280] max-w-[200px] mt-1 leading-relaxed">No resumes or actions match your query.</p>
                      <div className="flex flex-wrap gap-1 justify-center mt-3 max-w-[220px]">
                        {['Fresher', 'ATS', 'Skills', 'Templates', 'Profile'].map(tag => (
                          <button key={tag} onClick={() => setSearchQuery(tag)}
                            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[9px] font-semibold text-[#6B7280] hover:text-[#2563EB] hover:border-blue-200 transition cursor-pointer">
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return filtered.length === 0 ? null : (
                  <div className="space-y-1">
                    {filtered.map(r => (
                      <button key={r.id} onClick={() => { router.push(`/builder?resumeId=${r.id}`); setSearchOpen(false); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F8FC] transition text-left cursor-pointer">
                        <FileText size={14} className="text-[#9CA3AF] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111827] truncate">{r.title}</p>
                          <p className="text-[11px] text-[#9CA3AF]">{r.category} · {r.role}</p>
                        </div>
                        {favorites.includes(r.id) && <Heart size={12} className="text-red-400 fill-red-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                );
              })()}
              <div className="border-t border-[#F0F1F8] mt-2 pt-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] px-2 mb-2">Quick Actions</p>
                <button onClick={() => { handleCreateResumeStart(); setSearchOpen(false); setSearchQuery(''); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F8FC] transition text-left cursor-pointer">
                  <Plus size={14} className="text-[#2563EB] shrink-0" />
                  <p className="text-sm font-medium text-[#2563EB]">Create New Resume</p>
                </button>
                <button onClick={() => { setActiveTab('templates'); setSearchOpen(false); setSearchQuery(''); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F8FC] transition text-left cursor-pointer">
                  <LayoutTemplate size={14} className="text-[#7C3AED] shrink-0" />
                  <p className="text-sm font-medium text-[#7C3AED]">Browse Templates</p>
                </button>
                <button onClick={() => { router.push('/profile'); setSearchOpen(false); setSearchQuery(''); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F8FC] transition text-left cursor-pointer">
                  <User size={14} className="text-[#10B981] shrink-0" />
                  <p className="text-sm font-medium text-[#10B981]">Edit Profile</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#ECEDF3] p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-[#111827]">Delete Resume?</h3>
            <p className="text-sm text-[#6B7280] mt-1.5">This action cannot be undone. Your resume draft will be permanently removed.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 h-10 rounded-xl border border-[#ECEDF3] text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition">Cancel</button>
              <button onClick={() => handleDeleteResume(deleteConfirmId)} className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-[200] animate-fade-in-up flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${toastMsg.type === 'success' ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
          }`}>
          {toastMsg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}
