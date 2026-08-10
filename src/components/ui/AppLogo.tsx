'use client';

import React from 'react';

export type LogoVariant = 'header' | 'loading' | 'footer' | 'iconOnly';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface AppLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

const sizeCfg: Record<LogoSize, { container: string; img: string; text: string }> = {
  sm: { container: 'h-8 w-8',   img: 'h-5 w-5',   text: 'text-sm' },
  md: { container: 'h-10 w-10', img: 'h-6 w-6',   text: 'text-base' },
  lg: { container: 'h-14 w-14', img: 'h-9 w-9',   text: 'text-lg' },
  xl: { container: 'h-24 w-24', img: 'h-16 w-16', text: 'text-xl' },
};

export default function AppLogo({
  variant = 'header',
  size = 'md',
  showText,
  className = '',
}: AppLogoProps) {
  const cfg = sizeCfg[size];

  const shouldShowText = showText !== undefined
    ? showText
    : variant === 'header' || variant === 'footer';

  const logoImg = (
    <>
      <img
        src="/SmartCV_logo.png"
        alt="SmartCV"
        className={`${cfg.img} object-contain transition-transform`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = 'flex';
        }}
      />
      <div
        style={{ display: 'none' }}
        className="items-center justify-center text-indigo-600 font-black"
      >
        S
      </div>
    </>
  );

  if (variant === 'loading') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <div className={`${cfg.container} rounded-full bg-white border border-[#ECEDF3] flex items-center justify-center shadow-md overflow-hidden`}>
          {logoImg}
        </div>
        {shouldShowText && (
          <span className={`font-bold tracking-tight text-[#111827] ${cfg.text}`}>SmartCV</span>
        )}
      </div>
    );
  }

  if (variant === 'iconOnly') {
    return (
      <div className={`${cfg.container} rounded-full bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
        {logoImg}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      <div className={`${cfg.container} rounded-full bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm overflow-hidden`}>
        {logoImg}
      </div>
      {shouldShowText && (
        <span className={`font-bold tracking-tight text-[#111827] ${cfg.text}`}>SmartCV</span>
      )}
    </div>
  );
}
