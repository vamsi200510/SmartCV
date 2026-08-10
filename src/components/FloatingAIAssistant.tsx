'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FloatingAIAssistantProps {
  onOpen: () => void;
  isOpen: boolean;
}

export default function FloatingAIAssistant({ onOpen, isOpen }: FloatingAIAssistantProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: window.innerWidth - 76, y: window.innerHeight - 88 });
    }
  }, []);

  const handleDragStart = (_: any, info: any) => {
    setIsDragging(true);
    dragStartPos.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (_: any, info: any) => {
    setTimeout(() => setIsDragging(false), 50);
    if (typeof window === 'undefined') return;

    const currentX = (position?.x ?? window.innerWidth - 76) + info.offset.x;
    const currentY = (position?.y ?? window.innerHeight - 88) + info.offset.y;

    // Snap to nearest horizontal edge
    const snapToRight = currentX > window.innerWidth / 2;
    const targetX = snapToRight ? window.innerWidth - 76 : 16;
    const targetY = Math.max(64, Math.min(window.innerHeight - 76, currentY));

    setPosition({ x: targetX, y: targetY });
  };

  if (isOpen || !position) return null;

  const cursorStyle = isDragging ? 'grabbing' : 'grab';

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 50, cursor: cursorStyle }}
      className="touch-none select-none"
    >
      <motion.button
        onClick={() => { if (!isDragging) onOpen(); }}
        animate={{
          scale: isDragging ? 1.04 : 1,
          y: isDragging ? -3 : 0,
        }}
        whileHover={{
          scale: isDragging ? 1.04 : 1.06,
          y: -2,
        }}
        whileTap={{ scale: 0.96 }}
        title="Open SmartCV AI Assistant (drag to reposition)"
        className="liquid-glass-interactive liquid-glass-circle shadow-lg group relative"
        style={{
          width: 58,
          height: 58,
          padding: 0,
          cursor: cursorStyle,
        }}
      >
        {/* Specular Gloss Overlay */}
        <span className="liquid-glass-specular" aria-hidden="true" />
        
        {/* Chromatic Edge Dispersion Refraction */}
        <span className="liquid-glass-refraction" aria-hidden="true" />

        {/* Embedded Robot Icon with subtle drop shadow */}
        <div className="relative z-10 flex items-center justify-center p-1.5 liquid-glass-content">
          <img
            src="/Chatbot_logo_transparent.png"
            alt="AI"
            style={{
              width: 38,
              height: 38,
              objectFit: 'contain',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.14))',
            }}
            draggable={false}
          />
        </div>
      </motion.button>

      {/* Hover tooltip — renders outside button overflow:hidden */}
      <div
        className="group-hover:opacity-100"
        style={{
          position: 'absolute',
          right: 64,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          background: '#111827',
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 600,
          padding: '5px 10px',
          borderRadius: 10,
          opacity: 0,
          transition: 'opacity 0.2s',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
        id="floating-ai-tooltip"
      >
        SmartCV AI ✨
      </div>
    </motion.div>
  );
}
