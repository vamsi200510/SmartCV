'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// ============================================================
// 1. MOUSE GLOW — REMOVED (no-op export for compatibility)
// ============================================================
export function MouseGlow() {
  return null;
}

// ============================================================
// 2. ANIMATED SHADER — Simplified to subtle dot pattern
// ============================================================
export function AnimatedShader() {
  return (
    <div className="fixed inset-0 -z-50 bg-[#F7F8FC]" />
  );
}

// ============================================================
// 3. BUTTON — Clean, solid, no gradients
// ============================================================
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'glass' | 'gradient' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, loading, disabled, ...props }, ref) => {
    const base = "relative inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

    const sizes: Record<ButtonSize, string> = {
      xs: "px-3 py-1.5 text-[11px] gap-1 rounded-lg",
      sm: "px-4 py-2 text-xs gap-1.5 rounded-xl",
      md: "px-5 py-2.5 text-sm gap-2 rounded-xl",
      lg: "px-6 py-3 text-sm gap-2 rounded-xl",
    };

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-blue-500/30 shadow-xs",
      secondary: "bg-white text-[#374151] border border-[#ECEDF3] hover:border-[#DDDEE8] hover:bg-[#FAFBFE] focus:ring-gray-200",
      outline: "border border-[#2563EB] text-[#2563EB] bg-transparent hover:bg-blue-50 focus:ring-blue-500/30",
      glass: "liquid-glass-interactive liquid-glass-pill text-[#1E293B] hover:text-[#0F172A]",
      gradient: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-blue-500/30 shadow-xs",
      ghost: "text-[#6B7280] hover:text-[#111827] hover:bg-[#F0F1F8] focus:ring-gray-200",
      danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] focus:ring-red-500/30",
      success: "bg-[#22C55E] text-white hover:bg-[#16A34A] focus:ring-green-500 shadow-sm",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || loading}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...(props as MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5 mr-1 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

// ============================================================
// 4. CARD — Clean, minimal hover
// ============================================================
interface CardProps {
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({
  className = '',
  hover = true,
  padding = false,
  children,
  onClick,
  style,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      style={style}
      className={`
        relative bg-white rounded-2xl border border-[#ECEDF3] overflow-hidden
        shadow-[0_1px_3px_rgba(0,0,0,0.02)]
        ${hover ? 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition-all duration-250 cursor-pointer' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// 5. BADGE
// ============================================================
type BadgeVariant = 'primary' | 'blue' | 'secondary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan' | 'amber';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = 'primary', size = 'sm', children, className = '', dot }: BadgeProps) {
  const styles: Record<BadgeVariant, string> = {
    primary: 'bg-blue-50 text-blue-700 border border-blue-100',
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    secondary: 'bg-gray-100 text-gray-600 border border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    danger: 'bg-red-50 text-red-700 border border-red-100',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
    amber: 'bg-orange-50 text-orange-700 border border-orange-100',
  };

  const dotColors: Record<BadgeVariant, string> = {
    primary: 'bg-blue-500', blue: 'bg-blue-500', secondary: 'bg-gray-400', success: 'bg-emerald-500',
    warning: 'bg-amber-500', danger: 'bg-red-500', purple: 'bg-purple-500',
    cyan: 'bg-cyan-500', amber: 'bg-orange-500'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-md ${sizes[size]} ${styles[variant]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

// ============================================================
// 6. PROGRESS BAR
// ============================================================
export function ProgressBar({ value, max = 100, className = '', color = 'primary' }: {
  value: number;
  max?: number;
  className?: string;
  color?: 'primary' | 'gradient' | 'success' | 'warning';
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    primary: 'bg-[#2563EB]',
    gradient: 'bg-[#2563EB]',
    success: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
  };

  return (
    <div className={`w-full bg-gray-100 rounded-full h-1.5 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        className={`h-full rounded-full ${colors[color]}`}
      />
    </div>
  );
}

// ============================================================
// 7. SECTION HEADER
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
        <h2 className="text-lg font-semibold tracking-tight text-[#111827]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}

// ============================================================
// 8. STATS CARD
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
    <Card padding className={className}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-[#6B7280] mb-1">{title}</p>
          <p className="text-2xl font-semibold text-[#111827] tracking-tight">{value}</p>
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]">
            {icon}
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>{trend.value}</span>
          )}
          {subtitle && <span className="text-[#6B7280]">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// 9. SKELETON LOADER
// ============================================================
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-7 flex-1 rounded-md" />
        <Skeleton className="h-7 flex-1 rounded-md" />
      </div>
    </div>
  );
}

// ============================================================
// 10. MODAL CONTAINER
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
            className={`relative z-10 w-full ${sizes[size]} bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-6`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// 11. CONFIRM DIALOG
// ============================================================
interface ConfirmDialogProps {
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
          <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
          <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-3 justify-end pt-2">
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
// 12. INLINE RENAME INPUT
// ============================================================
interface InlineRenameProps {
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
        <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">{label}</label>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm text-[#111827] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 justify-end">
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
// 13. EMPTY STATE
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
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#111827] mb-1">{title}</h3>
      <p className="text-sm text-[#6B7280] max-w-sm mb-5 leading-relaxed">{description}</p>
      {action}
    </motion.div>
  );
}

// ============================================================
// 14. ATS SCORE RING
// ============================================================
export function ATSRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#22C55E' : score >= 75 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-semibold" style={{ color, fontSize: size < 70 ? 12 : 15 }}>{score}</span>
        <span className="text-[8px] font-medium text-[#9CA3AF] uppercase tracking-wider">ATS</span>
      </div>
    </div>
  );
}

// ============================================================
// 15. TOAST SYSTEM
// ============================================================
type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
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
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
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
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white shadow-lg min-w-[240px] max-w-[340px]"
    >
      {icons[item.variant]}
      <span className="text-sm font-medium text-[#111827] flex-1 leading-snug">{item.message}</span>
      <button
        onClick={onDismiss}
        className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer shrink-0"
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
// 16. PAGE LOADER — Skeleton + progress text
// ============================================================
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] gap-3">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-[#6B7280]">{message}</span>
    </div>
  );
}

// ============================================================
// 17. INPUT COMPONENT
// ============================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
          <label htmlFor={inputId} className="block text-xs font-medium text-[#6B7280]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">{icon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-10 px-3 rounded-lg border text-sm text-[#111827] bg-white
              placeholder:text-[#9CA3AF] focus:outline-none transition-all duration-150
              shadow-sm
              ${error
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-50'
                : 'border-[#E5E7EB] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50'
              }
              ${icon ? 'pl-9' : ''}
              ${rightIcon ? 'pr-9' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">{rightIcon}</div>
          )}
        </div>
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-[#9CA3AF]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================
// 18. SPINNER
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
// 19. OTP INPUT
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
          className="w-10 h-12 sm:w-12 sm:h-14 bg-white border border-[#E5E7EB] rounded-lg text-center text-lg sm:text-xl font-semibold text-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all shadow-sm placeholder:text-[#D1D5DB]"
        />
      ))}
    </div>
  );
}

// ============================================================
// 20. MORPHING BUTTON
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
      whileTap={state === 'idle' ? { scale: 0.98 } : undefined}
      animate={{ 
        backgroundColor: state === 'success' ? '#22C55E' : '#2563EB',
      }}
      transition={{ duration: 0.2 }}
      className={`relative inline-flex items-center justify-center h-10 px-4 rounded-lg font-semibold text-sm text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-2">
            {idleText}
          </motion.div>
        )}
        {state === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </motion.div>
        )}
        {state === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-white" />
            {successText}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export { LiquidGlassButton } from './LiquidGlassButton';
export type { LiquidGlassButtonProps, LiquidGlassVariant, LiquidGlassSize, LiquidGlassTheme } from './LiquidGlassButton';
