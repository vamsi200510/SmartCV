'use client';

import React, { useRef, useState } from 'react';
import {
  Plus, Trash2, ArrowUp, ArrowDown, AlertCircle, Check, ChevronDown
} from 'lucide-react';

// ── Shared field style helpers ────────────────────────────────────
export const inputClass = `liquid-glass-input w-full h-9 px-3 text-[13px] text-[#0F172A]
  placeholder:text-[#94A3B8] font-medium`;

export const textareaClass = `liquid-glass-input w-full px-3 py-2 text-[13px] text-[#0F172A]
  resize-none leading-relaxed placeholder:text-[#94A3B8] font-medium min-h-[68px]`;

export const labelClass = `block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1`;

export const sectionHeadingClass = `text-[13px] font-bold text-[#0F172A]`;

// Auto-resizing textarea hook
export function useAutoResize() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const handleResize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  };
  return { ref, onInput: handleResize };
}

// ── Low-confidence warning ────────────────────────────────────────
export function LowConfidenceWarning({ fieldName, lowFields }: { fieldName: string; lowFields?: string[] }) {
  if (!lowFields?.includes(fieldName)) return null;
  return (
    <span className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-amber-600">
      <AlertCircle size={11} />
      Auto-extracted — please verify this field.
    </span>
  );
}

// ── Section card wrapper ──────────────────────────────────────────
export function SectionCard({
  children,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="group liquid-glass-card-primary rounded-xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/60 bg-white/40">
        <div className="flex items-center gap-2">
          <div className="cursor-grab text-[#94A3B8] hover:text-[#0F172A] transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#0F172A] leading-tight">{title}</p>
            {subtitle && <p className="text-[10px] text-[#64748B] font-medium leading-tight">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 text-[#64748B] hover:bg-white/60 rounded-md disabled:opacity-25 transition-colors cursor-pointer"
            title="Move up"
          >
            <ArrowUp size={12} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 text-[#64748B] hover:bg-white/60 rounded-md disabled:opacity-25 transition-colors cursor-pointer"
            title="Move down"
          >
            <ArrowDown size={12} />
          </button>
          <div className="w-px h-3.5 bg-white/60 mx-0.5" />
          <button
            onClick={onDelete}
            className="p-1 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            title="Remove"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {/* Card body */}
      <div className="p-4">{children}</div>
    </div>
  );
}

// ── Add item button ───────────────────────────────────────────────
export function AddItemButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 rounded-full liquid-glass-pill border-dashed border-[#2563EB]/40 flex items-center justify-center gap-1.5 text-xs font-bold text-[#2563EB] hover:bg-blue-500/10 transition-all duration-200 cursor-pointer shadow-xs"
    >
      <Plus size={14} />
      <span>{label}</span>
    </button>
  );
}

// ── Empty section placeholder ─────────────────────────────────────
export function EmptySectionState({ label }: { label: string }) {
  return (
    <div className="text-center py-7 liquid-glass-card-secondary rounded-2xl">
      <div className="w-8 h-8 liquid-glass-circle flex items-center justify-center shadow-xs mx-auto mb-2 text-[#2563EB]">
        <Plus size={15} />
      </div>
      <p className="text-xs font-bold text-[#0F172A]">No {label} added yet</p>
      <p className="text-[11px] text-[#64748B] mt-0.5 font-medium">Click the button below to add one.</p>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────
export function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h3 className={sectionHeadingClass}>{title}</h3>
      <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

// ── Toggle Switch ────────────────────────────────────────────────
export function ToggleSwitch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-3 cursor-pointer group select-none"
    >
      {label && (
        <span className="text-xs font-bold text-[#334155] group-hover:text-[#0F172A] transition-colors">
          {label}
        </span>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none ${
          checked ? 'bg-[#2563EB] shadow-xs' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-all duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

// ── Collapsible Group ─────────────────────────────────────────────
export function CollapsibleGroup({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="liquid-glass-card-primary rounded-xl overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-white/40 transition-colors group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-[#64748B] group-hover:text-[#2563EB] transition-colors">{icon}</span>
          )}
          <span className="text-xs font-bold text-[#0F172A]">{title}</span>
        </div>
        <ChevronDown
          size={13}
          className={`text-[#94A3B8] transition-transform duration-200 ${
            open ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </button>
      {open && (
        <div className="px-3.5 pb-3 pt-1 space-y-2.5 border-t border-white/60">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Completion badge ──────────────────────────────────────────────
export function CompletionBadge({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-semibold ${done ? 'text-emerald-600' : 'text-[#94A3B8]'}`}>
      {done ? (
        <Check size={12} className="text-emerald-500" />
      ) : (
        <span className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0" />
      )}
      <span className={done ? 'line-through' : ''}>{label}</span>
    </div>
  );
}
