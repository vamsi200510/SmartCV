'use client';

import React from 'react';
import AppLogo from './AppLogo';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading SmartCV Workspace...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center font-[Inter,sans-serif] px-4 relative overflow-hidden">
      {/* Subtle background decorative shapes - no glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-50/40 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center max-w-sm relative z-10">
        {/* AppLogo - loading variant: clean circular badge, no glow */}
        <div className="mb-8 flex justify-center">
          <AppLogo variant="loading" size="xl" showText={false} />
        </div>

        {/* Brand name */}
        <p className="text-lg font-bold tracking-tight text-[#111827] mb-6">SmartCV</p>

        {/* Progress Bar */}
        <div className="h-1.5 w-44 bg-[#E2E8F0] border border-[#F1F5F9] rounded-full mx-auto relative overflow-hidden mb-6 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full absolute left-0 top-0 animate-[loading_1.5s_infinite_ease-in-out]"
            style={{ width: '40%' }}
          />
        </div>

        {/* Loading Message */}
        <h3 className="text-sm font-semibold text-[#111827] tracking-tight">{message}</h3>
        <p className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-wider mt-2.5">
          Preparing secure environment
        </p>
      </div>

      {/* Keyframe animation */}
      <style jsx global>{`
        @keyframes loading {
          0% { left: -40%; }
          50% { left: 100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
