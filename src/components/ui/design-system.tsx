'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// ============================================================
// 1. MOUSE GLOW & ANIMATED SHADER (Preserved for compatibility)
// ============================================================
export function MouseGlow() {
  return null;
}

export function AnimatedShader() {
  return null;
}

// ============================================================
// 2. BUTTON — Apple Liquid Glass Controls
// ============================================================
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'glass' | 'gradient' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, icon, loading, disabled, ...props }, ref) => {
    const base = "liquid-glass-interactive font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none";

    const sizes: Record<ButtonSize, string> = {
      xs: "px-3 py-1 text-[11px] gap-1 rounded-full",
      sm: "px-3.5 py-1.5 text-xs gap-1.5 rounded-full",
      md: "px-5 py-2.5 text-xs font-semibold gap-2 rounded-full",
      lg: "px-6 py-3 text-sm font-semibold gap-2.5 rounded-full",
    };

    const variants: Record<ButtonVariant, string> = {
      primary: "rounded-full text-white bg-[#C2600E] hover:bg-[#7D3804] active:bg-[#5C2B04] shadow-sm border border-[#9C4A08]/30 transition-all duration-200",
      secondary: "rounded-full text-[#172B4D] bg-[#FFFFFF] border border-[#BFD5E8] hover:bg-slate-50 shadow-xs",
      outline: "rounded-full text-[#C2600E] bg-white border border-[#C2600E]/40 hover:bg-[#FCE3C7]/40",
      glass: "liquid-glass-pill text-[#172B4D] bg-white border-white/70 hover:bg-white shadow-xs",
      gradient: "rounded-full text-white bg-[#C2600E] hover:bg-[#7D3804] shadow-sm transition-all duration-200",
      ghost: "text-[#405A73] hover:text-[#172B4D] rounded-full hover:bg-white/40 border border-transparent shadow-none",
      danger: "rounded-full text-white bg-[#A84B55] hover:bg-[#8F3F48] shadow-xs border border-[#8F3F48]/30",
      success: "rounded-full text-white bg-[#21877B] hover:bg-[#1D6E67] shadow-xs border border-[#1D6E67]/30",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? {} : { y: -1 }}
        whileTap={disabled || loading ? {} : { scale: 0.985 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        disabled={disabled || loading}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...(props as MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <span className="liquid-glass-specular" aria-hidden="true" />
        <span className="liquid-glass-refraction" aria-hidden="true" />

        <span className="relative z-10 flex items-center justify-center gap-1.5 leading-none liquid-glass-content">
          {loading ? (
            <svg className="animate-spin h-3.5 w-3.5 text-current shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : icon ? (
            <span className="liquid-glass-icon-wrapper shrink-0">{icon}</span>
          ) : null}
          {children}
        </span>
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

// ============================================================
// 3. CARD — Apple Liquid Glass Layered Surfaces
// ============================================================
export interface CardProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'nested' | 'floating' | 'plain';
  hover?: boolean;
  glow?: boolean;
  padding?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({
  className = '',
  variant = 'primary',
  hover = true,
  padding = false,
  children,
  onClick,
  style,
}: CardProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'liquid-glass-card-secondary';
      case 'nested':
        return 'liquid-glass-card-nested';
      case 'floating':
        return 'liquid-glass-card-floating';
      case 'plain':
        return 'bg-white rounded-2xl border border-[#ECEDF3]';
      case 'primary':
      default:
        return 'liquid-glass-card-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover && onClick ? { y: -2, scale: 1.008, transition: { duration: 0.16 } } : undefined}
      onClick={onClick}
      style={style}
      className={`
        overflow-hidden
        ${getVariantClass()}
        ${hover && onClick ? 'cursor-pointer' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      <span className="liquid-glass-specular" aria-hidden="true" style={{ opacity: 0.4 }} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ============================================================
// 4. BADGE — Translucent Glass Capsule Badges
// ============================================================
export type BadgeVariant = 'primary' | 'blue' | 'secondary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan' | 'amber';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = 'primary', size = 'sm', children, className = '', dot }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    primary: 'bg-blue-500/10 text-blue-700 border-blue-200/60',
    blue: 'bg-blue-500/10 text-blue-700 border-blue-200/60',
    secondary: 'bg-slate-500/10 text-slate-700 border-slate-200/60',
    success: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/60',
    warning: 'bg-amber-500/10 text-amber-700 border-amber-200/60',
    danger: 'bg-red-500/10 text-red-700 border-red-200/60',
    purple: 'bg-purple-500/10 text-purple-700 border-purple-200/60',
    cyan: 'bg-cyan-500/10 text-cyan-700 border-cyan-200/60',
    amber: 'bg-orange-500/10 text-orange-700 border-orange-200/60',
  };

  const dotColors: Record<BadgeVariant, string> = {
    primary: 'bg-blue-500', blue: 'bg-blue-500', secondary: 'bg-slate-400', success: 'bg-emerald-500',
    warning: 'bg-amber-500', danger: 'bg-red-500', purple: 'bg-purple-500',
    cyan: 'bg-cyan-500', amber: 'bg-orange-500'
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border backdrop-blur-md shadow-xs ${sizes[size]} ${styles[variant]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 shadow-xs ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

// ============================================================
// 5. PROGRESS BAR
// ============================================================
export function ProgressBar({ value, max = 100, className = '', color = 'primary' }: {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'gradient' | 'success' | 'warning';
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    primary: 'bg-[#315E9B]',
    gradient: 'bg-[#69468C]',
    success: 'bg-[#177A73]',
    warning: 'bg-[#9A7134]',
  };

  return (
    <div className={`w-full bg-slate-200/60 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-white/60 p-0.5 ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        className={`h-full rounded-full ${colors[color]} shadow-xs`}
      />
    </div>
  );
}

// ============================================================
// 6. SECTION HEADER
// ============================================================
export function SectionHeader({ title, subtitle, action, className = '' }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-6 ${className}`}>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#241C12]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================
// 7. STATS CARD — Liquid Glass Finish
// ============================================================
export function StatsCard({ title, value, subtitle, icon, trend, className = '' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  return (
    <Card padding variant="primary" className={className}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1">{title}</p>
          <p className="text-2xl font-black text-[#241C12] tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-2xl liquid-glass-circle flex items-center justify-center text-[#2563EB] shrink-0">
            {icon}
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>{trend.value}</span>
          )}
          {subtitle && <span className="text-[#64748B] font-medium">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// 8. SKELETON LOADER
// ============================================================
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="liquid-glass-card-primary p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/4 rounded-full" />
          <Skeleton className="h-2.5 w-1/2 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-full" />
        <Skeleton className="h-8 flex-1 rounded-full" />
      </div>
    </div>
  );
}

// ============================================================
// 9. MODAL CONTAINER — Floating Apple Glass Sheet
// ============================================================
export function ModalContainer({ isOpen, onClose, children, size = 'md' }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
            className={`relative z-10 w-full ${sizes[size]} liquid-glass-card-floating p-6`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// 10. CONFIRM DIALOG
// ============================================================
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', loading = false
}: ConfirmDialogProps) {
  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#241C12]">{title}</h3>
          <p className="mt-1 text-xs text-[#64748B] leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2.5 justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}

// ============================================================
// 11. INLINE RENAME INPUT
// ============================================================
export interface InlineRenameProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title?: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  loading?: boolean;
}

export function InlineRenameDialog({
  isOpen, onClose, onConfirm, title = 'Rename',
  label = 'New name', placeholder = 'Enter name...',
  initialValue = '', loading = false
}: InlineRenameProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onConfirm(value.trim());
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-base font-bold text-[#241C12]">{title}</h3>
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">{label}</label>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full h-11 px-3.5 rounded-xl liquid-glass-input text-sm text-[#241C12] placeholder:text-[#94A3B8]"
          />
        </div>
        <div className="flex items-center gap-2.5 justify-end pt-2">
          <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={loading} disabled={!value.trim()}>
            Save
          </Button>
        </div>
      </form>
    </ModalContainer>
  );
}

// ============================================================
// 12. EMPTY STATE — Liquid Glass Container
// ============================================================
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center liquid-glass-card-secondary my-4"
    >
      <div className="w-14 h-14 rounded-2xl liquid-glass-circle flex items-center justify-center text-[#2563EB] mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-[#241C12] mb-1">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-sm mb-5 leading-relaxed">{description}</p>
      {action}
    </motion.div>
  );
}

// ============================================================
// 13. ATS SCORE RING — Liquid Glass Optical Gauge
// ============================================================
export function ATSRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#10B981' : score >= 75 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center liquid-glass-circle shadow-sm" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(203, 213, 225, 0.4)" strokeWidth="4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="font-extrabold" style={{ color, fontSize: size < 70 ? 11 : 14 }}>{score}</span>
        <span className="text-[7px] font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">ATS</span>
      </div>
    </div>
  );
}

// ============================================================
// 14. TOAST SYSTEM — Floating Glass Pill Alerts
// ============================================================
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

export const ToastContext = React.createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: ToastVariant = 'success', duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, variant, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastNotification key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastNotification({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const icons: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.94 }}
      transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl liquid-glass-surface shadow-lg min-w-[260px] max-w-[360px]"
    >
      {icons[item.variant]}
      <span className="text-xs font-semibold text-[#241C12] flex-1 leading-snug">{item.message}</span>
      <button
        onClick={onDismiss}
        className="text-[#94A3B8] hover:text-[#475569] transition-colors cursor-pointer shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}

// ============================================================
// 15. PAGE LOADER
// ============================================================
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="flex gap-1.5 p-3 rounded-full liquid-glass-toolbar">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#64748B]"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-[#64748B]">{message}</span>
    </div>
  );
}

// ============================================================
// 16. INPUT COMPONENT — Translucent Liquid Glass Fields
// ============================================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#475569]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">{icon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-11 px-3.5 rounded-xl liquid-glass-input text-xs font-medium text-[#241C12]
              placeholder:text-[#94A3B8] focus:outline-none transition-all duration-180
              ${error ? '!border-rose-400 !focus:ring-rose-500/20' : ''}
              ${icon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}
        {hint && !error && <p className="text-[11px] text-[#94A3B8]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================
// 17. SPINNER
// ============================================================
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  return (
    <svg className={`animate-spin text-[#2563EB] ${sizes[size]} ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ============================================================
// 18. OTP INPUT — Individual Liquid Glass Capsules
// ============================================================
export function OTPInput({ length = 6, value, onChange }: { length?: number; value: string; onChange: (val: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;
    const char = val[val.length - 1];
    const newArr = value.padEnd(length, ' ').split('');
    newArr[index] = char;
    const newVal = newArr.join('').trim();
    onChange(newVal);
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newArr = value.padEnd(length, ' ').split('');
      if (newArr[index] !== ' ') {
        newArr[index] = ' ';
        onChange(newArr.join('').trim());
      } else if (index > 0) {
        newArr[index - 1] = ' ';
        onChange(newArr.join('').trim());
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      if (pasted.length < length) {
        inputRefs.current[pasted.length]?.focus();
      } else {
        inputRefs.current[length - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 w-full justify-between" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-11 h-13 sm:w-13 sm:h-15 liquid-glass-otp-digit rounded-2xl text-center text-xl sm:text-2xl font-black text-[#241C12] focus:outline-none"
        />
      ))}
    </div>
  );
}

// ============================================================
// 19. MORPHING BUTTON — Liquid Glass Morphing CTA
// ============================================================
export function MorphingButton({ state, idleText, successText, onClick, className = '', type = 'button', disabled }: { 
  state: 'idle' | 'loading' | 'success'; 
  idleText: string; 
  successText: string; 
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={state !== 'idle' || disabled}
      whileHover={state === 'idle' ? { y: -1 } : undefined}
      whileTap={state === 'idle' ? { scale: 0.985 } : undefined}
      className={`relative inline-flex items-center justify-center h-12 px-6 rounded-full font-bold text-sm text-[#4169A8] liquid-glass-interactive liquid-glass-pill bg-[#D7E1EB]/50 border-white/60 shadow-xs ${className}`}
    >
      <span className="liquid-glass-specular" aria-hidden="true" />
      <span className="liquid-glass-refraction" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="relative z-10 flex items-center gap-2 liquid-glass-content">
            {idleText}
          </motion.div>
        )}
        {state === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative z-10">
            <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </motion.div>
        )}
        {state === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="relative z-10 flex items-center gap-2 text-emerald-700 font-bold liquid-glass-content">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            {successText}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export { LiquidGlassButton, GlassIconButton } from './LiquidGlassButton';
export type { LiquidGlassButtonProps, GlassIconButtonProps, LiquidGlassVariant, LiquidGlassSize, LiquidGlassTheme } from './LiquidGlassButton';
