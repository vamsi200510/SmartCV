'use client';

import React from 'react';

/**
 * ColorMeshBackdrop
 * Fixed background refraction layer strictly clipped to the top navigation header zone (height: 96px).
 * Provides vibrant color refraction for the floating liquid-glass navbar without bleeding
 * down into page sections, hero cards, or content bands below.
 */
export function ColorMeshBackdrop() {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-24 overflow-hidden pointer-events-none z-30"
      aria-hidden="true"
    >
      {/* ── Top-Left Nav Refraction Blob (Warm Amber #C2600E) ── */}
      <div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '180px',
          top: '-40px',
          left: '18%',
          background: '#C2600E',
          opacity: 0.22,
          filter: 'blur(45px)',
          transform: 'translateZ(0)',
        }}
      />

      {/* ── Top-Right Nav Refraction Blob (Deep Ocean Blue #1E6FA8) ── */}
      <div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '180px',
          top: '-40px',
          right: '18%',
          background: '#1E6FA8',
          opacity: 0.22,
          filter: 'blur(45px)',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  );
}

export default ColorMeshBackdrop;
