'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, Shield,
  Eye, EyeOff, RefreshCw, Mail, Lock, ChevronLeft,
  Star, CheckCircle, Zap, TrendingUp, FileText
} from 'lucide-react';
import { MouseGlow, ATSRing, OTPInput, MorphingButton } from '@/components/ui/design-system';

type AuthMode = 'sign-in' | 'create-account';
type AuthStep =
  | 'email-input'
  | 'otp-input'
  | 'password-login'
  | 'password-create'
  | 'forgot-password-email'
  | 'forgot-password-otp'
  | 'forgot-password-reset';

// ── Left Panel — Animated Branding Column ─────────────────────
function AuthLeftPanel() {
  const [currentBullet, setCurrentBullet] = useState(0);
  const bullets = [
    { icon: <Shield className="h-4 w-4" />, text: 'ATS score up to 99/100', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { icon: <Sparkles className="h-4 w-4" />, text: 'AI-powered bullet rewriting', color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { icon: <TrendingUp className="h-4 w-4" />, text: '3· more interview callbacks', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { icon: <FileText className="h-4 w-4" />, text: '12+ premium templates', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrentBullet(p => (p + 1) % bullets.length), 2500);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hidden lg:flex flex-col relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(124,58,237,0.12) 0%, transparent 60%), linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 60%, #ECFEFF 100%)'
      }}>

      {/* Grid texture */}
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Floating blobs */}
      <div className="absolute top-[-10%] right-[-10%] h-80 w-80 rounded-full opacity-40 animate-blob"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[10%] left-[-10%] h-64 w-64 rounded-full opacity-30 animate-blob delay-300"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-12 py-10">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm">
            <img src="/SmartCV_logo.png" alt="Logo" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">SmartCV</span>
        </div>

        {/* Hero text */}
        <div className="flex-1 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl font-extrabold text-[#0F172A] leading-tight tracking-tight mb-4">
              Your career,{' '}
              <span style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                supercharged
              </span>{' '}
              by AI.
            </h1>
            <p className="text-[#64748B] text-base leading-relaxed mb-10 max-w-xs">
              Build ATS-optimized resumes in minutes. Land more interviews. Get your dream job.
            </p>
          </motion.div>

          {/* Animated stats cards */}
          <div className="space-y-3 mb-10">
            {bullets.map((b, i) => (
              <motion.div key={i}
                animate={{ opacity: currentBullet === i ? 1 : 0.45, scale: currentBullet === i ? 1 : 0.97, x: currentBullet === i ? 0 : -4 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`flex items-center gap-3 bg-white/80 backdrop-blur-sm border rounded-2xl px-4 py-3 shadow-sm`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${b.color}`}>
                  {b.icon}
                </div>
                <span className="text-sm font-semibold text-[#0F172A]">{b.text}</span>
                {currentBullet === i && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Check className="h-3 w-3 text-emerald-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Floating resume mockup with ATS ring */}
          <motion.div
            animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative bg-white/90 backdrop-blur-sm border border-white rounded-3xl p-5 shadow-[0_8px_40px_rgba(37,99,235,0.14)] max-w-[280px]">
            {/* Mini resume preview */}
            <div className="flex items-start gap-3 mb-4">
              <ATSRing score={98} size={52} />
              <div className="flex-1">
                <div className="h-3 bg-[#0F172A] rounded w-3/4 mb-1.5" />
                <div className="h-2 bg-slate-300 rounded w-1/2 mb-1" />
                <div className="h-2 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 bg-slate-100 rounded w-full" />
              <div className="h-1.5 bg-slate-100 rounded w-5/6" />
              <div className="h-1.5 bg-slate-100 rounded w-4/6" />
            </div>
            <div className="mt-3 flex gap-1.5">
              {['React', 'TypeScript', 'AWS'].map(t => (
                <span key={t} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold border border-blue-100">{t}</span>
              ))}
            </div>
            {/* AI badge */}
            <div className="absolute -top-3 -right-3 bg-[#2563EB] text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" /> AI Enhanced
            </div>
          </motion.div>
        </div>

        {/* Bottom social proof */}
        <div className="flex items-center gap-3 mt-10">
          <div className="flex -space-x-2">
            {['#2563EB','#7C3AED','#06B6D4','#10B981'].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
                style={{ background: c }}>
                {['A','B','R','K'][i]}
              </div>
            ))}
          </div>
          <div className="text-xs text-[#64748B]">
            <span className="font-semibold text-[#0F172A]">2M+</span> resumes created
          </div>
          <div className="ml-auto flex items-center gap-1">
            {[...Array(5)].map((_,i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
            <span className="text-xs font-bold text-[#0F172A] ml-1">4.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Auth Page ─────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [step, setStep] = useState<AuthStep>('email-input');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [loadingStep, setLoadingStep] = useState<'sending-otp' | 'verifying-otp' | 'creating-account' | 'signing-in' | 'resetting-password' | 'google' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [missingTableSql, setMissingTableSql] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0 && (step === 'otp-input' || step === 'forgot-password-otp')) {
      interval = setInterval(() => setResendCooldown(p => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown, step]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('smartcv_remembered_email');
      if (savedEmail) { setEmail(savedEmail); setRememberMe(true); }
      const params = new URLSearchParams(window.location.search);
      const queryMode = params.get('mode');
      if (queryMode === 'signin') setMode('sign-in');
      else if (queryMode === 'signup') setMode('create-account');
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoadingStep('google'); setErrorMsg(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback`, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('Could not resolve Google OAuth authorization URL.');
      const checkRes = await fetch('/api/auth/check-provider', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url }),
      }).catch(() => null);
      if (!checkRes || !checkRes.ok) {
        throw new Error('Google Login pre-flight check failed. Please log in with email.');
      }
      const checkData = await checkRes.json().catch(() => ({ enabled: false }));
      if (!checkData.enabled) throw new Error(checkData.error || 'Google Login is currently not configured. Please use email verification.');
      window.location.href = data.url;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Login is not configured. Please use email verification.');
      setLoadingStep(null);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!email) return;
    setLoadingStep(mode === 'sign-in' ? 'signing-in' : 'sending-otp');
    setErrorMsg(null); setSuccessMsg(null);
    try {
      const checkRes = await fetch('/api/auth/check-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!checkRes.ok) throw new Error('Failed to verify email address status.');
      const { exists } = await checkRes.json();
      if (mode === 'create-account' && exists) { setLoadingStep(null); setErrorMsg('Account already exists. Please sign in.'); return; }
      if (mode === 'sign-in' && !exists) { setLoadingStep(null); setErrorMsg('No account found. Create an account.'); return; }
      if (mode === 'sign-in') { setStep('password-login'); setLoadingStep(null); }
      else await handleSendOtp(e);
    } catch (err: any) { setErrorMsg(err.message || 'An error occurred.'); setLoadingStep(null); }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e?.preventDefault(); if (!email) return;
    setLoadingStep('sending-otp'); setErrorMsg(null); setSuccessMsg(null); setMissingTableSql(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { if (data.sqlRequired) { setMissingTableSql(data.sql); } throw new Error(data.error || 'Failed to send verification code.'); }
      setSuccessMsg(data.message || 'Verification code sent to your email.');
      setStep(step === 'forgot-password-email' ? 'forgot-password-otp' : 'otp-input');
      setResendCooldown(60);
    } catch (err: any) { setErrorMsg(err.message); } finally { setLoadingStep(null); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); if (!otpCode) return;
    console.log('[OTP] Verify button clicked');
    setLoadingStep('verifying-otp'); setErrorMsg(null); setSuccessMsg(null);
    try {
      console.time('[OTP] Verification API');
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });
      const data = await res.json();
      console.timeEnd('[OTP] Verification API');
      if (!res.ok) throw new Error(data.error || 'Verification failed.');
      console.log('[OTP] Verified successfully, token:', data.verificationToken);
      setVerificationToken(data.verificationToken);
      // Transition immediately — no artificial delay
      const nextStep = step === 'forgot-password-otp' ? 'forgot-password-reset' : 'password-create';
      console.log('[OTP] Transitioning to step:', nextStep);
      setStep(nextStep);
    } catch (err: any) {
      console.error('[OTP] Verification failed:', err.message);
      setErrorMsg(err.message);
    } finally {
      setLoadingStep(null);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    console.log('[Auth] Creating account...');
    setLoadingStep('creating-account'); setErrorMsg(null);
    try {
      console.time('[Auth] Register API');
      const regRes = await fetch('/api/auth/register-user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, verificationToken }),
      });
      const regData = await regRes.json();
      console.timeEnd('[Auth] Register API');
      if (!regRes.ok) throw new Error(regData.error || 'Failed to register account.');
      console.time('[Auth] Sign-in after register');
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      console.timeEnd('[Auth] Sign-in after register');
      if (loginError) throw loginError;
      console.log('[Auth] Session established, redirecting to /onboarding');
      router.replace('/onboarding');
    } catch (err: any) { setErrorMsg(err.message); } finally { setLoadingStep(null); }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingStep('signing-in'); setErrorMsg(null);
    try {
      console.time('[Auth] Password sign-in');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      console.timeEnd('[Auth] Password sign-in');
      if (error) throw error;
      if (rememberMe) localStorage.setItem('smartcv_remembered_email', email);
      else localStorage.removeItem('smartcv_remembered_email');
      console.log('[Auth] Session established, redirecting to /dashboard');
      router.replace('/dashboard');
    } catch (err: any) { setErrorMsg(err.message || 'Invalid password.'); } finally { setLoadingStep(null); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters.'); return; }
    setLoadingStep('resetting-password'); setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, verificationToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password.');
      setSuccessMsg('Password updated. You can now sign in.');
      setPassword(''); setConfirmPassword('');
      setStep('email-input'); setMode('sign-in');
    } catch (err: any) { setErrorMsg(err.message); } finally { setLoadingStep(null); }
  };

  const getPasswordStrength = (p: string) => {
    let s = 0;
    if (p.length === 0) return 0;
    if (p.length >= 6) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const score = getPasswordStrength(password);
  const strengthLabel = ['Too Short', 'Weak', 'Fair', 'Strong'][score - 1] || 'Too Short';
  const strengthColor = score >= 3 ? 'bg-emerald-500' : score >= 2 ? 'bg-amber-500' : 'bg-red-400';
  const strengthTextColor = score >= 3 ? 'text-emerald-600' : score >= 2 ? 'text-amber-600' : 'text-red-500';

  const stepTitle: Record<AuthStep, string> = {
    'email-input': mode === 'sign-in' ? 'Welcome back' : 'Create your account',
    'otp-input': 'Check your email',
    'password-login': 'Enter your password',
    'password-create': 'Secure your account',
    'forgot-password-email': 'Forgot password',
    'forgot-password-otp': 'Enter recovery code',
    'forgot-password-reset': 'Set new password',
  };

  const stepSubtitle: Record<AuthStep, string> = {
    'email-input': mode === 'sign-in' ? `Sign in to continue building your career.` : 'Join SmartCV and build your ATS-ready resume.',
    'otp-input': `We sent a 6-digit code to ${email}`,
    'password-login': `Signing in as ${email}`,
    'password-create': `Set a strong password for ${email}`,
    'forgot-password-email': 'Enter your email to receive a recovery code.',
    'forgot-password-otp': `Enter the code we sent to ${email}`,
    'forgot-password-reset': 'Choose a new secure password.',
  };

  // Shared input classes
  const inputCls = "w-full h-11 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-blue-50 transition-all duration-200 font-medium shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
  const labelCls = "block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Inter,sans-serif] overflow-hidden">
      <MouseGlow />
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT: Branding */}
        <AuthLeftPanel />

        {/* RIGHT: Auth Form */}
        <div className="flex flex-col justify-center px-6 py-10 lg:px-16 relative">
          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm">
              <img src="/SmartCV_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#0F172A]">SmartCV</span>
          </div>

          <div className="max-w-[420px] w-full mx-auto lg:mx-0 lg:ml-auto">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>

                {/* Title */}
                <div className="mb-8">
                  {step !== 'email-input' && (
                    <button onClick={() => { setStep('email-input'); setErrorMsg(null); setSuccessMsg(null); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] mb-5 transition-colors cursor-pointer">
                      <ChevronLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  )}
                  <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">{stepTitle[step]}</h2>
                  <p className="text-sm text-[#64748B] leading-relaxed">{stepSubtitle[step]}</p>
                </div>

                {/* Alerts */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div key="auth-error-alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl overflow-hidden">
                      <p className="text-sm font-semibold text-red-700 mb-0.5">Something went wrong</p>
                      <p className="text-xs text-red-600">{errorMsg}</p>
                      {errorMsg.includes('already exists') && (
                        <button onClick={() => { setMode('sign-in'); setErrorMsg(null); }}
                          className="mt-2 text-xs font-bold text-red-700 hover:underline cursor-pointer">Switch to Sign In →</button>
                      )}
                      {errorMsg.includes('No account found') && (
                        <button onClick={() => { setMode('create-account'); setErrorMsg(null); }}
                          className="mt-2 text-xs font-bold text-red-700 hover:underline cursor-pointer">Create Account →</button>
                      )}
                    </motion.div>
                  )}
                  {successMsg && (
                    <motion.div key="auth-success-alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mb-5 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 overflow-hidden">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-700 font-medium">{successMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google login (email-input step only) */}
                {step === 'email-input' && (
                  <>
                    <button type="button" onClick={handleGoogleLogin} disabled={loadingStep !== null}
                      className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)] mb-4 cursor-pointer disabled:opacity-60">
                      {loadingStep === 'google' ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      )}
                      Continue with Google
                    </button>

                    <div className="relative my-5 flex items-center">
                      <div className="flex-1 h-px bg-[#E2E8F0]" />
                      <span className="px-4 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">or continue with email</span>
                      <div className="flex-1 h-px bg-[#E2E8F0]" />
                    </div>
                  </>
                )}

                {/* STEP: Email Input */}
                {step === 'email-input' && (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className={labelCls}>Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                        <input id="email" type="email" required placeholder="name@company.com"
                          value={email} onChange={e => setEmail(e.target.value)}
                          className={`${inputCls} pl-10`} />
                      </div>
                    </div>

                    {mode === 'sign-in' && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-medium text-[#64748B] cursor-pointer select-none">
                          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                          Remember me
                        </label>
                        <button type="button" onClick={() => { setStep('forgot-password-email'); setErrorMsg(null); setSuccessMsg(null); }}
                          className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <MorphingButton 
                      type="submit" 
                      state={loadingStep === (mode === 'sign-in' ? 'signing-in' : 'sending-otp') ? 'loading' : 'idle'} 
                      idleText={mode === 'sign-in' ? 'Continue' : 'Send Verification Code'} 
                      successText="Success"
                      className="w-full" 
                    />

                    <p className="text-center text-sm text-[#64748B] pt-3">
                      {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
                      <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'create-account' : 'sign-in'); setErrorMsg(null); }}
                        className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer transition-colors">
                        {mode === 'sign-in' ? 'Sign up free' : 'Sign in'}
                      </button>
                    </p>
                  </form>
                )}

                {/* STEP: OTP Input */}
                {(step === 'otp-input' || step === 'forgot-password-otp') && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label htmlFor="otp" className={labelCls}>6-Digit Code</label>
                      <div className="pt-1">
                        <OTPInput length={6} value={otpCode} onChange={setOtpCode} />
                      </div>
                      <p className="text-xs text-[#64748B] mt-3 text-center">Code expires in 10 minutes</p>
                    </div>
                    <MorphingButton 
                      type="submit" 
                      state={loadingStep === 'verifying-otp' ? 'loading' : 'idle'} 
                      idleText="Verify OTP" 
                      successText="Verifying..."
                      disabled={otpCode.length !== 6}
                      className="w-full" 
                    />
                    <div className="text-center">
                      <button type="button" disabled={resendCooldown > 0} onClick={handleSendOtp}
                        className={`text-sm font-semibold cursor-pointer transition-colors ${resendCooldown > 0 ? 'text-[#94A3B8] cursor-not-allowed' : 'text-[#2563EB] hover:text-[#1D4ED8]'}`}>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP: Create Password */}
                {step === 'password-create' && (
                  <form onSubmit={handleRegisterUser} className="space-y-4">
                    <div>
                      <label htmlFor="reg-pass" className={labelCls}>Create Password <span className="normal-case font-normal">(min. 6 characters)</span></label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                        <input id="reg-pass" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)}
                          className={`${inputCls} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] cursor-pointer">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="mt-2.5">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] text-[#64748B]">Password strength</span>
                            <span className={`text-[11px] font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                              style={{ width: score >= 3 ? '100%' : score >= 2 ? '66%' : '33%' }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <MorphingButton 
                      type="submit" 
                      state={loadingStep === 'creating-account' ? 'loading' : 'idle'} 
                      idleText="Create Account" 
                      successText="Success"
                      disabled={password.length < 6}
                      className="w-full" 
                    />
                  </form>
                )}

                {/* STEP: Password Login */}
                {step === 'password-login' && (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <label htmlFor="password" className={labelCls}>Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                        <input id="password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)}
                          className={`${inputCls} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] cursor-pointer">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <MorphingButton 
                      type="submit" 
                      state={loadingStep === 'signing-in' ? 'loading' : 'idle'} 
                      idleText="Sign In to SmartCV" 
                      successText="Success"
                      className="w-full" 
                    />
                    <p className="text-center text-xs text-[#64748B]">
                      <button type="button" onClick={() => { setStep('forgot-password-email'); setErrorMsg(null); }}
                        className="text-[#2563EB] font-semibold hover:text-[#1D4ED8] cursor-pointer">Forgot password?</button>
                    </p>
                  </form>
                )}

                {/* STEP: Forgot Password Email */}
                {step === 'forgot-password-email' && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label htmlFor="forgot-email" className={labelCls}>Account Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                        <input id="forgot-email" type="email" required placeholder="name@company.com"
                          value={email} onChange={e => setEmail(e.target.value)}
                          className={`${inputCls} pl-10`} />
                      </div>
                    </div>
                    <MorphingButton 
                      type="submit" 
                      state={loadingStep === 'sending-otp' ? 'loading' : 'idle'} 
                      idleText="Send Recovery Code" 
                      successText="Success"
                      className="w-full" 
                    />
                  </form>
                )}

                {/* STEP: Reset Password */}
                {step === 'forgot-password-reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label htmlFor="reset-pass" className={labelCls}>New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                        <input id="reset-pass" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)}
                          className={`${inputCls} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] cursor-pointer">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirm-pass" className={labelCls}>Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                        <input id="confirm-pass" type={showConfirmPassword ? 'text' : 'password'} required placeholder="••••••••"
                          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          className={`${inputCls} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] cursor-pointer">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <MorphingButton 
                      type="submit" 
                      state={loadingStep === 'resetting-password' ? 'loading' : 'idle'} 
                      idleText="Update Password" 
                      successText="Success"
                      className="w-full" 
                    />
                  </form>
                )}

                {/* DB setup SQL info */}
                {missingTableSql && (
                  <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs font-bold text-amber-800 mb-2">Database Setup Required</p>
                    <p className="text-xs text-amber-700 mb-2">Run this SQL in the Supabase Dashboard:</p>
                    <pre className="text-[10px] bg-white border border-amber-100 rounded-lg p-2.5 overflow-x-auto font-mono text-slate-700 select-all">{missingTableSql}</pre>
                  </div>
                )}

                {/* Trust badges */}
                {step === 'email-input' && (
                  <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex items-center justify-center gap-6">
                    {[
                      { icon: <Shield className="h-3.5 w-3.5 text-[#64748B]" />, label: 'Secure & Private' },
                      { icon: <CheckCircle className="h-3.5 w-3.5 text-[#64748B]" />, label: 'No Credit Card' },
                      { icon: <Zap className="h-3.5 w-3.5 text-[#64748B]" />, label: 'Free to Start' },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        {b.icon} {b.label}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
