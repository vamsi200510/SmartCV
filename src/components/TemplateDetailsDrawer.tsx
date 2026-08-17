'use client';

import React, { useEffect } from 'react';
import {
  X, Star, CheckCircle2, Layout, FileText,
  Sparkles, Award, ArrowRight, Eye
} from 'lucide-react';
import { ResumeTemplate } from '@/types/database.types';

interface TemplateDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  template: ResumeTemplate | null;
  onPreview: () => void;
  onUse: () => void;
  isLoading?: boolean;
}

export default function TemplateDetailsDrawer({
  isOpen,
  onClose,
  template,
  onPreview,
  onUse,
  isLoading = false,
}: TemplateDetailsDrawerProps) {
  // Prevent body scroll when drawer is open
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

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!template) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#1A130B]/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] border-l border-[#E0D5C5] z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col bg-white text-[#241C12] ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E0D5C5] flex items-center justify-between bg-[#F6EFE4]">
          <div>
            <span className="text-[10px] font-bold text-[#1E6FA8] uppercase tracking-widest block">Template Profile</span>
            <h2 className="text-lg font-black mt-0.5 text-[#241C12]">{template.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="liquid-glass-interactive liquid-glass-circle h-9 w-9 text-[#5C4E3E] hover:text-[#241C12] shadow-xs cursor-pointer"
          >
            <span className="liquid-glass-specular" aria-hidden="true" />
            <span className="liquid-glass-refraction" aria-hidden="true" />
            <X size={16} className="relative z-10 liquid-glass-content" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* ATS Performance Rating */}
          <div className="border border-[#C7E1F0] rounded-2xl p-5 relative overflow-hidden bg-[#F6EFE4] shadow-sm">
            {/* Subtle glow blob behind glass */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E8963D] opacity-10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-[#1E6FA8] uppercase tracking-wider block">ATS Compliance</span>
                <span className="text-3xl font-black tracking-tight text-[#241C12]">{template.ats_score}%</span>
                <span className="text-[11px] block mt-1 text-[#5C4E3E]">Industry standard scanner success</span>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center border bg-white border-[#86EFAC] text-[#1F7A3D]">
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#E0D5C5] rounded-xl p-4 bg-[#F6EFE4]">
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-[#5C4E3E]">
                <Layout size={14} className="text-[#1E6FA8]" />
                <span>Layout</span>
              </div>
              <div className="text-sm font-bold text-[#241C12]">{template.layout_type}</div>
            </div>

            <div className="border border-[#E0D5C5] rounded-xl p-4 bg-[#F6EFE4]">
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-[#5C4E3E]">
                <FileText size={14} className="text-[#1E6FA8]" />
                <span>Page Length</span>
              </div>
              <div className="text-sm font-bold text-[#241C12]">{template.page_length}</div>
            </div>
          </div>

          {/* Recruiter Rating */}
          <div className="border border-[#E0D5C5] rounded-xl p-5 space-y-3 bg-[#F6EFE4]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A8C7E]">Recruiter Verdict</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`star-${i}`}
                    size={14}
                    className={i < template.recruiter_rating ? 'fill-[#B5790C] text-[#B5790C]' : 'text-[#D5C8B4]'}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[#5C4E3E]">
              Tested against screening patterns of recruiters at Fortune 500 enterprises. Highly legible layout minimizes rejection risk.
            </p>
          </div>

          {/* Best For Tags */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9A8C7E]">Best For</h3>
            <div className="flex flex-wrap gap-2">
              {template.best_for.map((tag) => (
                <div
                  key={tag}
                  className="border border-[#C7E1F0] bg-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-[#1E6FA8] shadow-sm"
                >
                  <CheckCircle2 size={12} className="text-[#1F7A3D]" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Role */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#9A8C7E]">Recommended Role</h3>
            <div className="border border-[#E0D5C5] rounded-xl p-4 flex items-center justify-between bg-[#F6EFE4]">
              <div>
                <div className="text-xs font-semibold text-[#5C4E3E]">Target Segment</div>
                <div className="text-sm font-bold mt-0.5 text-[#241C12]">{template.recommended_role}</div>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white text-[#C2600E] border border-[#F2D9B8]">
                Ideal Layout
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E0D5C5] flex flex-col gap-3 bg-[#F6EFE4]">
          <button
            onClick={onPreview}
            className="liquid-glass-interactive liquid-glass-pill w-full h-11 text-xs font-bold text-[#5C4E3E] hover:text-[#241C12] shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="liquid-glass-specular" aria-hidden="true" />
            <span className="liquid-glass-refraction" aria-hidden="true" />
            <span className="relative z-10 flex items-center gap-2 liquid-glass-content">
              <Eye size={14} />
              <span>Open Fullscreen Preview</span>
            </span>
          </button>

          <button
            onClick={onUse}
            disabled={isLoading}
            className="w-full h-12 bg-[#C2600E] hover:bg-[#9C4A08] text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(46,32,19,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <Sparkles size={14} />
                <span>Use This Template</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
