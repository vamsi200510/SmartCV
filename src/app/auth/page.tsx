'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type AuthMode = 'sign-in' | 'create-account';

type AuthStep =
  | 'email-input'
  | 'otp-input'
  | 'password-login'
  | 'password-create'
  | 'forgot-password-email'
  | 'forgot-password-otp'
  | 'forgot-password-reset';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [step, setStep] = useState<AuthStep>('email-input');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  
  // Custom loading state to trigger specific spinners
  const [loadingStep, setLoadingStep] = useState<'sending-otp' | 'verifying-otp' | 'creating-account' | 'signing-in' | 'resetting-password' | 'google' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [missingTableSql, setMissingTableSql] = useState<string | null>(null);
  
  // UI preferences
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('smartcv_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  // Google OAuth Log In (independent action)
  const handleGoogleLogin = async () => {
    setLoadingStep('google');
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) {
        throw new Error('Could not resolve Google OAuth authorization URL.');
      }

      // Pre-flight check
      const checkRes = await fetch('/api/auth/check-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url }),
      });

      if (!checkRes.ok) {
        throw new Error('Google Login pre-flight check failed.');
      }

      const checkData = await checkRes.json();

      if (!checkData.enabled) {
        throw new Error(
          checkData.error ||
            'Google Login is currently not configured in the developer dashboard. Please contact the administrator or continue with email verification.'
        );
      }

      // Success -> Redirect
      window.location.href = data.url;
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          'Google Login is currently not configured in the developer dashboard. Please contact the administrator or continue with email verification.'
      );
      setLoadingStep(null);
    }
  };

  // Submit Handler for Email input step
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (mode === 'sign-in') {
      // Sign In Flow: moves directly to password input screen
      setErrorMsg(null);
      setSuccessMsg(null);
      setStep('password-login');
    } else {
      // Create Account Flow: dispatches OTP
      await handleSendOtp(e);
    }
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoadingStep('sending-otp');
    setErrorMsg(null);
    setSuccessMsg(null);
    setMissingTableSql(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.sqlRequired) {
          setMissingTableSql(data.sql);
          throw new Error(data.error);
        }
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setSuccessMsg(data.message || 'Verification code sent to your email.');
      setStep(step === 'forgot-password-email' ? 'forgot-password-otp' : 'otp-input');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingStep(null);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    setLoadingStep('verifying-otp');
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setVerificationToken(data.verificationToken);
      setSuccessMsg('Email verified successfully.');

      if (step === 'forgot-password-otp') {
        setStep('forgot-password-reset');
      } else {
        setStep('password-create');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingStep(null);
    }
  };

  // Register User (Create Password step)
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoadingStep('creating-account');
    setErrorMsg(null);

    try {
      const regRes = await fetch('/api/auth/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, verificationToken }),
      });
      const regData = await regRes.json();

      if (!regRes.ok) {
        throw new Error(regData.error || 'Failed to register account.');
      }

      // Log in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      setSuccessMsg('Account registered and logged in successfully.');
      router.push('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingStep(null);
    }
  };

  // Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStep('signing-in');
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Persist email if remember me checked
      if (rememberMe) {
        localStorage.setItem('smartcv_remembered_email', email);
      } else {
        localStorage.removeItem('smartcv_remembered_email');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid password.');
    } finally {
      setLoadingStep(null);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoadingStep('resetting-password');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, verificationToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccessMsg('Password updated successfully. You can now login.');
      setPassword('');
      setConfirmPassword('');
      setStep('email-input');
      setMode('sign-in');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingStep(null);
    }
  };

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length === 0) return 0;
    if (pass.length >= 6) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const score = getPasswordStrength(password);
  const labels = ['Too Short', 'Weak', 'Medium', 'Strong'];

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-500 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Glows for Dark Mode */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[15%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[10%] right-[15%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Header */}
      <header className={`border-b backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">
            SmartCV
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-lg border transition duration-200 cursor-pointer ${isDarkMode ? 'border-slate-800 hover:bg-slate-900 text-teal-400' : 'border-slate-200 hover:bg-slate-100 text-indigo-600'}`}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.122 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Form Center */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className={`max-w-md w-full border rounded-2xl p-6 sm:p-8 shadow-2xl transition-all duration-300 transform scale-100 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/80 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
          
          {/* Header Title */}
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-extrabold tracking-tight transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {step === 'email-input' && (mode === 'sign-in' ? 'Sign In' : 'Welcome to SmartCV')}
              {step === 'otp-input' && 'Verify your Email'}
              {step === 'password-login' && 'Enter your password'}
              {step === 'password-create' && 'Create your password'}
              {step === 'forgot-password-email' && 'Password Recovery'}
              {step === 'forgot-password-otp' && 'Verify Recovery Code'}
              {step === 'forgot-password-reset' && 'Reset your password'}
            </h2>
            <p className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {step === 'email-input' && (mode === 'sign-in' ? 'Welcome back! Sign in to manage your resumes.' : 'Create an account to build your AI-optimized resume.')}
              {step === 'otp-input' && `We sent a 6-digit OTP code to ${email}`}
              {step === 'password-login' && `Enter your password for ${email}`}
              {step === 'password-create' && `Set up a secure login password for ${email}`}
              {step === 'forgot-password-email' && 'Enter your email to receive a password recovery code.'}
              {step === 'forgot-password-otp' && `Enter the recovery code sent to ${email}`}
              {step === 'forgot-password-reset' && 'Choose a new strong password for your account.'}
            </p>

            {/* Social Proof Section */}
            {step === 'email-input' && (
              <div className="mt-3 flex justify-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-colors duration-300 ${isDarkMode ? 'bg-teal-500/10 text-teal-400' : 'bg-indigo-50 text-indigo-700'}`}>
                  🌟 Trusted by students, freshers and professionals.
                </span>
              </div>
            )}
          </div>

          {/* Status Alerts */}
          {errorMsg && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs leading-relaxed transition-all duration-300">
              <span className="font-semibold block mb-0.5">Error</span>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs leading-relaxed transition-all duration-300">
              <span className="font-semibold block mb-0.5">Success</span>
              {successMsg}
            </div>
          )}

          {/* SQL table diagnostics error helper */}
          {missingTableSql && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-xl text-xs">
              <span className="font-bold block mb-1">Database Setup Required</span>
              The table <code className="font-mono text-slate-100 bg-slate-900 px-1 py-0.5 rounded">otp_verifications</code> does not exist in your database. Please run the SQL editor script in the Supabase Dashboard:
              <pre className="mt-2 bg-slate-950 p-2.5 rounded-lg font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap select-all border border-slate-800">
                {missingTableSql}
              </pre>
            </div>
          )}

          {/* SECTION A: Continue with Google (Visual Separation) */}
          {step === 'email-input' && (
            <div className="mb-6 animate-fade-in">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGoogleLogin();
                }}
                disabled={loadingStep !== null}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs border transition flex items-center justify-center space-x-2.5 duration-200 cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700/80 active:bg-slate-700 border-slate-700 text-slate-200'
                    : 'bg-white hover:bg-slate-50 active:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                {loadingStep === 'google' ? (
                  <svg className="animate-spin h-4.5 w-4.5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3.08-2.92 4.09v3.41h4.73c2.76-2.54 4.35-6.28 4.35-10.35z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.73-3.41c-1.32.89-3.01 1.42-5.23 1.42-4.03 0-7.44-2.73-8.66-6.4H1.47v3.52C3.49 19.64 7.42 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M3.34 14.71a8.43 8.43 0 010-3.42V7.77H1.47a11.97 11.97 0 000 10.46l1.87-3.52z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.42 0 3.49 4.36 1.47 8.38l1.87 3.52c1.22-3.67 4.63-6.4 8.66-6.4z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-5">
                <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                <span className="px-4 text-[10px] uppercase font-bold tracking-widest text-slate-500 whitespace-nowrap">or continue with email</span>
                <div className={`flex-grow border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
              </div>
            </div>
          )}

          {/* SECTION B: Email Authentication */}
          <div className="transition-all duration-300">
            
            {/* TABS (Only visible on initial email entry step) */}
            {step === 'email-input' && (
              <div className="flex border-b border-slate-800/20 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('sign-in');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-grow pb-2.5 text-xs font-bold border-b-2 uppercase tracking-wide transition duration-200 cursor-pointer ${
                    mode === 'sign-in'
                      ? isDarkMode ? 'border-teal-500 text-teal-400' : 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('create-account');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-grow pb-2.5 text-xs font-bold border-b-2 uppercase tracking-wide transition duration-200 cursor-pointer ${
                    mode === 'create-account'
                      ? isDarkMode ? 'border-teal-500 text-teal-400' : 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-400'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* STEP 1: EMAIL ENTRY FORM */}
            {step === 'email-input' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="email" className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 transition duration-200 ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500 focus:ring-teal-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                </div>

                {/* Remember Me Toggle - ONLY on Sign In mode */}
                {mode === 'sign-in' && (
                  <div className="flex items-center mt-2">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={`h-4 w-4 rounded border transition duration-200 focus:ring-offset-0 focus:ring-1 ${
                        isDarkMode
                          ? 'border-slate-800 bg-slate-950 text-teal-500 focus:ring-teal-500'
                          : 'border-slate-300 bg-slate-55 text-indigo-600 focus:ring-indigo-600'
                      }`}
                    />
                    <label htmlFor="remember-me" className={`ml-2 text-xs font-medium transition duration-200 ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-800'}`}>
                      Remember email address
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingStep !== null}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition duration-200 cursor-pointer ${
                    isDarkMode
                      ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 shadow-teal-500/10'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/10'
                  }`}
                >
                  {loadingStep === 'sending-otp' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending verification code...</span>
                    </span>
                  ) : (
                    mode === 'sign-in' ? 'Continue with Email' : 'Send Verification Code'
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP INPUT FORM (Create Account & Recovery ONLY) */}
            {(step === 'otp-input' || step === 'forgot-password-otp') && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="otp" className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    6-Digit Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-4 py-3 rounded-xl text-lg font-mono text-center tracking-[12px] border focus:outline-none focus:ring-1 transition duration-200 ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500 focus:ring-teal-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingStep !== null}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition duration-200 cursor-pointer ${
                    isDarkMode
                      ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 shadow-teal-500/10'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/10'
                  }`}
                >
                  {loadingStep === 'verifying-otp' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setStep(step === 'forgot-password-otp' ? 'forgot-password-email' : 'email-input');
                    }}
                    className={`text-[11px] font-semibold tracking-wide cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    ← Change email address
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3 (EXISTING USER): PASSWORD ENTRY */}
            {step === 'password-login' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className={`block text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('forgot-password-email');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`text-[10px] font-bold tracking-wide uppercase cursor-pointer ${isDarkMode ? 'text-teal-400 hover:text-teal-300' : 'text-indigo-600 hover:text-indigo-505'}`}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 transition duration-200 ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500 focus:ring-teal-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer transition ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingStep !== null}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition duration-200 cursor-pointer ${
                    isDarkMode
                      ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 shadow-teal-500/10'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/10'
                  }`}
                >
                  {loadingStep === 'signing-in' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Signing In...</span>
                    </span>
                  ) : (
                    'Log In'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email-input');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`text-[11px] font-semibold tracking-wide cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    ← Go back
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3 (NEW USER): CREATE PASSWORD */}
            {step === 'password-create' && (
              <form onSubmit={handleRegisterUser} className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="create-pass" className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Define Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <input
                      id="create-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 transition duration-200 ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500 focus:ring-teal-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer transition ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="mt-3.5 bg-slate-950/20 border border-slate-800/10 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      <span>Security Strength</span>
                      <span className={password.length === 0 ? 'text-slate-500' : password.length < 6 ? 'text-rose-400' : score <= 2 ? 'text-rose-400' : score === 3 ? 'text-amber-400' : 'text-emerald-400'}>
                        {password.length === 0 ? 'Enter Password' : password.length < 6 ? 'Too Short' : labels[score - 1]}
                      </span>
                    </div>
                    <div className="flex space-x-1.5 h-1.5 w-full bg-slate-800/40 rounded-full overflow-hidden mb-2">
                      {[1, 2, 3, 4].map((index) => {
                        let activeColor = 'bg-slate-800';
                        if (password.length >= 6) {
                          if (score >= index) {
                            if (score <= 2) activeColor = 'bg-rose-500';
                            else if (score === 3) activeColor = 'bg-amber-500';
                            else activeColor = 'bg-emerald-500';
                          }
                        }
                        return (
                          <div
                            key={index}
                            className={`h-full flex-grow rounded-full transition-colors duration-300 ${activeColor}`}
                          />
                        );
                      })}
                    </div>
                    <ul className="space-y-1 text-[9px] text-slate-500 list-none">
                      <li className="flex items-center space-x-1">
                        <span className={password.length >= 6 ? 'text-emerald-500' : 'text-slate-600'}>✓</span>
                        <span className={password.length >= 6 ? 'text-slate-300 font-medium' : ''}>At least 6 characters</span>
                      </li>
                      <li className="flex items-center space-x-1">
                        <span className={/[0-9]/.test(password) ? 'text-emerald-500' : 'text-slate-600'}>✓</span>
                        <span className={/[0-9]/.test(password) ? 'text-slate-300 font-medium' : ''}>At least one number</span>
                      </li>
                      <li className="flex items-center space-x-1">
                        <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-500' : 'text-slate-600'}>✓</span>
                        <span className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-slate-300 font-medium' : ''}>Uppercase & lowercase letters</span>
                      </li>
                      <li className="flex items-center space-x-1">
                        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-emerald-500' : 'text-slate-600'}>✓</span>
                        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-slate-300 font-medium' : ''}>At least one symbol (e.g. @, #, $)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingStep !== null}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition duration-200 cursor-pointer ${
                    isDarkMode
                      ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 shadow-teal-500/10'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/10'
                  }`}
                >
                  {loadingStep === 'creating-account' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating Account...</span>
                    </span>
                  ) : (
                    'Create Account & Continue'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email-input');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`text-[11px] font-semibold tracking-wide cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    ← Go back
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD: EMAIL STEP */}
            {step === 'forgot-password-email' && (
              <form onSubmit={handleSendOtp} className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="forgot-email" className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Your Account Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 transition duration-200 ${
                      isDarkMode
                        ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500 focus:ring-teal-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingStep !== null}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition duration-200 cursor-pointer ${
                    isDarkMode
                      ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 shadow-teal-500/10'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/10'
                  }`}
                >
                  {loadingStep === 'sending-otp' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending Recovery Code...</span>
                    </span>
                  ) : (
                    'Send Recovery Code'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('password-login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`text-[11px] font-semibold tracking-wide cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD: RESET STEP */}
            {step === 'forgot-password-reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="reset-pass" className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    New Password (min 6 chars)
                  </label>
                  <div className="relative mb-4">
                    <input
                      id="reset-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 transition duration-200 ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500 focus:ring-teal-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer transition ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <label htmlFor="reset-confirm" className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 transition duration-200 ${
                        isDarkMode
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500 focus:ring-teal-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer transition ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingStep !== null}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition duration-200 cursor-pointer ${
                    isDarkMode
                      ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 shadow-teal-500/10'
                      : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/10'
                  }`}
                >
                  {loadingStep === 'resetting-password' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Updating Password...</span>
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 px-6 text-center text-xs transition-colors duration-300 ${isDarkMode ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span>SmartCV Verification Gateway</span>
          <span className="mt-2 sm:mt-0 font-mono text-[10px]">Secure Multi-factor Handshake</span>
        </div>
      </footer>

      {/* Fade In Keyframes CSS block (Inject in DOM for smooth animations) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
