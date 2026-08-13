'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Home, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { MouseGlow, AnimatedShader, Button } from '@/components/ui/design-system';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[SmartCV Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FFFDD0] flex flex-col items-center justify-center relative overflow-hidden font-[Inter,sans-serif]">
      <AnimatedShader />
      <MouseGlow />

      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-12">
          <div className="h-10 w-10 rounded-2xl bg-[#315E9B] flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">SmartCV</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mx-auto mb-6">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Something went wrong</h1>
          <p className="text-sm text-[#64748B] leading-relaxed mb-3">
            An unexpected error occurred. We've logged this and will look into it.
          </p>

          {error.digest && (
            <p className="text-[10px] font-mono text-[#94A3B8] mb-6 bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mt-6">
            <Button variant="primary" size="md" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="secondary" size="md" onClick={() => router.push('/dashboard')}>
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
