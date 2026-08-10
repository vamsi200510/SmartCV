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
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] border-l border-[#E2E8F0] z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col bg-white text-[#0F172A] ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/60">
          <div>
            <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest block">Template Profile</span>
            <h2 className="text-lg font-black mt-0.5 text-[#0F172A]">{template.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="h-9 w-9 rounded-full border border-[#E2E8F0] flex items-center justify-center transition duration-200 bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#0F172A] shadow-sm cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* ATS Performance Rating */}
          <div className="border border-blue-100/60 rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-blue-50/40 to-purple-50/30 shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-[#2563EB] uppercase tracking-wider block">ATS Compliance</span>
                <span className="text-3xl font-black tracking-tight text-[#0F172A]">{template.ats_score}%</span>
                <span className="text-[11px] block mt-1 text-[#64748B]">Industry standard scanner success</span>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center border bg-emerald-50 border-emerald-100 text-emerald-600">
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#E2E8F0] rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-[#64748B]">
                <Layout size={14} className="text-[#2563EB]" />
                <span>Layout</span>
              </div>
              <div className="text-sm font-bold text-[#0F172A]">{template.layout_type}</div>
            </div>

            <div className="border border-[#E2E8F0] rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-[#64748B]">
                <FileText size={14} className="text-[#2563EB]" />
                <span>Page Length</span>
              </div>
              <div className="text-sm font-bold text-[#0F172A]">{template.page_length}</div>
            </div>
          </div>

          {/* Recruiter Rating */}
          <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-3 bg-slate-50/30">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Recruiter Verdict</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={`star-${i}`}
                    size={14}
                    className={i < template.recruiter_rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[#64748B]">
              Tested against screening patterns of recruiters at Fortune 500 enterprises. Highly legible layout minimizes rejection risk.
            </p>
          </div>

          {/* Best For Tags */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Best For</h3>
            <div className="flex flex-wrap gap-2">
              {template.best_for.map((tag) => (
                <div
                  key={tag}
                  className="border border-blue-100/60 bg-blue-50/50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-[#2563EB] shadow-sm"
                >
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Role */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Recommended Role</h3>
            <div className="border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="text-xs font-semibold text-[#64748B]">Target Segment</div>
                <div className="text-sm font-bold mt-0.5 text-[#0F172A]">{template.recommended_role}</div>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-100">
                Ideal Layout
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E2E8F0] flex flex-col gap-3 bg-slate-50/60">
          <button
            onClick={onPreview}
            className="w-full h-11 text-xs font-bold rounded-xl border border-[#E2E8F0] transition duration-200 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#0F172A] shadow-sm cursor-pointer"
          >
            <Eye size={14} />
            <span>Open Fullscreen Preview</span>
          </button>

          <button
            onClick={onUse}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
