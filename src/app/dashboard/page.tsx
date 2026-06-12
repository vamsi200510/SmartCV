'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, profile, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Sync client query parameters safely to avoid Next.js static Suspense issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsNewUser(params.get('new') === 'true');
    }
  }, []);

  if (!user || !profile) {
    return null;
  }

  // Get first name from profile.full_name, ignoring email prefix fallbacks
  const emailPrefix = user.email?.split('@')[0];
  let firstName = '';
  if (profile.full_name && profile.full_name.trim() && profile.full_name !== emailPrefix) {
    firstName = profile.full_name.trim().split(' ')[0];
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-500 font-sans relative overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Neon Glows for Dark Theme */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-floating-glow" />
          <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] animate-floating-glow" style={{ animationDelay: '-5s' }} />
        </div>
      )}

      {/* Header */}
      <header className={`border-b backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20">
            S
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
              SmartCV
            </span>
            <span className={`text-[9px] block font-bold tracking-widest uppercase -mt-0.5 ${isDarkMode ? 'text-slate-550' : 'text-slate-400'}`}>
              Console
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          
          {/* Theme Toggle Segmented Control */}
          <div className={`relative flex items-center p-0.5 rounded-xl border transition-all duration-500 ${isDarkMode ? 'bg-slate-950 border-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]' : 'bg-slate-100 border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]'}`}>
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
                !isDarkMode ? 'text-indigo-600' : 'text-slate-550 hover:text-slate-300'
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
                isDarkMode ? 'text-teal-400' : 'text-slate-500 hover:text-slate-355'
              }`}
            >
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Dark</span>
            </button>
          </div>

          {/* Secure Logout Button */}
          <button
            onClick={logout}
            className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-1.5 cursor-pointer ${
              isDarkMode 
                ? 'border-slate-850 bg-slate-900/40 hover:border-rose-500/20 hover:bg-rose-500/5 text-slate-300 hover:text-rose-400' 
                : 'border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-655 hover:text-rose-600 shadow-sm'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-10 relative z-10 flex flex-col justify-center space-y-10">
        
        {/* Dashboard Premium Hero Banner */}
        <section className={`relative border rounded-[28px] p-8 sm:p-10 overflow-hidden transition-all duration-500 shadow-xl dark:shadow-slate-950/40 animate-fade-in-up ${
          isDarkMode 
            ? 'bg-slate-900/35 border-slate-900/60' 
            : 'bg-white border-slate-200/60 shadow-slate-250/20'
        }`}>
          {/* Animated colorful gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-indigo-500/5 to-purple-500/5 dark:from-teal-500/10 dark:via-indigo-500/5 dark:to-purple-500/10 opacity-70 animate-gradient-shift pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                isDarkMode ? 'bg-teal-500/10 text-teal-400 border border-teal-500/10' : 'bg-indigo-50 text-indigo-650 border border-indigo-100'
              }`}>
                ✨ AI Portfolio Gateway
              </span>
              
              <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                {isNewUser ? (
                  firstName ? (
                    <span>Welcome to <span className="bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">SmartCV</span>, {firstName} 👋</span>
                  ) : (
                    <span>Welcome to <span className="bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">SmartCV</span> 👋</span>
                  )
                ) : (
                  firstName ? (
                    <span>Welcome back, <span className="bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">{firstName}</span> 👋</span>
                  ) : (
                    <span>Welcome back 👋</span>
                  )
                )}
              </h1>
              
              <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Build ATS-friendly resumes, optimize your career profile, and prepare for your next opportunity. SmartCV has initialized your preferences.
              </p>
            </div>
          </div>
        </section>

        {/* Profile Details Sections */}
        <section className="animate-fade-in-up animation-delay-100">
          <div className="flex items-center space-x-2 mb-5">
            <div className="h-1 w-3 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500" />
            <h2 className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Your Onboarding Profile
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            
            {/* Full Name */}
            <div className={`border rounded-[22px] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between backdrop-blur-md ${
              isDarkMode 
                ? 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800' 
                : 'bg-white border-slate-200/50 hover:border-slate-300 shadow-slate-200/50'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Name</span>
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-teal-400' : 'bg-slate-50 text-indigo-650'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={profile.full_name}>
                  {profile.full_name || 'Not Defined'}
                </h3>
              </div>
              <p className={`text-[8.5px] font-semibold mt-4 tracking-wide ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Registered profile identity.
              </p>
            </div>

            {/* Email Address */}
            <div className={`border rounded-[22px] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between backdrop-blur-md ${
              isDarkMode 
                ? 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800' 
                : 'bg-white border-slate-200/50 hover:border-slate-300 shadow-slate-200/50'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email Address</span>
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-indigo-400' : 'bg-slate-50 text-indigo-655'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={profile.email || user.email}>
                  {profile.email || user.email || 'Not Defined'}
                </h3>
              </div>
              <p className={`text-[8.5px] font-semibold mt-4 tracking-wide ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Verified account handle.
              </p>
            </div>

            {/* Department */}
            <div className={`border rounded-[22px] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between backdrop-blur-md ${
              isDarkMode 
                ? 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800' 
                : 'bg-white border-slate-200/50 hover:border-slate-300 shadow-slate-200/50'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Department</span>
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-purple-400' : 'bg-slate-50 text-purple-650'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                </div>
                <h3 className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={profile.department}>
                  {profile.department || 'Not Defined'}
                </h3>
              </div>
              <p className={`text-[8.5px] font-semibold mt-4 tracking-wide ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Active study curriculum.
              </p>
            </div>

            {/* Career Goal */}
            <div className={`border rounded-[22px] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between backdrop-blur-md ${
              isDarkMode 
                ? 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800' 
                : 'bg-white border-slate-200/50 hover:border-slate-300 shadow-slate-200/50'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Career Goal</span>
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-emerald-400' : 'bg-slate-50 text-emerald-650'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                </div>
                <h3 className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={profile.career_goal}>
                  {profile.career_goal || 'Not Defined'}
                </h3>
              </div>
              <p className={`text-[8.5px] font-semibold mt-4 tracking-wide ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Target career trajectory.
              </p>
            </div>

            {/* Experience Level */}
            <div className={`border rounded-[22px] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between backdrop-blur-md ${
              isDarkMode 
                ? 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800' 
                : 'bg-white border-slate-200/50 hover:border-slate-300 shadow-slate-200/50'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Experience</span>
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-rose-400' : 'bg-slate-50 text-rose-650'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.674 12h-3.348" />
                      <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth={2} />
                    </svg>
                  </div>
                </div>
                <h3 className={`text-xs sm:text-[13px] font-bold truncate leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`} title={profile.experience_level}>
                  {profile.experience_level || 'Not Defined'}
                </h3>
              </div>
              <p className={`text-[8.5px] font-semibold mt-4 tracking-wide ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Verified experience category.
              </p>
            </div>

          </div>
        </section>

        {/* Premium Empty State Resume Card */}
        <section className="animate-fade-in-up animation-delay-200">
          <div className={`border rounded-[28px] p-8 sm:p-12 text-center overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl backdrop-blur-md ${
            isDarkMode 
              ? 'bg-slate-900/15 border-slate-900/60 hover:border-slate-800/80 shadow-slate-950/20' 
              : 'bg-white border-slate-200/50 hover:border-slate-300 shadow-slate-250/10'
          }`}>
            <div className={`mx-auto h-16 w-16 rounded-[20px] flex items-center justify-center mb-6 shadow-inner ${
              isDarkMode ? 'bg-slate-950 text-teal-400 border border-slate-850' : 'bg-slate-50 text-indigo-600 border border-slate-200/50'
            }`}>
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Ready to build your first professional resume?
            </h3>
            
            <p className={`text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Create an ATS-optimized resume using our AI-assisted builder and tailor it to your career goals.
            </p>
            
            <button
              type="button"
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer ${
                isDarkMode
                  ? 'bg-teal-500 hover:bg-teal-450 active:bg-teal-600 text-slate-950 shadow-teal-500/10 hover:shadow-teal-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-750 text-white shadow-indigo-600/10 hover:shadow-indigo-600/20'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Resume</span>
            </button>
          </div>
        </section>

        {/* Feature Placeholders Dashboard */}
        <section className="animate-fade-in-up animation-delay-300">
          <div className={`border rounded-[22px] p-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/10 border-slate-900/60' : 'bg-slate-100/50 border-slate-200/50'}`}>
            <div className="flex items-center space-x-2 text-slate-500 text-xs mb-3 font-bold uppercase tracking-wider">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>SmartCV Core Console modules</span>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
              Advanced resume parsing, template matching, and AI recommendations are currently dormant. They will initialize dynamically as we deploy further pipeline features.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className={`border-t py-6 px-6 text-center text-xs transition-colors duration-500 ${isDarkMode ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span className="font-semibold">SmartCV Member Console</span>
          <span className="mt-2 sm:mt-0 font-bold uppercase tracking-widest text-[9px] text-slate-500">Secure Console Session</span>
        </div>
      </footer>
      
    </div>
  );
}
