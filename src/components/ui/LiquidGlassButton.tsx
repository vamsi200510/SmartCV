'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';

export type LiquidGlassVariant = 'circle' | 'pill' | 'square' | 'toolbar';
export type LiquidGlassSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LiquidGlassTheme =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'emerald'
  | 'purple'
  | 'amber'
  | 'rose'
  | 'danger'
  | 'ghost';

export interface LiquidGlassButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  variant?: LiquidGlassVariant;
  size?: LiquidGlassSize;
  theme?: LiquidGlassTheme;
  active?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  tooltip?: string;
}

export const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  (
    {
      variant = 'pill',
      size = 'md',
      theme = 'neutral',
      active = false,
      loading = false,
      children,
      icon,
      tooltip,
      className = '',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    // ── Variant Sizing ──────────────────────────────────────────
    const getSizing = () => {
      if (variant === 'circle') {
        switch (size) {
          case 'xs': return 'w-7 h-7 min-w-[28px] rounded-full p-0';
          case 'sm': return 'w-8 h-8 min-w-[32px] rounded-full p-0';
          case 'md': return 'w-9 h-9 min-w-[36px] rounded-full p-0';
          case 'lg': return 'w-11 h-11 min-w-[44px] rounded-full p-0';
          case 'xl': return 'w-14 h-14 min-w-[56px] rounded-full p-0';
        }
      }
      if (variant === 'square') {
        switch (size) {
          case 'xs': return 'w-7 h-7 min-w-[28px] rounded-lg p-0';
          case 'sm': return 'w-8 h-8 min-w-[32px] rounded-xl p-0';
          case 'md': return 'w-9 h-9 min-w-[36px] rounded-xl p-0';
          case 'lg': return 'w-11 h-11 min-w-[44px] rounded-2xl p-0';
          case 'xl': return 'w-14 h-14 min-w-[56px] rounded-2xl p-0';
        }
      }
      // Pill or toolbar
      switch (size) {
        case 'xs': return 'h-7 px-2.5 text-[11px] rounded-full gap-1';
        case 'sm': return 'h-8 px-3.5 text-xs font-semibold rounded-full gap-1.5';
        case 'md': return 'h-9 px-4 text-xs font-semibold rounded-full gap-2';
        case 'lg': return 'h-11 px-5 text-sm font-semibold rounded-full gap-2.5';
        case 'xl': return 'h-14 px-6 text-base font-bold rounded-full gap-3';
      }
    };

    // ── Color Theme Adjustments ──────────────────────────────────
    const getThemeClass = () => {
      if (active) {
        return 'liquid-glass-active text-[#C2600E] font-bold';
      }
      switch (theme) {
        case 'primary':
          return 'text-[#C2600E] hover:text-[#9C4A08] bg-white/45 border-white/65 shadow-xs font-semibold';
        case 'secondary':
          return 'text-slate-600 hover:text-[#241C12] bg-white/40 border-white/55';
        case 'emerald':
          return 'text-[#10B981] hover:text-[#059669] bg-emerald-50/70 border-emerald-200/60';
        case 'purple':
          return 'text-[#C2600E] hover:text-[#9C4A08] bg-purple-50/70 border-purple-200/60';
        case 'amber':
          return 'text-[#F59E0B] hover:text-[#D97706] bg-amber-50/70 border-amber-200/60';
        case 'rose':
        case 'danger':
          return 'text-[#EF4444] hover:text-[#DC2626] bg-rose-50/70 border-rose-200/60';
        case 'ghost':
          return 'text-slate-500 hover:text-[#241C12] bg-transparent border-transparent hover:bg-white/30 hover:border-white/40 shadow-none';
        default:
          return 'text-[#241C12] hover:text-[#C2600E] bg-white/40 border-white/55';
      }
    };

    const variantClass = variant === 'circle'
      ? 'liquid-glass-circle'
      : variant === 'square'
      ? 'liquid-glass-square'
      : 'liquid-glass-pill';

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? {} : { y: -1 }}
        whileTap={disabled || loading ? {} : { scale: 0.985 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        disabled={disabled || loading}
        onClick={onClick}
        title={tooltip || props.title}
        aria-label={tooltip || props['aria-label']}
        className={`
          liquid-glass-interactive
          ${variantClass}
          ${getSizing()}
          ${getThemeClass()}
          ${disabled ? 'opacity-40 pointer-events-none' : ''}
          ${className}
        `}
        {...(props as MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {/* Optical Specular & Chromatic Dispersion Overlays */}
        <span className="liquid-glass-specular" aria-hidden="true" />
        <span className="liquid-glass-refraction" aria-hidden="true" />

        {/* Content with embedded icon drop-shadow */}
        <span className="relative z-10 flex items-center justify-center gap-1.5 leading-none liquid-glass-content">
          {loading ? (
            <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : icon ? (
            <span className="liquid-glass-icon-wrapper shrink-0 flex items-center justify-center">{icon}</span>
          ) : null}
          {children}
        </span>
      </motion.button>
    );
  }
);

LiquidGlassButton.displayName = 'LiquidGlassButton';

// ── Reusable GlassIconButton ──────────────────────────────────
export interface GlassIconButtonProps extends LiquidGlassButtonProps {
  icon: React.ReactNode;
}

export const GlassIconButton = React.forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  ({ variant = 'circle', size = 'md', className = '', ...props }, ref) => {
    return (
      <LiquidGlassButton
        ref={ref}
        variant={variant}
        size={size}
        className={`shrink-0 ${className}`}
        {...props}
      />
    );
  }
);

GlassIconButton.displayName = 'GlassIconButton';
