'use client';

import React from 'react';
import AppLogo from './AppLogo';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading SmartCV Workspace...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[#E7E4DD] dashboard-environment flex flex-col items-center justify-center font-[Inter,sans-serif] px-4 relative overflow-hidden">
      {/* Subtle background decorative shapes - warm neutral */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-50/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-50/15 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center max-w-sm relative z-10">
        {/* AppLogo - loading variant: clean circular badge, no glow */}
        <div className="mb-8 flex justify-center">
          <AppLogo variant="loading" size="xl" showText={false} />
        </div>

        {/* Brand name */}
        <p className="text-lg font-bold tracking-tight text-[#111827] mb-6">SmartCV</p>

        {/* Progress Bar */}
        <div className="h-1.5 w-44 bg-[#D0D4CC] border border-[#E2E6DF] rounded-full mx-auto relative overflow-hidden mb-6 shadow-inner">
          <div
            className="h-full bg-[#4169A8] rounded-full absolute left-0 top-0 animate-[loading_1.5s_infinite_ease-in-out]"
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
