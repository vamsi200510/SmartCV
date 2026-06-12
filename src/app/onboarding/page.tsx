'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const DEPARTMENTS = [
  { id: 'IT / Software', label: 'IT / Software', icon: '💻' },
  { id: 'ECE', label: 'ECE (Electronics)', icon: '⚡' },
  { id: 'EEE', label: 'EEE (Electrical)', icon: '🔌' },
  { id: 'Mechanical', label: 'Mechanical', icon: '⚙️' },
  { id: 'Civil', label: 'Civil', icon: '🏗️' },
  { id: 'MBA', label: 'MBA', icon: '📈' },
  { id: 'Commerce', label: 'Commerce', icon: '🪙' },
  { id: 'Other', label: 'Other', icon: '💼' }
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
  { id: 'Internship Experience', label: 'Internship Experience', desc: 'Have completed structural internships.' },
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
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync Google display name if available, but do not pre-fill if it's just the email prefix
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
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!department) {
        setErrorMsg('Please select a department.');
        return;
      }
    }
    if (step === 2 && !careerGoal) {
      setErrorMsg('Please select a career goal.');
      return;
    }
    setErrorMsg(null);
    setStep(step + 1);
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!experienceLevel) {
      setErrorMsg('Please select your experience level.');
      return;
    }
    if (!user) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          department,
          careerGoal,
          experienceLevel,
        }),
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

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Glows for Dark Theme */}
      {isDarkMode && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Header */}
      <header className={`border-b backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between ${isDarkMode ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white">
            S
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">
            SmartCV
          </span>
        </div>

        {/* Theme Toggle Segmented Control */}
        <div className={`relative flex items-center p-0.5 rounded-xl border transition-all duration-300 ${isDarkMode ? 'bg-slate-950 border-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]' : 'bg-slate-100 border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]'}`}>
          {/* Sliding capsule background */}
          <div
            className={`absolute h-[26px] rounded-lg shadow-sm transition-all duration-300 ease-out border ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-teal-400'
                : 'bg-white border-slate-200/80 text-indigo-600'
            }`}
            style={{
              width: '64px',
              transform: `translateX(${isDarkMode ? '64px' : '0px'})`
            }}
          />
          
          <button
            type="button"
            onClick={() => setIsDarkMode(false)}
            className={`relative z-10 flex items-center justify-center space-x-1 w-[64px] py-1 rounded-lg text-[10px] font-bold transition-colors duration-200 cursor-pointer ${
              !isDarkMode ? 'text-indigo-600' : 'text-slate-550 hover:text-slate-700'
            }`}
          >
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.122 0l-.707-.707m12.02-12.02l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <span>Light</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsDarkMode(true)}
            className={`relative z-10 flex items-center justify-center space-x-1 w-[64px] py-1 rounded-lg text-[10px] font-bold transition-colors duration-200 cursor-pointer ${
              isDarkMode ? 'text-teal-400' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>Dark</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className={`max-w-xl w-full border rounded-2xl p-6 sm:p-8 shadow-2xl transition duration-300 ${isDarkMode ? 'bg-slate-900/40 border-slate-800/80 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              <span>Step {step} of 3</span>
              <span>
                {step === 1 && 'Profile Details'}
                {step === 2 && 'Career Goal'}
                {step === 3 && 'Experience Level'}
              </span>
            </div>
            <div className={`h-1 w-full rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs leading-relaxed">
              <span className="font-semibold block mb-0.5">Error</span>
              {errorMsg}
            </div>
          )}

          {/* STEP 1: PROFILE DETAILS */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Profile Details
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Help us understand your educational focus and verify your identity.
                </p>
              </div>

              {/* Full Name Input Field */}
              <div>
                <label htmlFor="fullName" className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  placeholder="e.g. Vamsi Krishna"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrorMsg(null);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-1 transition duration-200 ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-teal-500 focus:ring-teal-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-semibold mb-1.5 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Select your Department
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {DEPARTMENTS.map((dept) => {
                    const isSelected = department === dept.id;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => {
                          setDepartment(dept.id);
                          setErrorMsg(null);
                        }}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition duration-200 cursor-pointer ${
                          isSelected
                            ? isDarkMode
                              ? 'bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                              : 'bg-indigo-50 border-indigo-600 text-indigo-600'
                            : isDarkMode
                            ? 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <span className="text-xl">{dept.icon}</span>
                        <span className="text-xs font-bold">{dept.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CAREER GOALS */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  What is your Career Goal?
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tell us where you want to apply your talents.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {CAREER_GOALS.map((goal) => {
                  const isSelected = careerGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => {
                        setCareerGoal(goal.id);
                        setErrorMsg(null);
                      }}
                      className={`w-full p-4 rounded-xl border text-left flex items-start space-x-3 transition duration-200 cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                            : 'bg-indigo-50 border-indigo-600 text-indigo-600'
                          : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="h-5 w-5 rounded-full border border-current flex items-center justify-center mt-0.5 shrink-0">
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-current" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{goal.label}</span>
                        <span className={`text-[10px] block mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {goal.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: EXPERIENCE LEVELS */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <h2 className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Select your Experience Level
                </h2>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  This formats your layout to prioritize highlights properly.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {EXPERIENCE_LEVELS.map((exp) => {
                  const isSelected = experienceLevel === exp.id;
                  return (
                    <button
                      key={exp.id}
                      onClick={() => {
                        setExperienceLevel(exp.id);
                        setErrorMsg(null);
                      }}
                      className={`w-full p-4 rounded-xl border text-left flex items-start space-x-3 transition duration-200 cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                            : 'bg-indigo-50 border-indigo-600 text-indigo-600'
                          : isDarkMode
                          ? 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="h-5 w-5 rounded-full border border-current flex items-center justify-center mt-0.5 shrink-0">
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-current" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{exp.label}</span>
                        <span className={`text-[10px] block mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {exp.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/20">
            {step > 1 ? (
              <button
                onClick={handlePrev}
                disabled={loading}
                className={`px-4 py-2 border text-xs font-bold rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isDarkMode
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isDarkMode
                    ? 'bg-teal-500 hover:bg-teal-450 text-slate-950 shadow-lg shadow-teal-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isDarkMode
                    ? 'bg-teal-500 hover:bg-teal-450 active:bg-teal-600 text-slate-950 shadow-lg shadow-teal-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-750 text-white shadow-lg shadow-indigo-600/10'
                }`}
              >
                {loading ? 'Submitting...' : 'Complete Onboarding'}
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 px-6 text-center text-xs ${isDarkMode ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span>SmartCV Member Console</span>
          <span className="mt-2 sm:mt-0 font-mono text-[10px]">Onboarding Initialization</span>
        </div>
      </footer>

    </div>
  );
}
