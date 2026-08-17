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
    description: 'Full document audit with a detailed ATS report',
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
      <div className="h-7 w-7 rounded-xl border border-[#C7E1F0] bg-white flex items-center justify-center shrink-0 p-1.5 shadow-xs">
        <img src="/Chatbot_logo.png" alt="AI" className="h-full w-full object-contain" />
      </div>
      <div className="bg-white border border-[#E0D5C5] rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#1E6FA8] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

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
    <div className="bg-white/95 border border-[#C7E1F0] rounded-xl p-2.5 space-y-1.5 my-1 text-[10px] shadow-xs">
      <p className="font-bold text-[#1E6FA8] uppercase tracking-wider text-[9px]">Proposed Modifications</p>
      <div className="space-y-1">
        {diffs.map((d, i) => (
          <div key={i} className="flex items-start justify-between gap-2 border-b border-slate-100 last:border-0 pb-1 last:pb-0">
            <span className="font-semibold text-slate-500">{d.label}:</span>
            <span className="font-bold text-[#241C12] text-right truncate max-w-[200px]">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────
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
    <div className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="h-7 w-7 rounded-xl border border-[#C7E1F0] bg-white flex items-center justify-center shrink-0 p-1.5 shadow-xs">
          <img src="/Chatbot_logo.png" alt="AI" className="h-full w-full object-contain" />
        </div>
      )}

      <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-[12.5px] leading-relaxed shadow-xs ${
            isUser
              ? 'bg-[#C2600E] text-white rounded-tr-sm font-medium'
              : 'bg-white text-[#241C12] border border-[#E0D5C5] rounded-tl-sm font-normal'
          }`}
        >
          <div className="whitespace-pre-wrap">{msg.content}</div>
        </div>

        {/* Change approval card */}
        {!isUser && msg.pendingApproval && msg.changes && (
          <div className="bg-[#F8FAFC] border border-[#C7E1F0] rounded-2xl p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E6FA8]">
              <Info size={13} />
              <span>AI suggested updates ready to apply:</span>
            </div>

            {/* Visual Diff Summary */}
            {renderDiffDetails(msg.changes)}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onApply(index, msg.changes!)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1E6FA8] text-white rounded-full text-[11px] font-bold hover:bg-[#14587E] transition-all shadow-xs cursor-pointer"
              >
                <Check size={12} /> Apply Changes
              </button>
              <button
                onClick={() => onDiscard(index)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E0D5C5] text-[#5C4E3E] rounded-full text-[11px] font-bold hover:bg-[#EDE2D0] transition-colors cursor-pointer"
              >
                <X size={12} /> Discard
              </button>
            </div>
          </div>
        )}

        {/* Suggested follow-up prompts */}
        {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {msg.suggestedPrompts.map((text, pIdx) => (
              <button
                key={pIdx}
                onClick={() => onQuickSend(text)}
                className="flex items-center gap-1 px-3 py-1 bg-white border border-[#E0D5C5] hover:border-[#1E6FA8] text-[#5C4E3E] hover:text-[#1E6FA8] rounded-full text-[10.5px] font-semibold transition-all shadow-xs cursor-pointer"
              >
                {text} <ChevronRight size={10} />
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="h-7 w-7 rounded-xl bg-[#FCE3C7] border border-[#F4B77E] flex items-center justify-center shrink-0 text-[#C2600E] text-[11px] font-bold shadow-xs">
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
    /* Floating Glass Side Drawer — ZERO full-page dim/blur overlay so live A4 canvas stays 100% crisp */
    <div
      className="fixed bottom-4 right-4 top-[64px] z-50 w-[410px] max-w-[calc(100vw-32px)] flex flex-col rounded-[26px] bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl overflow-hidden animate-panel-slide-in pointer-events-auto"
      style={{
        boxShadow: '0 16px 40px rgba(11, 84, 151, 0.18), 0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* ── Panel Header (Deep Ocean Blue with Specular Highlight) ───── */}
      <div className="shrink-0 px-4.5 pt-4 pb-3 bg-gradient-to-r from-[#1E6FA8] to-[#0B5497] text-white relative">
        {/* Top Rim Specular */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/30" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center p-1.5 shadow-xs">
              <img src="/Chatbot_logo.png" alt="AI" className="h-full w-full object-contain" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] border-2 border-[#1E6FA8]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">SmartCV AI</h3>
              <p className="text-[10px] text-sky-200 font-bold">Live Career Co-Pilot · Active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Close Assistant (Canvas stays active)"
          >
            <X size={14} />
          </button>
        </div>

        {/* Mode Tabs (Orange Active Pill + Glass Inactive) */}
        <div className="flex items-center bg-black/20 rounded-full p-1 gap-1 mb-2.5 border border-white/15">
          {MODES.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                mode === id
                  ? 'bg-[#C2600E] text-white shadow-sm'
                  : 'text-sky-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Mode description */}
        <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold text-sky-100 flex items-center gap-1.5 shadow-xs">
          <Lightbulb size={11} className="text-[#FDE68A]" />
          <span>{currentMode.description}</span>
        </div>
      </div>

      {/* ── Messages Stream ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-[#F9F7F4] custom-scrollbar">
        {/* Quick action pills (only when no messages or just greeting) */}
        {messages.length <= 1 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[#5C4E3E] uppercase tracking-wide">Quick suggestions</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS[mode].map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="text-left px-3.5 py-2 bg-white border border-[#E0D5C5] hover:border-[#C2600E] hover:text-[#C2600E] rounded-full text-[11px] font-bold text-[#241C12] transition-all group shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ChevronRight size={10} className="text-[#9A8C7E] group-hover:text-[#C2600E] shrink-0" />
                    <span className="truncate">{action}</span>
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

      {/* ── Footer Input Area ──────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[#E8DDD0] bg-[#F9F7F4] p-3.5 space-y-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 bg-white border border-[#E0D5C5] focus-within:border-[#1E6FA8] focus-within:ring-2 focus-within:ring-[#1E6FA8]/20 rounded-2xl p-3 transition-all shadow-xs"
        >
          <textarea
            ref={inputRef}
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={currentMode.placeholder}
            className="w-full text-[12.5px] bg-transparent text-[#241C12] placeholder:text-[#9A8C7E] focus:outline-none resize-none leading-relaxed custom-scrollbar min-h-[50px] max-h-32"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-[#9A8C7E] font-medium">
              Enter to send · Shift+Enter for newline
            </p>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="h-8 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all shrink-0 font-bold text-xs bg-[#C2600E] hover:bg-[#9C4A08] text-white disabled:opacity-40 disabled:pointer-events-none shadow-sm hover:shadow active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send size={11} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
