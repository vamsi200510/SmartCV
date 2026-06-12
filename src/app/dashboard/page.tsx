'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, profile, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  if (!user || !profile) {
    return null;
  }

  const displayName = profile.full_name || user.email?.split('@')[0] || 'Member';

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Neon Glows for Dark Theme */}
      {isDarkMode && (
        <>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Header */}
      <header className={`border-b backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between ${isDarkMode ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <div>
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">
              SmartCV
            </span>
            <span className="text-[10px] block text-slate-500 font-semibold tracking-wider uppercase -mt-0.5">
              Dashboard
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition cursor-pointer ${isDarkMode ? 'border-slate-800 hover:bg-slate-900 text-teal-400' : 'border-slate-200 hover:bg-slate-100 text-indigo-600'}`}
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

          {/* Secure Logout Button */}
          <button
            onClick={logout}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${isDarkMode ? 'border-slate-850 hover:border-rose-500/30 bg-slate-900/60 hover:bg-rose-500/10 text-slate-300 hover:text-rose-450' : 'border-slate-250 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-600'}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12 relative z-10 flex flex-col justify-center">
        
        {/* Welcome Banner */}
        <div className={`border rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden transition ${isDarkMode ? 'bg-gradient-to-r from-slate-900/60 to-slate-900/20 border-slate-800/80' : 'bg-gradient-to-r from-indigo-50/50 to-indigo-50/10 border-indigo-100'}`}>
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Welcome back, <span className="bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">{displayName}</span>!
          </h1>
          <p className={`text-xs sm:text-sm mt-2 max-w-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            SmartCV has compiled your profile preferences. Your personalized AI resume builders, ATS analyzer tools, and career recommendation modules are being prepared.
          </p>
        </div>

        {/* Profile Card Sections */}
        <div className="mb-6">
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Your Onboarding Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Department */}
            <div className={`border rounded-xl p-5 shadow-sm transition hover:shadow-md ${isDarkMode ? 'bg-slate-900/30 border-slate-850 hover:border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Department</span>
                <span className="text-xl">💻</span>
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {profile.department || 'Not Defined'}
              </h3>
              <p className={`text-[10px] mt-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Active academic curriculum focus.
              </p>
            </div>

            {/* Career Goal */}
            <div className={`border rounded-xl p-5 shadow-sm transition hover:shadow-md ${isDarkMode ? 'bg-slate-900/30 border-slate-850 hover:border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Career Goal</span>
                <span className="text-xl">🎯</span>
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {profile.career_goal || 'Not Defined'}
              </h3>
              <p className={`text-[10px] mt-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Target milestone goals.
              </p>
            </div>

            {/* Experience Level */}
            <div className={`border rounded-xl p-5 shadow-sm transition hover:shadow-md ${isDarkMode ? 'bg-slate-900/30 border-slate-850 hover:border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Experience</span>
                <span className="text-xl">📊</span>
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {profile.experience_level || 'Not Defined'}
              </h3>
              <p className={`text-[10px] mt-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Verified background category.
              </p>
            </div>

          </div>
        </div>

        {/* Feature Placeholders Dashboard */}
        <div className={`border rounded-xl p-6 transition ${isDarkMode ? 'bg-slate-900/20 border-slate-900/60' : 'bg-slate-100/50 border-slate-200/80'}`}>
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-3 font-semibold uppercase tracking-wider">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Next Modules: Coming Soon</span>
          </div>
          <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Resume Builders, Resume Parsers, and AI Enhancement tools are disabled for this check. Once the core database connection verification is complete, we will populate the workspace features here.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer className={`border-t py-6 px-6 text-center text-xs ${isDarkMode ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <span>SmartCV Member Console</span>
          <span className="mt-2 sm:mt-0 font-mono text-[10px]">Secure Session Profile: {user.email}</span>
        </div>
      </footer>

    </div>
  );
}
