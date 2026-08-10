'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Sparkles } from 'lucide-react';
import { MouseGlow, AnimatedShader, Button } from '@/components/ui/design-system';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden font-[Inter,sans-serif]">
      <AnimatedShader />
      <MouseGlow />

      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-12">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">SmartCV</span>
        </div>

        {/* 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-[120px] font-extrabold leading-none tracking-tighter mb-4"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Page not found</h1>
          <p className="text-sm text-[#64748B] leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Button variant="primary" size="md" onClick={() => router.push('/dashboard')}>
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button variant="secondary" size="md" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
