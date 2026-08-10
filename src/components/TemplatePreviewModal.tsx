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
      <header className={`h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors duration-300 ${
        'border-slate-200 bg-white'
      }`}>
        
        {/* Left side: Template Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            title="Close Preview"
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition duration-200 cursor-pointer ${
              'border-slate-250 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 shadow-sm'
            }`}
          >
            <X size={16} />
          </button>
          <div className="hidden sm:block">
            <h3 className={`text-sm font-black leading-none text-slate-950`}>
              {title || template.name}
            </h3>
            <span className={`text-[9px] font-bold tracking-wider uppercase mt-1 block text-slate-400`}>
              {title ? `${template.name} · ${template.layout_type}` : `${template.layout_type} · ${template.page_length}`}
            </span>
          </div>
        </div>

        {/* Center: Zoom & Navigation Controls */}
        <div className={`flex items-center gap-2 sm:gap-4 p-1.5 rounded-xl border transition-colors duration-300 ${
          'bg-slate-100 border-slate-200 shadow-sm'
        }`}>
          {/* Prev template */}
          {!data && (
            <>
              <button
                onClick={onPrev}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
                  'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Previous Template (←)"
              >
                <ChevronLeft size={16} />
              </button>
              <div className={`h-4 w-[1px] bg-slate-250`} />
            </>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
                'hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-655 hover:text-slate-900'
              }`}
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            
            <span className={`text-xs font-mono font-bold min-w-10 text-center text-slate-700`}>
              {zoom}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 150}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
                'hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent text-slate-655 hover:text-slate-900'
              }`}
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>

            <button
              onClick={handleFitToScreen}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
                'hover:bg-slate-200 text-slate-655 hover:text-slate-900'
              }`}
              title="Fit to Screen"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Next template */}
          {!data && (
            <>
              <div className={`h-4 w-[1px] bg-slate-250`} />
              <button
                onClick={onNext}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition duration-150 cursor-pointer ${
                  'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Next Template (→)"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
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
                <span>{data ? 'Edit Resume' : 'Use Template'}</span>
              </>
            )}
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



