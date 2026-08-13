'use client';

import React, { useRef, useState, useEffect } from 'react';
import TemplateRenderer, { ResumeData } from '@/components/TemplateRenderer';

interface A4ResumePreviewProps {
  templateId: string;
  data?: ResumeData;
  className?: string;
}

export default function A4ResumePreview({
  templateId,
  data,
  className = '',
}: A4ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.35);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.offsetWidth;
      if (width > 0) {
        // 794px is the internal A4 render width of TemplateRenderer
        setScale(width / 794);
      }
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full aspect-[210/297] bg-white overflow-hidden relative select-none ${className}`}
    >
      <div
        className="origin-top-left pointer-events-none absolute top-0 left-0"
        style={{
          width: '794px',
          height: '1123px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <TemplateRenderer templateId={templateId} zoom={100} data={data} />
      </div>
    </div>
  );
}
