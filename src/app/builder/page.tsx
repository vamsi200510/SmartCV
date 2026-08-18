'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Maximize2, Loader2, Check, AlertCircle,
  Download, Eye, Columns, FileText as FileTextIcon, Palette,
  LayoutTemplate, Shield, CheckCircle2, Lightbulb, X,
  Pencil, ChevronDown, RotateCcw, RotateCw, Minus, Plus, User as UserIcon, Settings, Home, LogOut,
  Move, Hand, ChevronRight, ChevronLeft, MessageSquareHeart
} from 'lucide-react';
import TemplateRenderer, { defaultSampleData } from '@/components/TemplateRenderer';
import ResumeBuilderForm from '@/components/ResumeBuilderForm';
import DesignWorkspace from '@/components/DesignWorkspace';
import AIChatPanel, { AIPanelMode } from '@/components/AIChatPanel';
import FloatingAIAssistant from '@/components/FloatingAIAssistant';
import FeedbackModal from '@/components/FeedbackModal';
import { ColorMeshBackdrop } from '@/components/ui/ColorMeshBackdrop';
import { ResumeTemplate } from '@/types/database.types';
import { AIService, ChatMessage } from '@/lib/ai/aiService';
import { evaluateResumeATS } from '@/lib/ai/atsEngine';

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
  { id: 'product-manager-pro', name: 'Product Manager Pro', ats_score: 97, recommended_role: 'Product Manager', best_for: ['Product Manager', 'Executive'], layout_type: 'Single Column', page_length: 'Two Page', recruiter_rating: 5 },
];

type ViewMode = 'form' | 'design' | 'split' | 'preview';

type CornerType = 'nw' | 'ne' | 'se' | 'sw';

interface BuilderPreviewPaneProps {
  viewMode: ViewMode;
  selectedTemplate: any;
  previewData: any;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  isDragging: boolean;
}

function BuilderPreviewPane({
  viewMode,
  selectedTemplate,
  previewData,
  zoom,
  setZoom,
  isDragging,
}: BuilderPreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.65);
  const [canvasHeight, setCanvasHeight] = useState<number>(1123);

  // Pan / Movable state: allows user to freely drag the canvas anywhere
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ startX: number; startY: number; initPanX: number; initPanY: number }>({
    startX: 0,
    startY: 0,
    initPanX: 0,
    initPanY: 0,
  });

  // Corner resize state
  const [isResizingCorner, setIsResizingCorner] = useState<CornerType | null>(null);

  // Continuous ResizeObserver on container to track available width smoothly during divider drag
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) {
          // Generous breathing room: 64px horizontal margin
          const availableW = Math.max(100, w - 64);
          // Scale to comfortable 72% fit (max 0.85 scale) so the document floats with spacious margins
          const fit = Math.min(0.85, (availableW * 0.72) / 794);
          setScale(Math.max(0.18, fit));
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Track dynamic height of rendered template canvas
  useEffect(() => {
    const cEl = canvasRef.current;
    if (!cEl) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (h > 0) {
          setCanvasHeight(h);
        }
      }
    });
    ro.observe(cEl);
    return () => ro.disconnect();
  }, [selectedTemplate, previewData]);

  // Mouse pan handlers: drag canvas background to move anywhere
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only left click on canvas background starts pan
    if (e.button !== 0 || isResizingCorner) return;
    setIsPanning(true);
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPanX: panOffset.x,
      initPanY: panOffset.y,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.startX;
    const dy = e.clientY - panStartRef.current.startY;
    setPanOffset({
      x: panStartRef.current.initPanX + dx,
      y: panStartRef.current.initPanY + dy,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetPosition = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoom(100);
  };

  // Corner resize handler: drag corner handles to adjust document scale in real time
  const handleCornerMouseDown = (e: React.MouseEvent, corner: CornerType) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizingCorner(corner);

    const startX = e.clientX;
    const startY = e.clientY;
    const startZoom = zoom;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let delta = 0;
      if (corner === 'se') {
        delta = (dx + dy) * 0.35;
      } else if (corner === 'sw') {
        delta = (-dx + dy) * 0.35;
      } else if (corner === 'ne') {
        delta = (dx - dy) * 0.35;
      } else if (corner === 'nw') {
        delta = (-dx - dy) * 0.35;
      }

      const newZoom = Math.round(Math.max(30, Math.min(200, startZoom + delta)));
      setZoom(newZoom);
    };

    const onMouseUp = () => {
      setIsResizingCorner(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const effectiveScale = scale * (zoom / 100);
  const scaledWidth = Math.round(794 * effectiveScale);
  const scaledHeight = Math.round(canvasHeight * effectiveScale);

  return (
    <section
      className={`flex flex-col relative rounded-2xl bg-[#F5EFEB] border border-[#E8DDD0] h-full min-h-0 overflow-hidden select-none ${
        viewMode === 'preview' ? 'flex-1' : 'w-full lg:flex-1'
      }`}
    >
      {/* ── Top Floating Mini Canvas Control Bar ──────────────── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Status / Drag Hint */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E8DDD0] shadow-xs text-[11px] font-bold text-[#5C4E3E] pointer-events-auto">
          <Move size={12} className="text-[#C2600E]" />
          <span>Move & resize corners</span>
          {(panOffset.x !== 0 || panOffset.y !== 0) && (
            <span className="text-[10px] text-[#9A8C7E] font-mono">
              ({panOffset.x > 0 ? `+${Math.round(panOffset.x)}` : Math.round(panOffset.x)}px, {panOffset.y > 0 ? `+${Math.round(panOffset.y)}` : Math.round(panOffset.y)}px)
            </span>
          )}
        </div>

        {/* Action buttons: Center / Fit */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {(panOffset.x !== 0 || panOffset.y !== 0 || zoom !== 100) && (
            <button
              onClick={handleResetPosition}
              className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-[11px] font-bold text-[#C2600E] border border-[#E8DDD0] hover:border-[#C2600E] shadow-xs flex items-center gap-1 transition cursor-pointer"
              title="Reset position and center resume"
            >
              <RotateCcw size={11} />
              <span>Center</span>
            </button>
          )}
          <button
            onClick={() => { setZoom(100); setPanOffset({ x: 0, y: 0 }); }}
            className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-[11px] font-bold text-[#241C12] border border-[#E8DDD0] hover:border-[#C2600E] shadow-xs flex items-center gap-1 transition cursor-pointer"
            title="Auto-fit to available window"
          >
            <Maximize2 size={11} className="text-slate-600" />
            <span>Fit</span>
          </button>
        </div>
      </div>

      {/* ── Movable Infinite Preview Canvas ───────────────────── */}
      <div
        ref={containerRef}
        id="resume-preview-container"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDoubleClick={handleResetPosition}
        style={{
          cursor: isPanning ? 'move' : 'default',
        }}
        className="flex-1 overflow-auto p-8 pt-14 pb-36 flex items-center justify-center custom-scrollbar min-h-0 relative touch-none select-none"
      >
        {selectedTemplate ? (
          <div
            className="relative shrink-0 flex items-center justify-center m-auto group/canvas"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              minHeight: `${Math.round(1123 * effectiveScale)}px`,
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
              transition: isPanning || isDragging || isResizingCorner ? 'none' : 'transform 0.15s ease-out, width 0.12s ease-out, height 0.12s ease-out',
            }}
          >
            {/* Resume Document Paper */}
            <div
              ref={canvasRef}
              id="resume-preview-document"
              className="bg-white shadow-[0_16px_50px_rgba(36,28,18,0.12),0_2px_10px_rgba(36,28,18,0.06)] ring-1 ring-black/5 resume-paper origin-top-left absolute top-0 left-0"
              style={{
                width: '794px',
                minHeight: '1123px',
                transform: `scale(${effectiveScale})`,
                transformOrigin: 'top left',
                transition: isDragging || isResizingCorner ? 'none' : 'transform 0.12s ease-out',
              }}
            >
              <TemplateRenderer templateId={selectedTemplate.id} data={previewData} zoom={100} />
            </div>

            {/* ── Interactive 4-Corner Size Adjusting Handles ──────── */}
            {/* Top-Left Corner Handle */}
            <div
              onMouseDown={(e) => handleCornerMouseDown(e, 'nw')}
              title="Drag to resize resume"
              style={{ cursor: 'nwse-resize' }}
              className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-white border-2 border-[#C2600E] shadow-md z-30 cursor-nwse-resize hover:scale-125 transition-transform opacity-70 group-hover/canvas:opacity-100 flex items-center justify-center"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#C2600E]" />
            </div>

            {/* Top-Right Corner Handle */}
            <div
              onMouseDown={(e) => handleCornerMouseDown(e, 'ne')}
              title="Drag to resize resume"
              style={{ cursor: 'nesw-resize' }}
              className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-white border-2 border-[#C2600E] shadow-md z-30 cursor-nesw-resize hover:scale-125 transition-transform opacity-70 group-hover/canvas:opacity-100 flex items-center justify-center"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#C2600E]" />
            </div>

            {/* Bottom-Left Corner Handle */}
            <div
              onMouseDown={(e) => handleCornerMouseDown(e, 'sw')}
              title="Drag to resize resume"
              style={{ cursor: 'nesw-resize' }}
              className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-white border-2 border-[#C2600E] shadow-md z-30 cursor-nesw-resize hover:scale-125 transition-transform opacity-70 group-hover/canvas:opacity-100 flex items-center justify-center"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#C2600E]" />
            </div>

            {/* Bottom-Right Corner Handle */}
            <div
              onMouseDown={(e) => handleCornerMouseDown(e, 'se')}
              title="Drag to resize resume"
              style={{ cursor: 'nwse-resize' }}
              className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-white border-2 border-[#C2600E] shadow-md z-30 cursor-nwse-resize hover:scale-125 transition-transform opacity-70 group-hover/canvas:opacity-100 flex items-center justify-center"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-[#C2600E]" />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 size={24} className="animate-spin text-[#C2600E]" />
            <span className="text-xs font-medium">Preparing canvas…</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default function BuilderPage() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();

  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeDetails, setResumeDetails] = useState<any | null>(null);
  const [activeResumeData, setActiveResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isPreviewingPdf, setIsPreviewingPdf] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiMode, setAiMode] = useState<AIPanelMode>('edit');
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Split pane resizer state & persistence (Balanced 46% form / 54% preview split)
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(46);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Draggable right action rail state
  const [dockPosition, setDockPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDockDragging, setIsDockDragging] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDockPosition({ x: window.innerWidth - 82, y: 72 });
    }
  }, []);

  // Restore panel width from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartcv-builder-panel-width');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 20 && parsed <= 75) {
          setEditorWidthPercent(parsed);
        }
      }
    }
  }, []);

  // Dragging event handlers for real-time split pane resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    let animationFrameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId !== null) return;

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const containerWidth = rect.width;
        if (containerWidth <= 0) return;

        const mouseX = e.clientX - rect.left;
        const minEditorWidthPx = 320;
        const minPreviewWidthPx = 280;
        const maxEditorWidthPx = Math.min(containerWidth * 0.75, containerWidth - minPreviewWidthPx);

        const clampedX = Math.max(minEditorWidthPx, Math.min(mouseX, maxEditorWidthPx));
        const newPercent = (clampedX / containerWidth) * 100;

        setEditorWidthPercent(newPercent);
      });
    };

    const handleMouseUp = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      setEditorWidthPercent((prev) => {
        localStorage.setItem('smartcv-builder-panel-width', prev.toFixed(2));
        return prev;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Click outside listener for profile menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    const newTitle = editedTitle.trim() || resumeDetails?.title || 'My Resume';
    if (newTitle === resumeDetails?.title) return;
    setResumeDetails((prev: any) => ({ ...prev, title: newTitle }));
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resumeId,
          title: newTitle,
          resume_data: activeResumeData,
          template_id: selectedTemplate?.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to update title');
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to update title', err);
      setSaveStatus('error');
    }
  };

  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [atsJobDescription, setAtsJobDescription] = useState('');
  const [atsJobRole, setAtsJobRole] = useState('');
  const [atsAnalyzing, setAtsAnalyzing] = useState(false);
  const [atsResults, setAtsResults] = useState<any>(null);

  const liveAtsAnalysis = useMemo(() => {
    if (!activeResumeData) return null;
    return evaluateResumeATS(
      activeResumeData,
      atsJobRole || resumeDetails?.role || activeResumeData.personalInfo?.title || '',
      atsJobDescription
    );
  }, [activeResumeData, atsJobRole, resumeDetails?.role, atsJobDescription]);

  const currentAtsScore = atsResults?.score ?? liveAtsAnalysis?.score ?? 0;

  const runAtsAnalysis = async () => {
    if (!activeResumeData) return;
    setAtsAnalyzing(true);
    setAtsResults(null);
    try {
      const res = await fetch('/api/resumes/ats-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: activeResumeData,
          jobRole: atsJobRole || resumeDetails?.role || activeResumeData.personalInfo?.title || '',
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
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setResumeId(params.get('resumeId'));
    }
  }, []);

  useEffect(() => {
    if (!resumeId) return;
    const fetch_ = async () => {
      setLoading(true);
      console.time('[Builder] Resume data load');
      try {
        const headers: Record<string, string> = {};
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        const res = await fetch(`/api/resumes?id=${resumeId}`, { headers });
        const data = await res.json();
        if (!res.ok) {
          console.warn(`[Builder] Resume fetch returned status ${res.status}:`, data.error);
          if (res.status === 404) {
            console.warn('[Builder] Resume draft not found, returning to dashboard.');
            router.push('/dashboard');
            return;
          }
          throw new Error(data.error || 'Failed to fetch resume');
        }
        setResumeDetails(data);
        const initialData = data.resume_data || {};
        setActiveResumeData(initialData);
        setHistory([initialData]);
        setHistoryIndex(0);
        if (data.template_id) {
          setSelectedTemplate(TEMPLATE_METADATA.find(t => t.id === data.template_id) || null);
        } else {
          setSelectedTemplate(TEMPLATE_METADATA[0]);
        }
      } catch (err: any) {
        console.error('Failed to load resume:', err.message || err);
      } finally {
        console.timeEnd('[Builder] Resume data load');
        setLoading(false);
      }
    };
    fetch_();
  }, [resumeId, router]);

  // Guard AI welcome message with ref to only run once
  const aiMessageInitialized = useRef(false);
  useEffect(() => {
    if (profile && !aiMessageInitialized.current) {
      aiMessageInitialized.current = true;
      setMessages([
        {
          role: 'assistant',
          content: `Hi ${profile.full_name || 'there'}! I am your SmartCV AI Career Assistant. Ask me to rewrite your summary, optimize for an ATS keyword, or adjust resume layout parameters in real-time!`
        }
      ]);
    }
  }, [profile]);

  // Pre-fill name/email from profile on first load
  useEffect(() => {
    if (!loading && activeResumeData) {
      let updated = false;
      const copy = { ...activeResumeData };
      if (!copy.personalInfo) { copy.personalInfo = {}; updated = true; }
      if (!copy.personalInfo.fullName && profile?.full_name) { copy.personalInfo.fullName = profile.full_name; updated = true; }
      if (!copy.personalInfo.email && user?.email) { copy.personalInfo.email = user.email; updated = true; }
      if (!copy.personalInfo.profileImage && profile?.profile_image) { copy.personalInfo.profileImage = profile.profile_image; updated = true; }
      if (updated) setActiveResumeData(copy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user, loading]);

  // ── Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+K) ────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !isInput) {
        e.preventDefault();
        handleUndo();
      }
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && !isInput) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z' && !isInput)) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAiPanelOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIndex, history]);

  const historyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoRef = useRef(false);

  // ── Centralized Page-Level Autosave ─────────────────────────────
  useEffect(() => {
    if (!resumeId || !activeResumeData || loading) return;
    if (saveStatus !== 'saving') return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/resumes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: resumeId,
            resume_data: activeResumeData,
            template_id: selectedTemplate?.id,
          }),
        });
        if (!res.ok) throw new Error('Autosave failed');
        setSaveStatus('saved');
      } catch (err) {
        console.error('[Page Autosave Error]', err);
        setSaveStatus('error');
      }
    }, 1000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [activeResumeData, saveStatus, resumeId, selectedTemplate, loading]);

  // ── Customization helpers (memoized) ─────────────────────────────
  const customization = useMemo(() =>
    activeResumeData?.customization || {
      fontFamily: 'Inter',
      fontSize: 'medium',
      density: 'balanced',
      primaryColor: '#241C12',
      visibleSections: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'],
      sectionOrder: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements', 'additionalInfo'],
      sectionTypography: {},
    }, [activeResumeData?.customization]);

  const getCustomization = () => customization;

  const handleDesignChange = (updatedCustomization: any) => {
    handleFormChange({ ...activeResumeData, customization: updatedCustomization });
  };

  const pushToHistory = (newData: any) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    if (JSON.stringify(newData) === JSON.stringify(activeResumeData)) return;
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newData]);
    setHistoryIndex(newHistory.length);
  };

  const handleFormChange = (data: any) => {
    setActiveResumeData(data);
    setSaveStatus('saving');

    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(() => {
      pushToHistory(data);
    }, 1000);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      isUndoRedoRef.current = true;
      setHistoryIndex(prevIndex);
      setActiveResumeData(history[prevIndex]);
      setSaveStatus('saving');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      isUndoRedoRef.current = true;
      setHistoryIndex(nextIndex);
      setActiveResumeData(history[nextIndex]);
      setSaveStatus('saving');
    }
  };

  // Global Undo / Redo keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA'].includes(targetTag)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIndex, history]);

  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || aiLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: promptText };
    setMessages(prev => [...prev, userMsg]);
    setAiLoading(true);

    try {
      const response = await AIService.sendCommand({
        prompt: promptText,
        currentResumeData: activeResumeData,
        selectedTemplate,
        chatHistory: messages,
        userProfile: profile,
        mode: aiMode,
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.explanation,
        changes: response.changes,
        suggestedPrompts: response.suggestedPrompts,
        pendingApproval: !!(response.changes && Object.keys(response.changes).length > 0)
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message || 'Failed to get AI response'}.`
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyChanges = (msgIndex: number, changes: any) => {
    if (!changes || typeof changes !== 'object') return;
    const copy = JSON.parse(JSON.stringify(activeResumeData || {}));

    if (!copy.personalInfo) copy.personalInfo = {};

    // 1. Nested personalInfo patch
    if (changes.personalInfo && typeof changes.personalInfo === 'object') {
      copy.personalInfo = { ...copy.personalInfo, ...changes.personalInfo };
    }

    // 2. Direct top-level personalInfo fields if AI returns flat structure
    const personalKeys = ['fullName', 'title', 'email', 'phone', 'location', 'website', 'github', 'linkedin', 'summary', 'profileImage'];
    for (const key of personalKeys) {
      if (changes[key] !== undefined) {
        copy.personalInfo[key] = changes[key];
      }
    }

    // 3. Section data
    if (Array.isArray(changes.experience)) copy.experience = changes.experience;
    if (Array.isArray(changes.education)) copy.education = changes.education;
    if (Array.isArray(changes.projects)) copy.projects = changes.projects;
    if (Array.isArray(changes.skills)) copy.skills = changes.skills;
    if (Array.isArray(changes.certifications)) copy.certifications = changes.certifications;
    if (Array.isArray(changes.achievements)) copy.achievements = changes.achievements;

    if (changes.additionalInfo && typeof changes.additionalInfo === 'object') {
      copy.additionalInfo = { ...(copy.additionalInfo || {}), ...changes.additionalInfo };
    }
    if (changes.customization && typeof changes.customization === 'object') {
      const existingCustomization = copy.customization || {};
      const incomingCustomization = changes.customization;

      // Deep-merge sectionTypography: merge per-section overrides without wiping existing sections
      const existingSectionTypography = existingCustomization.sectionTypography || {};
      const incomingSectionTypography = incomingCustomization.sectionTypography || {};
      const mergedSectionTypography = Object.keys(incomingSectionTypography).length > 0
        ? {
          ...existingSectionTypography,
          ...Object.fromEntries(
            Object.entries(incomingSectionTypography).map(([sectionId, styles]) => [
              sectionId,
              { ...(existingSectionTypography[sectionId] || {}), ...(styles as object) }
            ])
          )
        }
        : existingSectionTypography;

      copy.customization = {
        ...existingCustomization,
        ...incomingCustomization,
        // Preserve deep-merged sectionTypography
        sectionTypography: Object.keys(mergedSectionTypography).length > 0 ? mergedSectionTypography : undefined,
      };
    }

    pushToHistory(copy);
    setActiveResumeData(copy);
    setSaveStatus('saving');

    setMessages(prev => prev.map((msg, idx) => idx === msgIndex ? { ...msg, pendingApproval: false } : msg));
  };

  const handleDiscardChanges = (msgIndex: number) => {
    setMessages(prev => prev.map((msg, idx) => idx === msgIndex ? { ...msg, pendingApproval: false } : msg));
  };



  const handleExportPdf = async () => {
    if (!resumeId || pdfExporting) return;
    setPdfExporting(true);
    try {
      // Save current activeResumeData to DB first so export PDF endpoint reads latest data
      await fetch('/api/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resumeId,
          resume_data: activeResumeData,
          template_id: selectedTemplate?.id,
        }),
      });
      setSaveStatus('saved');

      const res = await fetch(`/api/resumes/export-pdf?id=${resumeId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(err.error || 'Failed to export PDF');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const customSlug = (resumeDetails?.title || activeResumeData?.personalInfo?.fullName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `${customSlug}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('[PDF Export Error]', err);
      alert(err.message || 'PDF export failed. Please try again.');
    } finally {
      setPdfExporting(false);
    }
  };

  const previewData = useMemo(() => {
    if (!activeResumeData) return defaultSampleData;
    const pi = activeResumeData.personalInfo || {};
    const userHasData = !!(pi.phone?.trim() || pi.location?.trim() || pi.summary?.trim() || pi.title?.trim() ||
      activeResumeData.education?.length > 0 || activeResumeData.experience?.length > 0 ||
      activeResumeData.projects?.length > 0 || activeResumeData.skills?.length > 0);
    if (userHasData) {
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
          profileImage: pi.profileImage?.trim() || profile?.profile_image || ''
        },
        experience: activeResumeData.experience || [],
        education: activeResumeData.education || [],
        projects: activeResumeData.projects || [],
        skills: activeResumeData.skills || [],
        certifications: activeResumeData.certifications || [],
        achievements: activeResumeData.achievements || [],
        additionalInfo: activeResumeData.additionalInfo || [],
        customization: activeResumeData.customization,
      };
    }
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
        profileImage: pi.profileImage?.trim() || profile?.profile_image || ''
      },
      experience: activeResumeData.experience?.length > 0 ? activeResumeData.experience : defaultSampleData.experience,
      education: activeResumeData.education?.length > 0 ? activeResumeData.education : defaultSampleData.education,
      projects: activeResumeData.projects?.length > 0 ? activeResumeData.projects : defaultSampleData.projects,
      skills: activeResumeData.skills?.length > 0 ? activeResumeData.skills : defaultSampleData.skills,
      certifications: activeResumeData.certifications?.length > 0 ? activeResumeData.certifications : defaultSampleData.certifications,
      achievements: activeResumeData.achievements?.length > 0 ? activeResumeData.achievements : defaultSampleData.achievements,
      additionalInfo: activeResumeData.additionalInfo || defaultSampleData.additionalInfo,
      customization: activeResumeData.customization,
    };
  }, [activeResumeData, profile?.profile_image]);

  if (!user) return null;

  const viewModes: { id: ViewMode; label: string; icon: any }[] = [
    { id: 'form', label: 'Form', icon: FileTextIcon },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'split', label: 'Split', icon: Columns },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col font-[Inter,sans-serif] level-0-base text-[#241C12] relative color-mesh-backdrop">
      <ColorMeshBackdrop />
      {/* Subtle dot grid */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #D5D2A0 0.8px, transparent 0.8px)', backgroundSize: '22px 22px', opacity: 0.35 }} />

      {/* ── TOP BAR ─────────────── */}
      <header className="min-h-[64px] border-b border-[#E8DDD0] bg-white/95 backdrop-blur-md px-6 py-2 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-xs">
        {/* Left: Back button + Title & ATS Sub-metadata */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={() => router.replace('/dashboard')}
            className="h-9 w-9 rounded-xl bg-[#FAF6F2] hover:bg-[#F5EFEB] border border-[#E8DDD0] text-slate-700 hover:text-[#241C12] flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex flex-col min-w-0 justify-center">
            {/* Title Row */}
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="h-7 px-2.5 py-0.5 rounded-lg border border-[#C2600E] bg-white text-[14px] font-semibold text-[#241C12] focus:outline-none focus:ring-2 focus:ring-[#C2600E]/20 max-w-[260px]"
                />
              ) : (
                <div
                  className="flex items-center gap-1.5 cursor-pointer group"
                  onClick={() => {
                    setIsEditingTitle(true);
                    setEditedTitle(resumeDetails?.title || 'My Resume');
                  }}
                  title="Click to edit resume title"
                >
                  <span className="text-[15px] font-semibold text-[#241C12] truncate max-w-[240px] tracking-tight">
                    {resumeDetails?.title || 'My Resume'}
                  </span>
                  <div
                    className="h-6 w-6 rounded-md hover:bg-black/5 text-slate-400 group-hover:text-[#241C12] flex items-center justify-center transition-colors shrink-0"
                    title="Edit Resume Title"
                  >
                    <Pencil size={13} />
                  </div>
                </div>
              )}
            </div>

            {/* Status Row: 2 Clearly Separated, Properly Padded Chips (12-16px margin from header bottom) */}
            <div className="flex items-center flex-wrap gap-2 text-[11px] font-medium pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#1F7A3D] border border-[#86EFAC]/70 text-[10.5px] font-bold shadow-2xs">
                <Check size={11} className="stroke-[2.5]" />
                <span>Saved just now</span>
              </span>

              <button
                onClick={() => {
                  setAtsModalOpen(true);
                  if (!atsResults) runAtsAnalysis();
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold shadow-2xs cursor-pointer hover:opacity-90 transition border ${
                  currentAtsScore >= 75
                    ? 'bg-[#DCFCE7] text-[#1F7A3D] border-[#86EFAC]/70'
                    : currentAtsScore >= 50
                    ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]'
                    : 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                }`}
                title="Click to view real-time ATS audit breakdown"
              >
                <Shield size={11} className="stroke-[2.5]" />
                <span>ATS Score {currentAtsScore}%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Floating Pill Tabs (Form | Design | Split | Preview) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#FAF6F2] p-1 rounded-full border border-[#E8DDD0] shadow-xs">
          {viewModes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`px-4 py-1.5 rounded-full text-[11.5px] font-bold transition-all duration-150 cursor-pointer ${
                viewMode === id
                  ? 'bg-white text-[#C2600E] shadow-xs border border-[#E8DDD0]'
                  : 'text-slate-600 hover:text-[#241C12] hover:bg-white/60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Icon size={13} />
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Feedback + Saved Status + Profile Dropdown Menu */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Feedback Trigger Button */}
          <button
            onClick={() => setFeedbackModalOpen(true)}
            className="h-8 px-3 rounded-full bg-[#FAF6F2] hover:bg-[#F5EFEB] border border-[#E8DDD0] hover:border-[#C2600E] text-xs font-bold text-[#5C4E3E] hover:text-[#C2600E] flex items-center gap-1.5 transition cursor-pointer shadow-2xs group"
            title="Share feedback, feature ideas, or report a bug"
          >
            <MessageSquareHeart size={14} className="text-[#C2600E] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Feedback</span>
          </button>

          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full badge-emerald font-bold text-[11px] shadow-xs">
            <Check size={12} className="text-[#1F7A3D]" /> Saved
          </span>

          <div className="relative" ref={profileMenuRef}>
            <div
              onClick={() => setProfileMenuOpen(o => !o)}
              className="flex items-center gap-1.5 cursor-pointer group select-none p-0.5 rounded-full hover:bg-black/5 transition"
              title="User Profile & Account Menu"
            >
              <div className="h-8 w-8 rounded-full text-white bg-[#C2600E] font-bold text-[10.5px] flex items-center justify-center shadow-xs overflow-hidden border border-white/60">
                <span className="flex items-center justify-center w-full h-full">
                  {profile?.profile_image ? (
                    <img src={profile.profile_image} alt={profile?.full_name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    profile?.full_name ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U')
                  )}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-500 group-hover:text-[#241C12] transition-colors" />
            </div>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8DDD0] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-[#E8DDD0]">
                  <p className="text-xs font-bold text-[#241C12] truncate">{profile?.full_name || user?.user_metadata?.full_name || 'User'}</p>
                  <p className="text-[11px] text-[#5C4E3E] truncate mt-0.5">{user?.email}</p>
                </div>

                <button
                  onClick={() => { router.push('/profile'); setProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-[#F5EFEB] hover:text-[#C2600E] cursor-pointer transition-colors"
                >
                  <UserIcon size={14} className="text-[#5C4E3E]" /> Profile
                </button>

                <button
                  onClick={() => { router.push('/dashboard?tab=settings'); setProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-[#F5EFEB] hover:text-[#C2600E] cursor-pointer transition-colors"
                >
                  <Settings size={14} className="text-[#5C4E3E]" /> Settings
                </button>

                <button
                  onClick={() => { router.replace('/dashboard'); setProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-[#F5EFEB] hover:text-[#C2600E] cursor-pointer transition-colors"
                >
                  <Home size={14} className="text-[#5C4E3E]" /> Dashboard
                </button>

                <button
                  onClick={() => { setFeedbackModalOpen(true); setProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#C2600E] hover:bg-[#FAF6F2] cursor-pointer transition-colors"
                >
                  <MessageSquareHeart size={14} className="text-[#C2600E]" /> Send Feedback
                </button>

                <div className="my-1 border-t border-[#E8DDD0]" />

                <button
                  onClick={async () => {
                    setProfileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#B23A2E] hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── RIGHT FLOATING ACTION CONTROL RAIL (Draggable Liquid Glass Dock) ───── */}
      {dockPosition && (
        <motion.aside
          drag
          dragMomentum={false}
          dragElastic={0.08}
          onDragStart={() => setIsDockDragging(true)}
          onDragEnd={(_, info) => {
            setTimeout(() => setIsDockDragging(false), 50);
            if (typeof window === 'undefined') return;
            const currentX = (dockPosition?.x ?? window.innerWidth - 82) + info.offset.x;
            const currentY = (dockPosition?.y ?? 72) + info.offset.y;
            const snapToRight = currentX > window.innerWidth / 2;
            const targetX = snapToRight ? window.innerWidth - (isDockCollapsed ? 48 : 82) : 16;
            const targetY = Math.max(56, Math.min(window.innerHeight - 250, currentY));
            setDockPosition({ x: targetX, y: targetY });
          }}
          animate={{ x: dockPosition.x, y: dockPosition.y }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 45,
            cursor: isDockDragging ? 'grabbing' : 'grab',
          }}
          className={`hidden xl:flex flex-col rounded-[26px] liquid-glass-surface border border-white/80 shadow-2xl p-2 items-center gap-2 touch-none select-none transition-all ${
            isDockCollapsed ? 'w-10' : 'w-auto'
          }`}
          title="Drag to reposition action dock"
        >
          {/* Top Header with Drag Bar and Collapse Toggle */}
          <div className="w-full flex items-center justify-between gap-1 px-1">
            <div className="w-4 h-1 rounded-full bg-slate-400/50 mx-auto" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDockCollapsed(prev => !prev);
              }}
              className="h-4 w-4 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-600 hover:text-[#C2600E] shadow-2xs transition cursor-pointer"
              title={isDockCollapsed ? 'Expand tool rail' : 'Collapse tool rail'}
            >
              {isDockCollapsed ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
            </button>
          </div>

          {!isDockCollapsed ? (
            <>
              {/* Section 1: ATS Analysis — Dynamic Score */}
              <button
                onClick={() => {
                  if (!isDockDragging) {
                    setAtsModalOpen(true);
                    if (!atsResults) runAtsAnalysis();
                  }
                }}
                className={`w-[62px] py-2.5 flex flex-col items-center justify-center text-center gap-1 rounded-2xl transition-all cursor-pointer group shadow-xs ${
                  currentAtsScore >= 75
                    ? 'bg-[#DCFCE7] border border-[#86EFAC] hover:bg-[#BBF7D0]'
                    : currentAtsScore >= 50
                    ? 'bg-[#FEF3C7] border border-[#FDE68A] hover:bg-[#FDE68A]'
                    : 'bg-[#FEE2E2] border border-[#FCA5A5] hover:bg-[#FECACA]'
                }`}
                title="Run Real-Time ATS Analysis (drag rail to move)"
              >
                <Shield size={16} className={`${currentAtsScore >= 75 ? 'text-[#1F7A3D]' : currentAtsScore >= 50 ? 'text-[#B5790C]' : 'text-[#B23A2E]'} group-hover:scale-105 transition-transform`} />
                <span className={`font-bold text-[10px] ${currentAtsScore >= 75 ? 'text-[#1F7A3D]' : currentAtsScore >= 50 ? 'text-[#B5790C]' : 'text-[#B23A2E]'} leading-tight`}>ATS</span>
                <span className={`px-2 py-0.5 rounded-full text-white font-extrabold text-[9px] shadow-xs ${
                  currentAtsScore >= 75 ? 'bg-[#1F7A3D]' : currentAtsScore >= 50 ? 'bg-[#B5790C]' : 'bg-[#B23A2E]'
                }`}>
                  {currentAtsScore}%
                </span>
              </button>

              {/* Section 2: Change Template — Blue/Sky Tone */}
              <button
                onClick={() => {
                  if (!isDockDragging) {
                    router.push(resumeId ? `/dashboard?tab=templates&source=builder&resumeId=${resumeId}` : '/dashboard?tab=templates');
                  }
                }}
                className="w-[62px] py-2.5 flex flex-col items-center justify-center text-center gap-1 rounded-2xl bg-[#C7E1F0] border border-[#9BC4DE] hover:bg-[#B3D7EC] transition-all cursor-pointer group shadow-xs"
                title="Switch template"
              >
                <LayoutTemplate size={16} className="text-[#1E6FA8] group-hover:scale-105 transition-transform" />
                <span className="font-bold text-[10px] text-[#1E6FA8] leading-tight">Template</span>
              </button>

              {/* Section 3: Export PDF — Orange Family */}
              <button
                onClick={() => {
                  if (!isDockDragging) handleExportPdf();
                }}
                disabled={pdfExporting}
                className="w-[62px] py-2.5 flex flex-col items-center justify-center text-center gap-1 rounded-2xl bg-[#FCE3C7] border border-[#F4B77E] hover:bg-[#F9D0A8] transition-all cursor-pointer group disabled:opacity-50 shadow-xs"
                title="Download PDF Resume"
              >
                {pdfExporting ? <Loader2 size={16} className="animate-spin text-[#C2600E]" /> : <Download size={16} className="text-[#C2600E] group-hover:scale-105 transition-transform" />}
                <span className="font-bold text-[10px] text-[#C2600E] leading-tight">Export</span>
              </button>
            </>
          ) : (
            /* Minimized Icon Stack */
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                onClick={() => {
                  if (!isDockDragging) {
                    setAtsModalOpen(true);
                    if (!atsResults) runAtsAnalysis();
                  }
                }}
                className="h-7 w-7 rounded-xl bg-emerald-100 text-[#1F7A3D] flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 transition-transform"
                title={`ATS Score: ${currentAtsScore}%`}
              >
                <Shield size={14} />
              </button>
              <button
                onClick={() => {
                  if (!isDockDragging) {
                    router.push(resumeId ? `/dashboard?tab=templates&source=builder&resumeId=${resumeId}` : '/dashboard?tab=templates');
                  }
                }}
                className="h-7 w-7 rounded-xl bg-sky-100 text-[#1E6FA8] flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 transition-transform"
                title="Change Template"
              >
                <LayoutTemplate size={14} />
              </button>
              <button
                onClick={() => {
                  if (!isDockDragging) handleExportPdf();
                }}
                disabled={pdfExporting}
                className="h-7 w-7 rounded-xl bg-amber-100 text-[#C2600E] flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 transition-transform disabled:opacity-50"
                title="Export PDF"
              >
                <Download size={14} />
              </button>
            </div>
          )}
        </motion.aside>
      )}

      {/* ── BOTTOM FLOATING ACTION TOOLBAR ─────────────────────────── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full liquid-glass-surface px-4 py-1.5 border border-white/80 shadow-xl">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-white/60 p-1 rounded-full border border-white/80">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="h-7 px-3 rounded-full flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#241C12] hover:bg-white/80 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={12} /> Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="h-7 px-3 rounded-full flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#241C12] hover:bg-white/80 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={12} /> Redo
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-white/80 text-[11px] font-bold text-[#241C12]">
          <button onClick={() => setZoom(p => Math.max(p - 10, 30))} className="h-5 w-5 rounded-full hover:bg-white flex items-center justify-center text-slate-700 hover:text-[#241C12] transition-colors cursor-pointer" title="Zoom out">
            <Minus size={12} />
          </button>
          <span className="min-w-[34px] text-center select-none font-mono text-xs font-bold">{zoom}%</span>
          <button onClick={() => setZoom(p => Math.min(p + 10, 180))} className="h-5 w-5 rounded-full hover:bg-white flex items-center justify-center text-slate-700 hover:text-[#241C12] transition-colors cursor-pointer" title="Zoom in">
            <Plus size={12} />
          </button>
          <button onClick={() => setZoom(100)} className="h-5 w-5 rounded-full hover:bg-white flex items-center justify-center text-slate-700 hover:text-[#241C12] transition-colors cursor-pointer" title="Reset zoom">
            <Maximize2 size={11} />
          </button>
        </div>

        {/* Action buttons */}
        <button
          onClick={() => router.push(resumeId ? `/dashboard?tab=templates&source=builder&resumeId=${resumeId}` : '/dashboard?tab=templates')}
          className="h-8 px-3.5 rounded-full text-[11px] font-bold badge-blue shadow-xs flex items-center gap-1.5 cursor-pointer transition"
          title="Change template layout"
        >
          <LayoutTemplate size={13} className="text-[#1E6FA8]" />
          <span>Template</span>
        </button>

        <button
          onClick={() => setIsPreviewingPdf(true)}
          className="h-8 px-3.5 rounded-full text-[11px] font-bold text-[#241C12] bg-white border border-[#E8DDD0] hover:bg-[#F5EFEB] shadow-xs flex items-center gap-1.5 cursor-pointer transition"
        >
          <Eye size={13} className="text-slate-600" /> Preview
        </button>

        <button
          onClick={handleExportPdf}
          disabled={pdfExporting}
          className="h-8 px-4 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md bg-[#C2600E] hover:bg-[#9C4A08] disabled:opacity-50 cursor-pointer transition"
        >
          {pdfExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          <span>{pdfExporting ? 'Exporting…' : 'Export PDF'}</span>
        </button>
      </div>

      {/* ── Main Workspace ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 size={28} className="animate-spin text-[#C2600E]" />
            <span className="text-sm font-bold">Loading resume…</span>
          </div>
        ) : (
          <div
            ref={containerRef}
            className={`flex-1 flex p-4 overflow-hidden h-full min-h-0 ${
              viewMode === 'preview' ? 'flex-col gap-4' : 'flex-row gap-1'
            }`}
          >

            {/* Form panel — shown in 'form' and 'split' modes */}
            {(viewMode === 'form' || viewMode === 'split') && (
              <section
                className={`flex flex-col overflow-hidden h-full min-h-0 shrink-0 ${
                  viewMode === 'form' ? 'flex-1' : 'w-full'
                }`}
                style={
                  viewMode === 'split'
                    ? { width: `${editorWidthPercent}%` }
                    : undefined
                }
              >
                <ResumeBuilderForm
                  resumeId={resumeId!}
                  initialData={activeResumeData}
                  onChange={handleFormChange}
                  onSaveStatusChange={setSaveStatus}
                  saveStatus={saveStatus}
                  templateId={resumeDetails?.template_id}
                  onPreviewPdf={() => setIsPreviewingPdf(true)}
                />
              </section>
            )}

            {/* Design Workspace — shown in 'design' mode */}
            {viewMode === 'design' && (
              <section
                className="w-full flex flex-col overflow-hidden h-full min-h-0 shrink-0"
                style={{ width: `${editorWidthPercent}%` }}
              >
                <DesignWorkspace
                  customization={getCustomization()}
                  onChange={handleDesignChange}
                  onChangeTemplate={() => router.push(resumeId ? `/dashboard?tab=templates&source=builder&resumeId=${resumeId}` : '/dashboard?tab=templates')}
                  resumeId={resumeId || undefined}
                />
              </section>
            )}

            {/* Draggable Divider Handle with soft color, grip pill, and hover glow */}
            {(viewMode === 'split' || viewMode === 'design') && (
              <div
                onMouseDown={handleMouseDown}
                style={{ cursor: 'col-resize' }}
                className={`hidden lg:flex w-4 relative items-center justify-center shrink-0 cursor-col-resize group select-none py-1 z-30 transition-all ${
                  isDragging ? 'bg-[#C2600E]/10' : 'hover:bg-[#C2600E]/5'
                }`}
                title="Drag to resize workspace panels (double click to reset)"
                onDoubleClick={() => setEditorWidthPercent(46)}
              >
                <div
                  style={{ cursor: 'col-resize' }}
                  className={`w-[2px] h-full rounded-full pointer-events-none transition-colors duration-200 ${
                    isDragging ? 'bg-[#C2600E]' : 'bg-[#E8DDD0] group-hover:bg-[#C2600E]'
                  }`}
                />
                <div
                  style={{ cursor: 'col-resize' }}
                  className={`absolute top-1/2 -translate-y-1/2 h-8 w-2.5 rounded-full pointer-events-none flex flex-col items-center justify-center gap-1 shadow-sm transition-all duration-200 ${
                    isDragging
                      ? 'bg-[#C2600E] scale-110 ring-4 ring-[#C2600E]/20'
                      : 'bg-white border border-[#E8DDD0] group-hover:bg-[#C2600E] group-hover:border-[#C2600E] group-hover:scale-110 group-hover:ring-4 group-hover:ring-[#C2600E]/15'
                  }`}
                >
                  <div className={`w-1 h-1 rounded-full pointer-events-none ${isDragging ? 'bg-white' : 'bg-[#9A8C7E] group-hover:bg-white'}`} />
                  <div className={`w-1 h-1 rounded-full pointer-events-none ${isDragging ? 'bg-white' : 'bg-[#9A8C7E] group-hover:bg-white'}`} />
                  <div className={`w-1 h-1 rounded-full pointer-events-none ${isDragging ? 'bg-white' : 'bg-[#9A8C7E] group-hover:bg-white'}`} />
                </div>
              </div>
            )}

            {/* Preview panel — shown in 'split', 'design', and 'preview' modes */}
            {(viewMode === 'split' || viewMode === 'design' || viewMode === 'preview') && (
              <BuilderPreviewPane
                viewMode={viewMode}
                selectedTemplate={selectedTemplate}
                previewData={previewData}
                zoom={zoom}
                setZoom={setZoom}
                isDragging={isDragging}
              />
            )}

          </div>
        )}
      </main>

      {/* ── PDF Preview Overlay ──────────────────────────────── */}
      {isPreviewingPdf && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 flex flex-col items-center overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setIsPreviewingPdf(false)}>
          {/* Toolbar */}
          <div className="w-full max-w-[860px] flex items-center justify-between bg-[#2E2013] text-white px-6 py-3.5 rounded-t-2xl mt-6 shadow-2xl shrink-0">
            <div>
              <h3 className="text-sm font-bold">PDF Preview</h3>
              <p className="text-[11px] text-[#C8D9E6] mt-0.5">This is how your resume will look when exported.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportPdf}
                disabled={pdfExporting}
                className="h-9 px-4 rounded-xl bg-white text-[#241C12] text-xs font-bold hover:bg-[#F5EFEB] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {pdfExporting ? <Loader2 size={13} className="animate-spin text-[#C2600E]" /> : <Download size={13} />}
                {pdfExporting ? 'Downloading…' : 'Download PDF'}
              </button>
              <button
                onClick={() => setIsPreviewingPdf(false)}
                className="h-9 px-4 rounded-xl border border-white/20 bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          {/* Document */}
          <div className="w-full max-w-[860px] bg-[#1A1B1E] border-x border-b border-slate-800 rounded-b-2xl p-8 flex justify-center mb-6 shadow-2xl">
            <div
              id="resume-preview-document"
              className="bg-white resume-paper shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_40px_rgba(0,0,0,0.2)]"
              style={{ width: '794px', minHeight: '1123px' }}
            >
              <TemplateRenderer
                templateId={selectedTemplate?.id || 'ats-professional'}
                data={previewData}
                zoom={100}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Floating AI Assistant ──────────────────────────── */}
      <FloatingAIAssistant
        isOpen={aiPanelOpen}
        onOpen={() => setAiPanelOpen(true)}
      />

      {/* ── AI Chat Panel (slide-over) ──────────────────────── */}
      <AIChatPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onApplyChanges={handleApplyChanges}
        onDiscardChanges={handleDiscardChanges}
        isLoading={aiLoading}
        profileName={profile?.full_name}
        mode={aiMode}
        onModeChange={setAiMode}
      />

      {/* Real-Time ATS Analysis Modal */}
      {atsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setAtsModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DDD0] bg-[#FFFEF9]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1F7A3D]">
                  <Shield size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#241C12]">Real-Time ATS Analysis</h3>
                  <p className="text-xs text-[#5C4E3E]">Live analysis based on active resume content & target role</p>
                </div>
              </div>
              <button onClick={() => setAtsModalOpen(false)} className="text-slate-400 hover:text-[#241C12] p-1 rounded-lg hover:bg-[#F5EFEB] transition cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C4E3E] mb-1 uppercase tracking-wide">Target Role</label>
                  <input
                    type="text"
                    value={atsJobRole}
                    onChange={e => setAtsJobRole(e.target.value)}
                    placeholder={resumeDetails?.role || activeResumeData?.personalInfo?.title || 'e.g. Software Engineer'}
                    className="w-full h-10 px-3 rounded-xl level-2-input text-xs text-[#241C12] focus:outline-none focus:border-[#C2600E] focus:bg-white focus:ring-2 focus:ring-[#C2600E]/20 transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#5C4E3E] mb-1 uppercase tracking-wide">Target Job Description (Optional)</label>
                  <textarea
                    rows={3}
                    value={atsJobDescription}
                    onChange={e => setAtsJobDescription(e.target.value)}
                    placeholder="Paste job description keywords, requirements, or tech stack..."
                    className="w-full p-3 rounded-xl level-2-input text-xs text-[#241C12] focus:outline-none focus:border-[#C2600E] focus:bg-white focus:ring-2 focus:ring-[#C2600E]/20 transition resize-none"
                  />
                </div>
              </div>

              <button
                onClick={runAtsAnalysis}
                disabled={atsAnalyzing}
                className="w-full h-10 rounded-full bg-[#1F7A3D] hover:bg-[#165A2C] text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md"
              >
                {atsAnalyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing Real-Time Content...</> : <><Shield size={14} /> Re-run Real-Time ATS Analysis</>}
              </button>

              {atsResults && (
                <div className="space-y-5 pt-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-white border border-[#E8DDD0] shadow-xs">
                    <div className="relative shrink-0">
                      <svg width="76" height="76" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="36" fill="none" stroke="#E8DDD0" strokeWidth="4" />
                        <circle cx="40" cy="40" r="36" fill="none" stroke={atsResults.score >= 75 ? '#1F7A3D' : atsResults.score >= 50 ? '#C2600E' : '#B23A2E'}
                          strokeWidth="4" strokeDasharray={`${atsResults.score * 2.26} ${226 - atsResults.score * 2.26}`} strokeDashoffset="56.5" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-base font-black ${atsResults.score >= 75 ? 'text-[#1F7A3D]' : atsResults.score >= 50 ? 'text-[#C2600E]' : 'text-[#B23A2E]'}`}>{atsResults.score}%</span>
                        <span className="text-[8px] font-bold text-[#5C4E3E] uppercase">Score</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                          atsResults.score >= 75 ? 'badge-emerald' : atsResults.score >= 50 ? 'badge-amber' : 'badge-rose'
                        }`}>
                          {atsResults.jobRoleMatch || (atsResults.score >= 75 ? 'Strong Match' : atsResults.score >= 50 ? 'Moderate Match' : 'Needs Improvement')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#241C12] mt-1">Role: <span className="text-[#C2600E] font-extrabold">{atsResults.evaluatedRole}</span></h4>
                      <p className="text-xs text-[#5C4E3E] mt-0.5 font-medium">Deterministic signal analysis based on active resume content &amp; job description.</p>
                    </div>
                  </div>

                  {/* 4-Tier Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="level-2-nested p-2.5 rounded-xl border border-[#E8DDD0] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#5C4E3E]">
                        <span>Keywords</span>
                        <span className="text-[8px] text-[#C2600E] font-black">40% WT</span>
                      </div>
                      <p className="text-base font-black text-[#241C12]">{atsResults.keywordMatchScore}%</p>
                      <div className="h-1 bg-[#E8DDD0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1E6FA8] rounded-full" style={{ width: `${atsResults.keywordMatchScore}%` }} />
                      </div>
                    </div>

                    <div className="level-2-nested p-2.5 rounded-xl border border-[#E8DDD0] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#5C4E3E]">
                        <span>Content Impact</span>
                        <span className="text-[8px] text-[#C2600E] font-black">25% WT</span>
                      </div>
                      <p className="text-base font-black text-[#241C12]">{atsResults.impactScore}%</p>
                      <div className="h-1 bg-[#E8DDD0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C2600E] rounded-full" style={{ width: `${atsResults.impactScore}%` }} />
                      </div>
                    </div>

                    <div className="level-2-nested p-2.5 rounded-xl border border-[#E8DDD0] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#5C4E3E]">
                        <span>Formatting</span>
                        <span className="text-[8px] text-[#C2600E] font-black">20% WT</span>
                      </div>
                      <p className="text-base font-black text-[#241C12]">{atsResults.formattingScore}%</p>
                      <div className="h-1 bg-[#E8DDD0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1F7A3D] rounded-full" style={{ width: `${atsResults.formattingScore}%` }} />
                      </div>
                    </div>

                    <div className="level-2-nested p-2.5 rounded-xl border border-[#E8DDD0] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#5C4E3E]">
                        <span>Completeness</span>
                        <span className="text-[8px] text-[#C2600E] font-black">15% WT</span>
                      </div>
                      <p className="text-base font-black text-[#241C12]">{atsResults.completenessScore ?? 0}%</p>
                      <div className="h-1 bg-[#E8DDD0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7650A8] rounded-full" style={{ width: `${atsResults.completenessScore ?? 0}%` }} />
                      </div>
                    </div>
                  </div>

                  {Array.isArray(atsResults.matchedKeywords) && atsResults.matchedKeywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#241C12] mb-2 flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#1F7A3D]" /> Matched Keywords ({atsResults.matchedKeywords.length})</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResults.matchedKeywords.map((kw: string) => (
                          <span key={kw} className="px-2.5 py-1 rounded-lg badge-emerald text-[10px] shadow-xs">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(atsResults.missingKeywords) && atsResults.missingKeywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#241C12] mb-2 flex items-center gap-1.5"><AlertCircle size={13} className="text-[#B5790C]" /> Missing Required Keywords ({atsResults.missingKeywords.length})</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResults.missingKeywords.map((kw: string) => (
                          <span key={kw} className="px-2.5 py-1 rounded-lg badge-amber text-[10px] shadow-xs">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(atsResults.actionableSuggestions) && atsResults.actionableSuggestions.length > 0 && (
                    <div className="level-2-nested rounded-xl p-4 border border-[#E8DDD0]">
                      <h4 className="text-xs font-bold text-[#C2600E] mb-2 flex items-center gap-1.5"><Lightbulb size={13} className="text-[#C2600E]" /> Actionable ATS Improvements</h4>
                      <ul className="space-y-2 text-xs text-[#241C12]">
                        {atsResults.actionableSuggestions.map((tip: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#C2600E] font-bold">•</span>
                            <span className="font-medium leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        userEmail={user?.email || ''}
        userName={profile?.full_name || ''}
      />
    </div>
  );
}
