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
  isDarkMode?: boolean;
}

export default function TemplateDetailsDrawer({
  isOpen,
  onClose,
  template,
  onPreview,
  onUse,
  isLoading = false,
  isDarkMode = false
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

  if (!template) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] border-l z-50 shadow-2xl transition-transform duration-300 ease-out transform flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-slate-150 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isDarkMode ? 'border-slate-850 bg-slate-950/20' : 'border-slate-150 bg-slate-50/50'
        }`}>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-teal-400 uppercase tracking-widest block">Template Profile</span>
            <h2 className={`text-lg font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{template.name}</h2>
          </div>
          <button
            onClick={onClose}
            className={`h-9 w-9 rounded-full border flex items-center justify-center transition duration-200 ${
              isDarkMode 
                ? 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-white' 
                : 'border-slate-250 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 shadow-sm'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* ATS Performance Rating */}
          <div className={`border rounded-2xl p-5 relative overflow-hidden ${
            isDarkMode 
              ? 'bg-gradient-to-br from-indigo-950/30 to-teal-950/10 border-indigo-900/30' 
              : 'bg-gradient-to-br from-indigo-50/40 to-teal-50/30 border-indigo-100/60 shadow-sm'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-indigo-600 dark:text-teal-400 uppercase tracking-wider block">ATS Compliance</span>
                <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{template.ats_score}%</span>
                <span className={`text-[11px] block mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Industry standard scanner success</span>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                isDarkMode 
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                  : 'bg-teal-50 border-teal-100 text-teal-655'
              }`}>
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`border rounded-xl p-4 ${isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/50 border-slate-150'}`}>
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-slate-500">
                <Layout size={14} className="text-indigo-500" />
                <span>Layout Column</span>
              </div>
              <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{template.layout_type}</div>
            </div>

            <div className={`border rounded-xl p-4 ${isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/50 border-slate-150'}`}>
              <div className="flex items-center gap-2 text-xs font-semibold mb-1 text-slate-500">
                <FileText size={14} className="text-indigo-500" />
                <span>Page Capacity</span>
              </div>
              <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{template.page_length}</div>
            </div>
          </div>

          {/* Recruiter Evaluation Rating */}
          <div className={`border rounded-xl p-5 space-y-3 ${isDarkMode ? 'bg-slate-950/20 border-slate-850' : 'bg-slate-50/30 border-slate-150'}`}>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Recruiter Verdict</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < template.recruiter_rating 
                        ? 'fill-amber-400 text-amber-400' 
                        : isDarkMode ? 'text-slate-700' : 'text-slate-200'
                    }
                  />
                ))}
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Tested against screening patterns of recruiters at Fortune 500 enterprises. Highly legible layout optimization minimizes rejection risks.
            </p>
          </div>

          {/* Target Audience & Placements */}
          <div className="space-y-3">
            <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>// STRATEGIC FOR</h3>
            <div className="flex flex-wrap gap-2">
              {template.best_for.map((tag, idx) => (
                <div 
                  key={idx} 
                  className={`border px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    isDarkMode 
                      ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-300' 
                      : 'bg-indigo-50/50 border-indigo-100/60 text-indigo-700 shadow-sm'
                  }`}
                >
                  <CheckCircle2 size={12} className="text-teal-500" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Recommended Role */}
          <div className="space-y-2">
            <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>// RECOMMENDED FOCUS</h3>
            <div className={`border rounded-xl p-4 flex items-center justify-between ${isDarkMode ? 'bg-slate-950/50 border-slate-850' : 'bg-slate-50/50 border-slate-150'}`}>
              <div>
                <div className="text-xs font-semibold text-slate-500">Target Segment</div>
                <div className={`text-sm font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{template.recommended_role}</div>
              </div>
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                isDarkMode 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'bg-indigo-50 text-indigo-750 border border-indigo-100 shadow-sm'
              }`}>
                Ideal Layout
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t flex flex-col gap-3 ${
          isDarkMode ? 'border-slate-850 bg-slate-950/50' : 'border-slate-150 bg-slate-50/60'
        }`}>
          <button
            onClick={onPreview}
            className={`w-full h-11 text-xs font-bold rounded-xl border transition duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
            }`}
          >
            <Eye size={14} />
            <span>Open Fullscreen Preview</span>
          </button>
          
          <button
            onClick={onUse}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-teal-500 to-indigo-650 hover:from-teal-400 hover:to-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] shadow-md shadow-indigo-550/10 disabled:opacity-55 disabled:scale-100 cursor-pointer"
          >
            {isLoading ? (
              <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
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
