'use client';

import React, { useCallback } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  Type, Palette, Layout, Eye, ArrowUpDown, FileType,
  GripVertical, ArrowUp, ArrowDown, Check, LayoutTemplate,
} from 'lucide-react';
import { CollapsibleGroup, ToggleSwitch, labelClass, inputClass } from './FormPrimitives';

// ── Types ─────────────────────────────────────────────────────────
interface SectionTypographyStyle {
  fontSize?: string;
  fontWeight?: string;
}

interface Customization {
  fontFamily?: string;
  fontSize?: string;
  density?: string;
  primaryColor?: string;
  visibleSections?: string[];
  sectionOrder?: string[];
  sectionTypography?: Record<string, SectionTypographyStyle>;
}

interface DesignWorkspaceProps {
  customization: Customization;
  onChange: (updated: Customization) => void;
  onChangeTemplate?: () => void;
  resumeId?: string;
}

// ── Constants ─────────────────────────────────────────────────────
const FONTS = [
  { value: 'Inter', label: 'Inter', style: 'Inter, sans-serif', desc: 'Clean Sans' },
  { value: 'DM Sans', label: 'DM Sans', style: "'DM Sans', sans-serif", desc: 'Modern UI' },
  { value: 'Poppins', label: 'Poppins', style: 'Poppins, sans-serif', desc: 'Geometric' },
  { value: 'Manrope', label: 'Manrope', style: 'Manrope, sans-serif', desc: 'Grotesque' },
  { value: 'Source Sans 3', label: 'Source Sans 3', style: "'Source Sans 3', sans-serif", desc: 'Classic' },
  { value: 'IBM Plex Sans', label: 'IBM Plex Sans', style: "'IBM Plex Sans', sans-serif", desc: 'Corporate' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta', style: "'Plus Jakarta Sans', sans-serif", desc: 'Elegant' },
  { value: 'Lato', label: 'Lato', style: 'Lato, sans-serif', desc: 'Professional' },
];

const FONT_SIZES = [
  { value: 'small', label: 'Small', desc: '10.5pt' },
  { value: 'medium', label: 'Medium', desc: '11.5pt' },
  { value: 'large', label: 'Large', desc: '12.5pt' },
  { value: 'extraLarge', label: 'XL', desc: '13.5pt' },
];

const DENSITIES = [
  { value: 'compact', label: 'Compact', icon: '▪▪▪' },
  { value: 'balanced', label: 'Balanced', icon: '▪ ▪ ▪' },
  { value: 'spacious', label: 'Spacious', icon: '▪  ▪  ▪' },
];

const COLORS = [
  { name: 'Slate', value: '#0f172a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Orange', value: '#ea580c' },
];

const SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  education: 'Education',
  certifications: 'Certifications',
  achievements: 'Achievements',
  additionalInfo: 'Additional Info',
};

const ALL_SECTIONS = Object.keys(SECTION_LABELS);

const DEFAULT_CUSTOMIZATION: Required<Omit<Customization, 'sectionTypography'>> & { sectionTypography: Record<string, SectionTypographyStyle> } = {
  fontFamily: 'Inter',
  fontSize: 'medium',
  density: 'balanced',
  primaryColor: '#0f172a',
  visibleSections: [...ALL_SECTIONS],
  sectionOrder: [...ALL_SECTIONS],
  sectionTypography: {},
};

// ── Draggable Section Row ─────────────────────────────────────────
function DraggableSectionRow({
  sectionId,
  index,
  total,
  onMoveUp,
  onMoveDown,
}: {
  sectionId: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={sectionId}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 liquid-glass-card-secondary rounded-xl px-3 py-2.5 cursor-default select-none shadow-xs"
      style={{ touchAction: 'none' }}
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50 }}
    >
      <button
        onPointerDown={(e) => controls.start(e)}
        className="text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-grab active:cursor-grabbing touch-none p-0.5 shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <span className="flex-1 text-xs font-bold text-[#0F172A]">
        {SECTION_LABELS[sectionId] ?? sectionId}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-white/60 disabled:opacity-25 transition-colors cursor-pointer"
          aria-label="Move section up"
        >
          <ArrowUp size={12} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-white/60 disabled:opacity-25 transition-colors cursor-pointer"
          aria-label="Move section down"
        >
          <ArrowDown size={12} />
        </button>
      </div>
    </Reorder.Item>
  );
}

// ── Main DesignWorkspace ──────────────────────────────────────────
export default function DesignWorkspace({
  customization,
  onChange,
  onChangeTemplate,
  resumeId,
}: DesignWorkspaceProps) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...customization, sectionTypography: customization?.sectionTypography || {} };

  const update = useCallback((patch: Partial<Customization>) => {
    onChange({ ...DEFAULT_CUSTOMIZATION, ...customization, ...patch });
  }, [customization, onChange]);

  // Deep-merge a single section's typography without overwriting others
  const updateSectionTypography = useCallback((sectionId: string, styles: Partial<SectionTypographyStyle>) => {
    const existing = customization?.sectionTypography || {};
    const updated: Record<string, SectionTypographyStyle> = {
      ...existing,
      [sectionId]: { ...(existing[sectionId] || {}), ...styles }
    };
    // Remove empty section entries
    if (!updated[sectionId].fontSize && !updated[sectionId].fontWeight) {
      delete updated[sectionId];
    }
    onChange({ ...DEFAULT_CUSTOMIZATION, ...customization, sectionTypography: updated });
  }, [customization, onChange]);

  // Section order keyboard move
  const moveSectionByIndex = (index: number, dir: 'up' | 'down') => {
    const order = [...c.sectionOrder];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    update({ sectionOrder: order });
  };

  return (
    <div className="h-full flex flex-col liquid-glass-card-primary rounded-2xl shadow-md overflow-hidden text-[#0F172A]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/60 bg-white/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
            <Palette size={15} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">Design Workspace</h3>
            <p className="text-[11px] text-[#64748B]">All changes update the preview instantly</p>
          </div>
        </div>
      </div>

      {/* Scrollable settings */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">

        {/* ── Typography ─────────────────────────────────────── */}
        <CollapsibleGroup title="Typography" icon={<Type size={14} />} defaultOpen={true}>
          {/* Font family */}
          <div className="space-y-2">
            <label className={labelClass}>Font Family</label>
            <div className="grid grid-cols-2 gap-1.5">
              {FONTS.map((font) => {
                const isSelected = c.fontFamily === font.value;
                return (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => update({ fontFamily: font.value })}
                    className={`flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'border-[#ECEDF3] bg-[#F9FAFB] hover:border-[#DDDEE8] hover:bg-white text-[#374151]'
                    }`}
                    style={{ fontFamily: font.style }}
                  >
                    <span className="text-xs font-semibold leading-tight">{font.label}</span>
                    <span className="text-[10px] opacity-60 mt-0.5">{font.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font size */}
          <div className="space-y-2">
            <label className={labelClass}>Font Size</label>
            <div className="grid grid-cols-4 gap-1">
              {FONT_SIZES.map((fs) => {
                const isSelected = c.fontSize === fs.value;
                return (
                  <button
                    key={fs.value}
                    type="button"
                    onClick={() => update({ fontSize: fs.value })}
                    className={`flex flex-col items-center py-2 rounded-xl border text-center transition-all duration-150 ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                        : 'border-[#ECEDF3] bg-[#F9FAFB] hover:border-[#DDDEE8] hover:bg-white text-[#374151]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{fs.label}</span>
                    <span className="text-[9px] opacity-50 mt-0.5">{fs.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CollapsibleGroup>

        {/* ── Colors ─────────────────────────────────────────── */}
        <CollapsibleGroup title="Theme Color" icon={<Palette size={14} />} defaultOpen={true}>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => {
              const isSelected = c.primaryColor === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => update({ primaryColor: color.value })}
                  title={color.name}
                  className={`h-8 w-8 rounded-full transition-all duration-150 flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-offset-2 ring-[#2563EB] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {isSelected && <Check size={12} className="text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
          {/* Custom hex input */}
          <div className="flex items-center gap-2 mt-1">
            <div
              className="h-8 w-8 rounded-lg border-2 border-[#ECEDF3] shrink-0"
              style={{ backgroundColor: c.primaryColor }}
            />
            <input
              type="text"
              value={c.primaryColor}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) update({ primaryColor: v });
              }}
              maxLength={7}
              className={`${inputClass} font-mono text-xs flex-1`}
              placeholder="#000000"
            />
          </div>
        </CollapsibleGroup>

        {/* ── Layout & Spacing ────────────────────────────────── */}
        <CollapsibleGroup title="Layout & Spacing" icon={<Layout size={14} />} defaultOpen={false}>
          <label className={labelClass}>Resume Density</label>
          <div className="grid grid-cols-3 gap-1.5">
            {DENSITIES.map((d) => {
              const isSelected = c.density === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => update({ density: d.value })}
                  className={`flex flex-col items-center py-3 rounded-xl border text-center transition-all duration-150 ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                      : 'border-[#ECEDF3] bg-[#F9FAFB] hover:border-[#DDDEE8] hover:bg-white text-[#374151]'
                  }`}
                >
                  <span className="text-[11px] font-mono mb-1 opacity-60">{d.icon}</span>
                  <span className="text-xs font-semibold">{d.label}</span>
                </button>
              );
            })}
          </div>
        </CollapsibleGroup>

        {/* ── Section Visibility ──────────────────────────────── */}
        <CollapsibleGroup title="Section Visibility" icon={<Eye size={14} />} defaultOpen={false}>
          <div className="space-y-2">
            {ALL_SECTIONS.map((sectionId) => {
              const isVisible = c.visibleSections.includes(sectionId);
              return (
                <ToggleSwitch
                  key={sectionId}
                  id={`vis-${sectionId}`}
                  label={SECTION_LABELS[sectionId]}
                  checked={isVisible}
                  onChange={(v) => {
                    const next = v
                      ? [...c.visibleSections, sectionId]
                      : c.visibleSections.filter((s) => s !== sectionId);
                    update({ visibleSections: next });
                  }}
                />
              );
            })}
          </div>
        </CollapsibleGroup>

        {/* ── Section Typography ──────────────────── */}
        <CollapsibleGroup title="Section Typography" icon={<Type size={14} />} defaultOpen={false}>
          <p className="text-[11px] text-[#9CA3AF] -mt-1 mb-2">
            Override font size or weight for individual sections. Tip: use AI for more precise control.
          </p>
          <div className="space-y-3">
            {ALL_SECTIONS.map((sectionId) => {
              const st = c.sectionTypography[sectionId] || {};
              return (
                <div key={sectionId} className="space-y-1.5">
                  <label className={labelClass}>{SECTION_LABELS[sectionId]}</label>
                  <div className="flex gap-2">
                    {/* Font Size override */}
                    <select
                      value={st.fontSize || ''}
                      onChange={(e) => updateSectionTypography(sectionId, { fontSize: e.target.value || undefined })}
                      className="flex-1 h-9 px-2.5 rounded-xl border border-[#ECEDF3] bg-white text-xs text-[#374151] focus:border-[#2563EB] focus:outline-none transition"
                    >
                      <option value="">Global size</option>
                      <option value="small">Small (10.5pt)</option>
                      <option value="medium">Medium (11.5pt)</option>
                      <option value="large">Large (12.5pt)</option>
                      <option value="extraLarge">XL (13.5pt)</option>
                    </select>
                    {/* Font Weight override */}
                    <select
                      value={st.fontWeight || ''}
                      onChange={(e) => updateSectionTypography(sectionId, { fontWeight: e.target.value || undefined })}
                      className="flex-1 h-9 px-2.5 rounded-xl border border-[#ECEDF3] bg-white text-xs text-[#374151] focus:border-[#2563EB] focus:outline-none transition"
                    >
                      <option value="">Global weight</option>
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleGroup>

        {/* ── Section Ordering ────────────────────── */}
        <CollapsibleGroup title="Section Order" icon={<ArrowUpDown size={14} />} defaultOpen={true}>
          <p className="text-[11px] text-[#9CA3AF] -mt-1 mb-1">Drag to reorder or use the arrows.</p>
          <Reorder.Group
            axis="y"
            values={c.sectionOrder}
            onReorder={(newOrder) => update({ sectionOrder: newOrder })}
            className="space-y-1.5"
          >
            {c.sectionOrder.map((sectionId, index) => (
              <DraggableSectionRow
                key={sectionId}
                sectionId={sectionId}
                index={index}
                total={c.sectionOrder.length}
                onMoveUp={() => moveSectionByIndex(index, 'up')}
                onMoveDown={() => moveSectionByIndex(index, 'down')}
              />
            ))}
          </Reorder.Group>
        </CollapsibleGroup>

        {/* ── Paper & Template ────────────────────────────────── */}
        <CollapsibleGroup title="Paper & Template" icon={<FileType size={14} />} defaultOpen={true}>
          <div className="space-y-3">
            <p className="text-xs text-[#6B7280] leading-relaxed">
              The active template controls the full layout structure, column system, and typography styles.
            </p>
            <button
              onClick={() => {
                if (onChangeTemplate) {
                  onChangeTemplate();
                } else if (resumeId) {
                  window.location.href = `/dashboard?tab=templates&resumeId=${resumeId}`;
                } else {
                  window.location.href = '/dashboard?tab=templates';
                }
              }}
              className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <LayoutTemplate size={15} />
              <span>Change Template</span>
            </button>
          </div>
        </CollapsibleGroup>

      </div>
    </div>
  );
}
