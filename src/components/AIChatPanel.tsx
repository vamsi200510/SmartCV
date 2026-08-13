'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  X, Send, Pencil, Lightbulb, BarChart2,
  ChevronRight, Check, Loader2, Info
} from 'lucide-react';
import { ChatMessage } from '@/lib/ai/aiService';

// ── Types ─────────────────────────────────────────────────────────
export type AIPanelMode = 'edit' | 'suggest' | 'analyze';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => void;
  onApplyChanges: (msgIndex: number, changes: any) => void;
  onDiscardChanges: (msgIndex: number) => void;
  isLoading: boolean;
  profileName?: string;
  mode: AIPanelMode;
  onModeChange: (mode: AIPanelMode) => void;
}

// ── Mode config ────────────────────────────────────────────────────
const MODES: { id: AIPanelMode; label: string; icon: React.ReactNode; description: string; placeholder: string }[] = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <Pencil size={13} />,
    description: 'Directly modify resume content and formatting',
    placeholder: 'e.g. Rewrite my summary to be more impact-focused…',
  },
  {
    id: 'suggest',
    label: 'Suggest',
    icon: <Lightbulb size={13} />,
    description: 'Get contextual improvement recommendations',
    placeholder: 'e.g. What can I improve in my projects section?',
  },
  {
    id: 'analyze',
    label: 'Analyze',
    icon: <BarChart2 size={13} />,
    description: 'Full document audit with a detailed report',
    placeholder: 'e.g. Analyze my resume for ATS compatibility…',
  },
];

// ── Quick action pills (contextual by mode) ───────────────────────
const QUICK_ACTIONS: Record<AIPanelMode, string[]> = {
  edit: [
    'Rewrite my summary',
    'Improve bullet points',
    'Fix grammar & phrasing',
    'Add ATS keywords',
  ],
  suggest: [
    'Find weak sections',
    'Suggest better verbs',
    'Check keyword density',
    'Improve readability',
  ],
  analyze: [
    'Full ATS audit',
    'Section strength report',
    'Formatting review',
    'Missing sections check',
  ],
};

// ── Typing dots indicator ─────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="h-7 w-7 rounded-xl border border-[#ECEDF3] bg-white flex items-center justify-center shrink-0 p-1.5 shadow-sm">
        <img src="/Chatbot_logo.png" alt="AI" className="h-full w-full object-contain" />
      </div>
      <div className="bg-white border border-[#ECEDF3] rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────
// ── Visual Diff Helper ─────────────────────────────────────────────
function renderDiffDetails(changes: any) {
  if (!changes || typeof changes !== 'object') return null;
  const diffs: { label: string; value: string }[] = [];

  // Personal Info
  const pi = changes.personalInfo || {};
  if (pi.fullName) diffs.push({ label: 'Full Name', value: pi.fullName });
  if (pi.title) diffs.push({ label: 'Title', value: pi.title });
  if (pi.phone) diffs.push({ label: 'Phone', value: pi.phone });
  if (pi.email) diffs.push({ label: 'Email', value: pi.email });
  if (pi.location) diffs.push({ label: 'Location', value: pi.location });
  if (pi.summary) diffs.push({ label: 'Summary', value: pi.summary.length > 45 ? pi.summary.slice(0, 45) + '…' : pi.summary });

  // Direct flat personal info fallback
  if (!changes.personalInfo) {
    if (changes.phone) diffs.push({ label: 'Phone', value: changes.phone });
    if (changes.email) diffs.push({ label: 'Email', value: changes.email });
    if (changes.fullName) diffs.push({ label: 'Full Name', value: changes.fullName });
    if (changes.summary) diffs.push({ label: 'Summary', value: changes.summary.slice(0, 45) + '…' });
  }

  // Customization
  const cust = changes.customization || {};
  if (cust.fontFamily) diffs.push({ label: 'Font Family', value: cust.fontFamily });
  if (cust.fontSize) diffs.push({ label: 'Font Size', value: cust.fontSize });
  if (cust.density) diffs.push({ label: 'Density', value: cust.density });
  if (cust.primaryColor) diffs.push({ label: 'Theme Color', value: cust.primaryColor });
  if (cust.sectionOrder) diffs.push({ label: 'Section Order', value: cust.sectionOrder.join(' → ') });

  // Section typography overrides
  if (cust.sectionTypography && typeof cust.sectionTypography === 'object') {
    Object.entries(cust.sectionTypography).forEach(([sectionId, styles]: [string, any]) => {
      const parts: string[] = [];
      if (styles.fontSize) parts.push(`size: ${styles.fontSize}`);
      if (styles.fontWeight) parts.push(`weight: ${styles.fontWeight}`);
      if (styles.color) parts.push(`color: ${styles.color}`);
      if (parts.length > 0) {
        const label = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
        diffs.push({ label: `${label} Typography`, value: parts.join(', ') });
      }
    });
  }

  // Section arrays
  if (Array.isArray(changes.experience)) diffs.push({ label: 'Experience', value: `${changes.experience.length} entries` });
  if (Array.isArray(changes.projects)) diffs.push({ label: 'Projects', value: `${changes.projects.length} entries` });
  if (Array.isArray(changes.skills)) diffs.push({ label: 'Skills', value: `${changes.skills.length} categories` });
  if (Array.isArray(changes.education)) diffs.push({ label: 'Education', value: `${changes.education.length} entries` });
  if (Array.isArray(changes.certifications)) diffs.push({ label: 'Certifications', value: `${changes.certifications.length} entries` });
  if (Array.isArray(changes.achievements)) diffs.push({ label: 'Achievements', value: `${changes.achievements.length} entries` });

  if (diffs.length === 0) return null;

  return (
    <div className="bg-white/90 border border-[#DBEAFE] rounded-lg p-2 space-y-1.5 my-1 text-[10px]">
      <p className="font-bold text-[#1E40AF] uppercase tracking-wider text-[9px]">Proposed Modifications</p>
      <div className="space-y-1">
        {diffs.map((d, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-[#374151]">
            <span className="font-semibold text-[#6B7280] shrink-0">{d.label}:</span>
            <span className="font-mono text-[10px] text-[#1D4ED8] truncate max-w-[170px]" title={d.value}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Message Bubble Component ───────────────────────────────────────
function MessageBubble({
  msg,
  index,
  onApply,
  onDiscard,
  onQuickSend,
}: {
  msg: ChatMessage;
  index: number;
  onApply: (idx: number, changes: any) => void;
  onDiscard: (idx: number) => void;
  onQuickSend: (text: string) => void;
}) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="h-7 w-7 rounded-xl border border-[#ECEDF3] bg-white flex items-center justify-center shrink-0 p-1.5 shadow-sm">
          <img src="/Chatbot_logo.png" alt="AI" className="h-full w-full object-contain" />
        </div>
      )}

      <div className="max-w-[84%] flex flex-col gap-2">
        {/* Message text */}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
            isUser
              ? 'bg-[#2563EB] text-white rounded-tr-sm'
              : 'bg-white text-[#374151] border border-[#ECEDF3] rounded-tl-sm shadow-sm'
          }`}
        >
          <p className="whitespace-pre-line">{msg.content}</p>
        </div>

        {/* Apply / Discard workflow */}
        {!isUser && msg.pendingApproval && msg.changes && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3 space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#1D4ED8]">
              <Info size={11} />
              AI suggested changes ready to apply
            </div>

            {/* Visual Diff Summary */}
            {renderDiffDetails(msg.changes)}

            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={() => onApply(index, msg.changes!)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-[10px] font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm"
              >
                <Check size={10} /> Apply Changes
              </button>
              <button
                onClick={() => onDiscard(index)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#DBEAFE] text-[#374151] rounded-lg text-[10px] font-semibold hover:bg-[#F9FAFB] transition-colors"
              >
                <X size={10} /> Discard
              </button>
            </div>
          </div>
        )}

        {/* Suggested follow-up prompts */}
        {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.suggestedPrompts.map((text, pIdx) => (
              <button
                key={pIdx}
                onClick={() => onQuickSend(text)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E5E7EB] hover:border-[#2563EB] text-[#4B5563] hover:text-[#2563EB] rounded-full text-[10px] font-medium transition-all"
              >
                {text} <ChevronRight size={9} />
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="h-7 w-7 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 text-[#2563EB] text-[10px] font-bold">
          U
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function AIChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onApplyChanges,
  onDiscardChanges,
  isLoading,
  profileName: _profileName,
  mode,
  onModeChange,
}: AIChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentMode = MODES.find((m) => m.id === mode) || MODES[0];

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleQuickAction = (text: string) => {
    onSendMessage(text);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (subtle) */}
      <div
        className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Panel — Solid conversational surface */}
      <div className="fixed bottom-0 right-0 top-[56px] z-50 w-[400px] flex flex-col bg-slate-100 border-l border-slate-200 shadow-2xl animate-panel-slide-in">

        {/* ── Panel Header (Rich Purple Anchor) ───────────────── */}
        <div className="shrink-0 px-4 pt-4 pb-0 border-b border-purple-950 bg-[#2E1065] text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 rounded-xl bg-[#1E1035] border border-white/20 flex items-center justify-center p-1.5 shadow-sm">
                <img src="/Chatbot_logo.png" alt="AI" className="h-full w-full object-contain" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10B981] border-2 border-[#2E1065]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">SmartCV AI</h3>
                <p className="text-[10px] text-purple-200 font-bold">Career Assistant · Active</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <X size={14} />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex items-center bg-[#1E1035] rounded-full p-1 gap-1 mb-3 border border-white/10">
            {MODES.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => onModeChange(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                  mode === id
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Mode description */}
          <div className="mx-0 mb-3 px-3 py-1.5 rounded-full bg-purple-900/50 border border-purple-400/30 text-[10px] font-bold text-purple-200 flex items-center gap-1.5 shadow-xs">
            <Lightbulb size={11} className="text-purple-300" />
            {currentMode.description}
          </div>
        </div>

        {/* ── Messages ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-slate-50 custom-scrollbar">

          {/* Quick action pills (only when no messages or just greeting) */}
          {messages.length <= 1 && (
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Quick actions</p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS[mode].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="text-left px-3 py-2.5 bg-white border border-slate-200 hover:border-[#7C3AED] rounded-xl text-[11px] font-bold text-[#0F172A] hover:text-[#7C3AED] transition-all group shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <ChevronRight size={10} className="text-slate-400 group-hover:text-[#7C3AED] shrink-0" />
                      {action}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message history */}
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              msg={msg}
              index={index}
              onApply={onApplyChanges}
              onDiscard={onDiscardChanges}
              onQuickSend={handleQuickAction}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && <TypingDots />}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Footer input ──────────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-200 bg-slate-100 px-4 pt-4 pb-5 space-y-3">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 bg-white border border-slate-300 focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#7C3AED]/20 rounded-2xl p-3.5 transition-all shadow-sm"
          >
            <textarea
              ref={inputRef as any}
              rows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={currentMode.placeholder}
              className="w-full text-[13px] bg-transparent text-[#0F172A] placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed custom-scrollbar min-h-[64px] max-h-40"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-500 font-medium">
                Enter to send · Shift+Enter for new line
              </p>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={`h-10 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 font-bold text-[13px] ${
                  mode === 'edit'
                    ? 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                    : mode === 'suggest'
                    ? 'bg-[#8B5CF6] hover:bg-[#7C3AED]'
                    : 'bg-[#F59E0B] hover:bg-[#D97706]'
                } text-white disabled:opacity-40 disabled:pointer-events-none shadow-md hover:shadow-lg active:scale-95`}
              >
                {isLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send size={13} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
