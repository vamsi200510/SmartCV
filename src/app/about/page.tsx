'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, ArrowLeft, Globe, Code2,
  Database, Palette, Zap, Shield, Rocket,
  Heart, Layers, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/design-system';

const TECH_STACK = [
  { name: 'Next.js 16', desc: 'React framework with server components, app router, and edge runtime.', icon: Code2, color: 'bg-slate-900', textColor: 'text-white' },
  { name: 'Supabase', desc: 'Postgres database, auth, storage, and real-time subscriptions.', icon: Database, color: 'bg-emerald-500', textColor: 'text-white' },
  { name: 'Liquid Glass UI', desc: 'Apple-inspired optical glass design system with layered physical refraction.', icon: Palette, color: 'bg-blue-600', textColor: 'text-white' },
  { name: 'Framer Motion', desc: 'Production-ready physics animations and gesture support for React.', icon: Zap, color: 'bg-purple-600', textColor: 'text-white' },
  { name: 'Puppeteer', desc: 'Headless Chrome for pixel-perfect A4 PDF resume generation.', icon: Globe, color: 'bg-amber-600', textColor: 'text-white' },
  { name: 'Google Gemini AI', desc: 'AI-powered resume optimization, content rewriting, and ATS analysis.', icon: Sparkles, color: 'bg-cyan-600', textColor: 'text-white' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen text-[#0F172A]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Floating Liquid Glass Navbar */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 max-w-5xl mx-auto pointer-events-none">
        <div className="liquid-glass-surface rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg pointer-events-auto border border-white/80">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-full liquid-glass-circle flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition shadow-xs">
              <ArrowLeft size={14} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl liquid-glass-square flex items-center justify-center shadow-xs">
                <img src="/SmartCV_logo.png" alt="Logo" className="h-4 w-4 object-contain" />
              </div>
              <span className="font-black text-sm text-[#0F172A] tracking-tight">SmartCV</span>
            </div>
          </div>
          <Link href="/auth?mode=signup">
            <Button variant="primary" size="sm">
              Get Started <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16 relative z-10">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-blue-700 text-xs font-semibold mb-5 shadow-xs">
            <Rocket size={12} className="text-blue-600" /> Version 3.0.0
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight leading-tight">
            Building the future of<br />
            <span className="text-[#315E9B]">
              resume creation.
            </span>
          </h1>
          <p className="text-base text-[#64748B] mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            SmartCV is a free, AI-powered resume builder designed for students and freshers. We combine modern optical web technologies with intelligent optimization to help you land your dream job.
          </p>
        </motion.section>

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="liquid-glass-card-primary p-8 md:p-10 mb-12 shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-3">
                <Heart size={12} /> Our Mission
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-3">
                Level the playing field for every job seeker.
              </h2>
              <p className="text-xs text-[#64748B] leading-relaxed font-medium">
                We believe every student deserves a professional, ATS-optimized resume — regardless of their design skills or budget. SmartCV is and will always be completely free, with no hidden premium tiers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { value: '12+', label: 'Templates', icon: Layers },
                { value: '100%', label: 'Free Forever', icon: Heart },
                { value: 'AI', label: 'Powered', icon: Sparkles },
                { value: 'A4', label: 'PDF Export', icon: Shield },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="liquid-glass-card-secondary p-4 text-center rounded-2xl shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl liquid-glass-circle flex items-center justify-center mx-auto mb-2 text-[#2563EB]">
                    <stat.icon size={15} />
                  </div>
                  <div className="text-2xl font-black text-[#0F172A]">{stat.value}</div>
                  <div className="text-[11px] text-[#64748B] font-medium mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7C3AED] mb-2">
              <Code2 size={12} /> Tech Stack
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Built with modern technologies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="liquid-glass-card-primary p-5 shadow-xs hover:-translate-y-0.5 transition-transform"
              >
                <div className={`h-10 w-10 rounded-2xl ${tech.color} flex items-center justify-center mb-3 shadow-xs`}>
                  <tech.icon size={18} className={tech.textColor} />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] mb-1">{tech.name}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed font-medium">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </main>
    </div>
  );
}
