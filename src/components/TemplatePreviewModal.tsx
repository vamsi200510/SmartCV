'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, Maximize2, ChevronLeft, 
  ChevronRight, Check 
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
  data?: any;
  title?: string;
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onNext,
  onPrev,
  onUse,
  isLoading = false,
  data,
  title
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
      'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Navbar Toolbar */}
      <header className="h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors duration-300 border-slate-200/80 bg-white/85 backdrop-blur-md">
        
        {/* Left side: Template Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            title="Close Preview"
            className="liquid-glass-interactive liquid-glass-square h-9 w-9 text-slate-600 hover:text-slate-900 shadow-xs cursor-pointer"
          >
            <span className="liquid-glass-specular" aria-hidden="true" />
            <span className="liquid-glass-refraction" aria-hidden="true" />
            <X size={16} className="relative z-10 liquid-glass-content" />
          </button>
          <div className="hidden sm:block">
            <h3 className="text-sm font-black leading-none text-slate-950">
              {title || template.name}
            </h3>
            <span className="text-[9px] font-bold tracking-wider uppercase mt-1 block text-slate-400">
              {title ? `${template.name} · ${template.layout_type}` : `${template.layout_type} · ${template.page_length}`}
            </span>
          </div>
        </div>

        {/* Center: Zoom & Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 p-1 rounded-full liquid-glass-toolbar shadow-xs">
          {/* Prev template */}
          {!data && (
            <>
              <button
                onClick={onPrev}
                className="liquid-glass-interactive liquid-glass-circle h-8 w-8 text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Previous Template (←)"
              >
                <span className="liquid-glass-specular" aria-hidden="true" />
                <span className="liquid-glass-refraction" aria-hidden="true" />
                <ChevronLeft size={16} className="relative z-10 liquid-glass-content" />
              </button>
              <div className="h-4 w-[1px] bg-slate-200/80" />
            </>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="liquid-glass-interactive liquid-glass-circle h-7 w-7 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              title="Zoom Out"
            >
              <span className="liquid-glass-specular" aria-hidden="true" />
              <span className="liquid-glass-refraction" aria-hidden="true" />
              <ZoomOut size={14} className="relative z-10 liquid-glass-content" />
            </button>
            
            <span className="text-xs font-mono font-bold min-w-10 text-center text-slate-700 select-none">
              {zoom}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              className="liquid-glass-interactive liquid-glass-circle h-7 w-7 text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              title="Zoom In"
            >
              <span className="liquid-glass-specular" aria-hidden="true" />
              <span className="liquid-glass-refraction" aria-hidden="true" />
              <ZoomIn size={14} className="relative z-10 liquid-glass-content" />
            </button>

            <button
              onClick={handleFitToScreen}
              className="liquid-glass-interactive liquid-glass-circle h-7 w-7 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Fit to Screen"
            >
              <span className="liquid-glass-specular" aria-hidden="true" />
              <span className="liquid-glass-refraction" aria-hidden="true" />
              <Maximize2 size={12} className="relative z-10 liquid-glass-content" />
            </button>
          </div>

          {/* Next template */}
          {!data && (
            <>
              <div className="h-4 w-[1px] bg-slate-200/80" />
              <button
                onClick={onNext}
                className="liquid-glass-interactive liquid-glass-circle h-8 w-8 text-slate-600 hover:text-slate-900 cursor-pointer"
                title="Next Template (→)"
              >
                <span className="liquid-glass-specular" aria-hidden="true" />
                <span className="liquid-glass-refraction" aria-hidden="true" />
                <ChevronRight size={16} className="relative z-10 liquid-glass-content" />
              </button>
            </>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUse}
            disabled={isLoading}
            className="liquid-glass-interactive liquid-glass-pill px-5 h-9 text-white text-xs font-black uppercase tracking-wider transition duration-200 flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            style={{
              background: 'linear-gradient(140deg, rgba(37, 99, 235, 0.92) 0%, rgba(79, 70, 229, 0.88) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            <span className="liquid-glass-specular" aria-hidden="true" />
            <span className="liquid-glass-refraction" aria-hidden="true" />
            <span className="relative z-10 flex items-center gap-1.5 liquid-glass-content">
              {isLoading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <Check size={14} className="stroke-[3]" />
                  <span>{data ? 'Edit Resume' : 'Use Template'}</span>
                </>
              )}
            </span>
          </button>
        </div>
      </header>

      {/* Main Preview Workarea */}
      <div className={`flex-1 overflow-auto flex justify-center items-start p-8 md:p-12 transition-colors duration-300 ${
        'bg-slate-200/50'
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



