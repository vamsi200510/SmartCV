'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { MouseGlow, AnimatedShader, Button, Card, ProgressBar } from '@/components/ui/design-system';

const DEPARTMENTS = [
  { id: 'IT / Software', label: 'IT / Software' },
  { id: 'ECE', label: 'ECE (Electronics)' },
  { id: 'EEE', label: 'EEE (Electrical)' },
  { id: 'Mechanical', label: 'Mechanical' },
  { id: 'Civil', label: 'Civil' },
  { id: 'MBA', label: 'MBA' },
  { id: 'Commerce', label: 'Commerce' },
  { id: 'Other', label: 'Other' }
];

const CAREER_GOALS = [
  { id: 'Core Job', label: 'Core Industry Job', desc: 'Focus on your core field of study.' },
  { id: 'IT Job', label: 'IT & Software Job', desc: 'Work in software engineering, development, or tech.' },
  { id: 'Internship', label: 'Internship', desc: 'Gain professional experience while learning.' },
  { id: 'Government Job', label: 'Government Job', desc: 'Prepare for public sector roles & exams.' },
  { id: 'Higher Studies', label: 'Higher Studies', desc: 'Pursue Master\'s, PHD, or specialized research.' }
];

const EXPERIENCE_LEVELS = [
  { id: 'Fresher', label: 'Fresher', desc: 'Entry-level, seeking first full-time role.' },
  { id: 'Internship Experience', label: 'Internship Experience', desc: 'Have completed structured internships.' },
  { id: '1-3 Years', label: '1 - 3 Years', desc: 'Junior professional experience.' },
  { id: '3-5 Years', label: '3 - 5 Years', desc: 'Mid-level professional experience.' },
  { id: '5+ Years', label: '5+ Years', desc: 'Senior professional experience.' }
];

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.full_name && !fullName && user?.email) {
      const emailPrefix = user.email.split('@')[0];
      if (profile.full_name !== emailPrefix) {
        setFullName(profile.full_name);
      }
    }
  }, [profile, fullName, user]);

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim()) { setErrorMsg('Please enter your full name.'); return; }
      if (!department) { setErrorMsg('Please select a department.'); return; }
    }
    if (step === 2 && !careerGoal) { setErrorMsg('Please select a career goal.'); return; }
    setErrorMsg(null);
    setStep(step + 1);
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!experienceLevel) { setErrorMsg('Please select your experience level.'); return; }
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, department, careerGoal, experienceLevel }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit onboarding data.');
      }
      await refreshProfile();
      router.push('/dashboard?new=true');
    } catch (err: any) {
      console.error('Error submitting onboarding:', err);
      setErrorMsg(err.message || 'Failed to submit onboarding profile.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    "Let's complete your profile",
    'What is your career goal?',
    'What is your experience level?',
  ];

  const stepSubtitles = [
    'Personalize your resume templates to your field.',
    'This helps us target templates and scoring metrics for your goals.',
    'Select your seniority level to adjust content suggestions.',
  ];

  const optionCls = (selected: boolean) =>
    `p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-150 cursor-pointer ${
      selected
        ? 'liquid-glass-card-primary border-[#2563EB]/60 text-[#1D4ED8] shadow-xs'
        : 'liquid-glass-card-secondary hover:border-white/90 text-[#0F172A]'
    }`;

  return (
    <div className="min-h-screen text-[#0F172A] flex flex-col justify-between font-[Inter,sans-serif] relative overflow-hidden">
      <MouseGlow />

      {/* Floating Header */}
      <header className="fixed top-4 inset-x-0 z-50 px-6 max-w-xl mx-auto pointer-events-none">
        <div className="liquid-glass-surface rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg pointer-events-auto border border-white/80">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl liquid-glass-square flex items-center justify-center shadow-xs">
              <img src="/SmartCV_logo.png" alt="Logo" className="h-4 w-4 object-contain" />
            </div>
            <span className="font-black text-sm tracking-tight text-[#0F172A]">SmartCV</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12 relative z-10">
        <div className="liquid-glass-card-primary max-w-xl w-full p-6 sm:p-8 rounded-3xl shadow-xl">

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-2">
              <span>Step {step} of 3</span>
              <span>{['Profile Details', 'Career Goal', 'Experience Level'][step - 1]}</span>
            </div>
            <ProgressBar value={step} max={3} color="gradient" />
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{stepTitles[step - 1]}</h1>
                <p className="text-sm mt-1.5 leading-relaxed text-[#64748B]">{stepSubtitles[step - 1]}</p>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 overflow-hidden"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-xs font-semibold text-red-700">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="fullname" className="block text-xs font-semibold text-[#64748B] mb-1.5 uppercase tracking-wide">
                      Your Full Name
                    </label>
                    <input
                      id="fullname"
                      type="text"
                      placeholder="e.g. Vamsi Krishna"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-blue-50 transition shadow-sm placeholder:text-[#94A3B8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-2 uppercase tracking-wide">
                      Select Department
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {DEPARTMENTS.map((dept) => (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => setDepartment(dept.id)}
                          className={optionCls(department === dept.id)}
                        >
                          <span className="text-xs font-semibold text-[#0F172A] truncate">{dept.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button variant="gradient" onClick={handleNext} size="md">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2.5">
                    {CAREER_GOALS.map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => setCareerGoal(goal.id)}
                        className={optionCls(careerGoal === goal.id)}
                      >
                        <span className="text-sm font-semibold text-[#0F172A]">{goal.label}</span>
                        <span className="text-xs text-[#64748B] leading-normal">{goal.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <Button variant="secondary" onClick={handlePrev} size="md">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button variant="gradient" onClick={handleNext} size="md">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2.5">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setExperienceLevel(level.id)}
                        className={optionCls(experienceLevel === level.id)}
                      >
                        <span className="text-sm font-semibold text-[#0F172A]">{level.label}</span>
                        <span className="text-xs text-[#64748B] leading-normal">{level.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <Button variant="secondary" onClick={handlePrev} size="md">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button variant="gradient" onClick={handleSubmit} loading={loading} size="md">
                      {!loading && <><span>Complete Setup</span> <Check className="h-4 w-4" /></>}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-5 px-6 text-center">
        <p className="text-xs text-[#94A3B8]">SmartCV · Secure & Private · Your data is encrypted</p>
      </footer>
    </div>
  );
}

