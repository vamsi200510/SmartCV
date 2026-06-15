'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, Maximize2, ChevronLeft, 
  ChevronRight, CheckCircle2, Check 
} from 'lucide-react';
import TemplateRenderer from './TemplateRenderer';
import { ResumeTemplate } from '@/types/database.types';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ResumeTemplate | null;
  onNext: () => void;
  onPrev: () => void;
  onUse: () => void;
  isLoading?: boolean;
  isDarkMode?: boolean;
  data?: any;
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onNext,
  onPrev,
  onUse,
  isLoading = false,
  isDarkMode = false,
  data
}: TemplatePreviewModalProps) {
  const [zoom, setZoom] = useState<number>(90); // default zoom

  // Handle keyboard events (Esc to close, Left/Right arrows for templates)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !template) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleFitToScreen = () => setZoom(90);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Navbar Toolbar */}
      <header className={`h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors duration-300 ${
        isDarkMode ? 'border-slate-900 bg-slate-950' : 'border-slate-200 bg-white'
      }`}>
        
        {/* Left side: Template Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition duration-200 cursor-pointer ${
              isDarkMode 
                ? 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400 hover:text-white' 
                : 'border-slate-250 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 shadow-sm'
            }`}
          >
            <X size={16} />
          </button>
          <div className="hidden sm:block">
            <h3 className={`text-sm font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{template.name}</h3>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-1 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {template.layout_type} • {template.page_length}
            </span>
          </div>
        </div>

        {/* Center: Zoom & Navigation Controls */}
        <div className={`flex items-center gap-2 sm:gap-4 p-1.5 rounded-xl border transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-slate-100 border-slate-200 shadow-sm'
        }`}>
          {/* Prev template */}
          <button
            onClick={onPrev}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Previous Template (←)"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Divider */}
          <div className={`h-4 w-[1px] ${isDarkMode ? 'bg-slate-850' : 'bg-slate-250'}`} />

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
                isDarkMode 
                  ? 'hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 hover:text-slate-900'
              }`}
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            
            <span className={`text-xs font-mono font-bold min-w-10 text-center ${isDarkMode ? 'text-slate-350' : 'text-slate-700'}`}>
              {zoom}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
                isDarkMode 
                  ? 'hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white' 
                  : 'hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 hover:text-slate-900'
              }`}
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>

            <button
              onClick={handleFitToScreen}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Fit to Screen"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Divider */}
          <div className={`h-4 w-[1px] ${isDarkMode ? 'bg-slate-850' : 'bg-slate-250'}`} />

          {/* Next template */}
          <button
            onClick={onNext}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Next Template (→)"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUse}
            disabled={isLoading}
            className="px-5 h-10 bg-gradient-to-r from-teal-500 to-indigo-650 hover:from-teal-400 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-lg transition duration-200 flex items-center gap-1.5 shadow-md shadow-indigo-650/10 cursor-pointer"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <Check size={14} className="stroke-[3]" />
                <span>Use Template</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Preview Workarea */}
      <div className={`flex-1 overflow-auto flex justify-center items-start p-8 md:p-12 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950' : 'bg-slate-200/50'
      }`}>
        <div 
          className="transition-all duration-150 ease-out flex justify-center shadow-2xl border border-slate-200/30"
          style={{ 
            height: `${1123 * (zoom / 100) + 48}px`, 
            width: `${794 * (zoom / 100) + 48}px`,
          }}
        >
          <TemplateRenderer templateId={template.id} zoom={zoom} data={data} />
        </div>
      </div>
    </div>
  );
}
