'use client';

import React, { useRef, useState } from 'react';
import {
  Plus, Trash2, ArrowUp, ArrowDown, AlertCircle, Check, ChevronDown
} from 'lucide-react';

// ── Shared field style helpers ────────────────────────────────────
export const inputClass = `w-full h-9 px-3 rounded-[10px] border border-[#E2E8F0] text-[13px] text-[#111827] bg-white
  focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10
  transition-all duration-150 placeholder:text-[#9CA3AF]`;

export const textareaClass = `w-full px-3 py-2.5 rounded-[10px] border border-[#E2E8F0] text-[13px] text-[#111827] bg-white
  focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10
  transition-all duration-150 resize-none leading-relaxed placeholder:text-[#9CA3AF]
  min-h-[68px]`;

export const labelClass = `block text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-1`;

export const sectionHeadingClass = `text-[13px] font-semibold text-[#111827]`;

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
    <span className="flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-600">
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
    <div className="group bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition-all duration-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#F9FAFB] border-b border-[#ECEDF3]">
        <div className="flex items-center gap-2">
          <div className="cursor-grab text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111827] leading-tight">{title}</p>
            {subtitle && <p className="text-[10px] text-[#9CA3AF] leading-tight">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 text-[#6B7280] hover:bg-[#E5E7EB] rounded-md disabled:opacity-25 transition-colors"
            title="Move up"
          >
            <ArrowUp size={12} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 text-[#6B7280] hover:bg-[#E5E7EB] rounded-md disabled:opacity-25 transition-colors"
            title="Move down"
          >
            <ArrowDown size={12} />
          </button>
          <div className="w-px h-3.5 bg-[#E5E7EB] mx-0.5" />
          <button
            onClick={onDelete}
            className="p-1 text-[#EF4444] hover:bg-[#FEE2E2] rounded-md transition-colors"
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
      className="w-full py-2.5 border-2 border-dashed border-[#D1D5DB] rounded-[10px] flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all duration-200"
    >
      <Plus size={14} />
      <span>{label}</span>
    </button>
  );
}

// ── Empty section placeholder ─────────────────────────────────────
export function EmptySectionState({ label }: { label: string }) {
  return (
    <div className="text-center py-7 bg-[#F9FAFB] rounded-[10px] border border-dashed border-[#DDDEE8]">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#ECEDF3] mx-auto mb-2.5">
        <Plus size={15} className="text-[#9CA3AF]" />
      </div>
      <p className="text-[13px] font-medium text-[#374151]">No {label} added yet</p>
      <p className="text-[11px] text-[#9CA3AF] mt-0.5">Click the button below to add one.</p>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────
export function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h3 className={sectionHeadingClass}>{title}</h3>
      <p className="text-[12px] text-[#6B7280] mt-0.5 leading-relaxed">{description}</p>
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
        <span className="text-sm font-medium text-[#374151] group-hover:text-[#111827] transition-colors">
          {label}
        </span>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
          checked ? 'bg-[#2563EB]' : 'bg-[#D1D5DB]'
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
    <div className="bg-white rounded-xl border border-[#ECEDF3] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-[#F9FAFB] transition-colors group"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-[#6B7280] group-hover:text-[#2563EB] transition-colors">{icon}</span>
          )}
          <span className="text-[13px] font-semibold text-[#111827]">{title}</span>
        </div>
        <ChevronDown
          size={13}
          className={`text-[#9CA3AF] transition-transform duration-200 ${
            open ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </button>
      {open && (
        <div className="px-3.5 pb-3 pt-1 space-y-2.5 border-t border-[#F3F4F6]">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Completion badge ──────────────────────────────────────────────
export function CompletionBadge({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${done ? 'text-emerald-600' : 'text-[#9CA3AF]'}`}>
      {done ? (
        <Check size={12} className="text-emerald-500" />
      ) : (
        <span className="h-3.5 w-3.5 rounded-full border border-[#D1D5DB] shrink-0" />
      )}
      <span className={done ? 'line-through' : ''}>{label}</span>
    </div>
  );
}
