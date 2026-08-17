'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, ArrowLeft, Globe, Code2,
  Database, Palette, Zap, Shield, Rocket,
  Heart, Layers, ArrowRight, User, Mail,
  Award, Terminal, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/design-system';
import { ColorMeshBackdrop } from '@/components/ui/ColorMeshBackdrop';

const TECH_STACK = [
  { name: 'Next.js 16', desc: 'React framework with server components, App Router, Turbopack, and edge execution.', icon: Code2, color: 'bg-slate-900', textColor: 'text-white' },
  { name: 'TypeScript', desc: 'End-to-end type safety across client, server routes, and database models.', icon: Terminal, color: 'bg-[#1E6FA8]', textColor: 'text-white' },
  { name: 'Supabase', desc: 'PostgreSQL database with Row Level Security, Auth, Storage, and real-time triggers.', icon: Database, color: 'bg-[#1F7A3D]', textColor: 'text-white' },
  { name: 'Liquid Glass UI', desc: 'Handcrafted optical design system with layered physical light refraction and tokens.', icon: Palette, color: 'bg-[#C2600E]', textColor: 'text-white' },
  { name: 'Framer Motion', desc: 'Physics-based fluid interactions, layout transitions, and micro-animations.', icon: Zap, color: 'bg-purple-600', textColor: 'text-white' },
  { name: 'Google Gemini AI', desc: 'Deterministic ATS analysis, candidate bullet scoring, and intelligent content suggestions.', icon: Sparkles, color: 'bg-cyan-600', textColor: 'text-white' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen level-0-base text-[#241C12] relative overflow-hidden color-mesh-backdrop" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ColorMeshBackdrop />

      {/* Floating Liquid Glass Navbar */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 max-w-5xl mx-auto pointer-events-none">
        <div className="liquid-glass-surface rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg pointer-events-auto border border-white/80">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-full bg-white/80 hover:bg-white border border-[#E8DDD0] flex items-center justify-center text-[#5C4E3E] hover:text-[#241C12] transition shadow-xs">
              <ArrowLeft size={14} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center shadow-xs">
                <img src="/SmartCV_logo.png" alt="Logo" className="h-4 w-4 object-contain" />
              </div>
              <span className="font-black text-sm text-[#241C12] tracking-tight">SmartCV</span>
            </div>
          </div>
          <Link href="/auth?mode=signup">
            <Button variant="primary" size="sm" className="bg-[#C2600E] text-white hover:bg-[#7D3804] font-bold shadow-md transition-colors duration-200">
              Get Started <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20 relative z-10">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-orange text-xs font-bold mb-5 shadow-xs">
            <Rocket size={12} className="text-[#C2600E]" /> Next-Gen Resume Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#241C12] tracking-tight leading-tight">
            Empowering every student &amp;<br />
            <span className="text-[#C2600E]">
              job seeker with honest AI.
            </span>
          </h1>
          <p className="text-base text-[#5C4E3E] mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            SmartCV is a free, high-performance resume engineering platform built to eliminate predatory paywalls and inflated scoring with evidence-based ATS optimization.
          </p>
        </motion.section>

        {/* ── MEET THE DEVELOPER SECTION ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="level-1-card p-8 md:p-10 mb-12 shadow-md border border-[#E8DDD0] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C2600E]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#C2600E] mb-6">
            <User size={13} /> Creator &amp; Lead Developer
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Avatar / Bio Badge */}
            <div className="lg:col-span-4 flex flex-col items-center text-center p-6 rounded-2xl level-2-nested border border-[#E8DDD0] shadow-xs">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C2600E] to-[#E67E22] text-white flex items-center justify-center text-3xl font-black shadow-md border-4 border-white mb-4">
                VK
              </div>
              <h2 className="text-xl font-black text-[#241C12] tracking-tight">Vamsi Krishna Tadisetti</h2>
              <p className="text-xs font-bold text-[#C2600E] mt-0.5">Creator &amp; Full Stack Software Engineer</p>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full badge-emerald text-[10px] font-bold shadow-xs">
                  <CheckCircle2 size={11} /> Project Lead
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full badge-sky text-[10px] font-bold shadow-xs">
                  <Terminal size={11} /> Architect
                </span>
              </div>
            </div>

            {/* Developer Story */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-xl font-bold text-[#241C12]">
                Building Tools That Truly Help People Land Their Dream Roles
              </h3>
              <p className="text-sm text-[#5C4E3E] leading-relaxed font-medium">
                Hi, I am <strong className="text-[#241C12] font-extrabold">Vamsi Krishna Tadisetti</strong>. I developed SmartCV to address a persistent frustration faced by students and freshers: online resume builders that lock PDF downloads behind unexpected subscriptions or provide fake, inflated ATS scores.
              </p>
              <p className="text-sm text-[#5C4E3E] leading-relaxed font-medium">
                My vision for SmartCV is centered on three core tenets:
              </p>
              <ul className="space-y-2 text-xs text-[#241C12] font-semibold">
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#DCFCE7] text-[#1F7A3D] flex items-center justify-center mt-0.5 shrink-0">✓</div>
                  <span><strong>100% Free &amp; Unrestricted:</strong> Unlimited A4 PDF exports with zero watermarks or subscription traps.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#DCFCE7] text-[#1F7A3D] flex items-center justify-center mt-0.5 shrink-0">✓</div>
                  <span><strong>Honest ATS Audits:</strong> Deterministic 4-tier sub-scores with zero artificial baselines so job seekers know their genuine keyword and bullet strength.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#DCFCE7] text-[#1F7A3D] flex items-center justify-center mt-0.5 shrink-0">✓</div>
                  <span><strong>Pixel-Perfect Design:</strong> Modern optical liquid glass aesthetics paired with recruiter-tested layouts.</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Mission & Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="level-1-card p-8 md:p-10 mb-12 shadow-md border border-[#E8DDD0]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1E6FA8] mb-3">
                <Heart size={12} /> Our Core Mission
              </div>
              <h2 className="text-2xl font-bold text-[#241C12] tracking-tight mb-3">
                Level the playing field for every candidate.
              </h2>
              <p className="text-xs text-[#5C4E3E] leading-relaxed font-medium">
                We believe every student deserves a professional, ATS-optimized resume — regardless of their design skills or budget. SmartCV is crafted to provide top-tier career engineering tools without friction.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { value: '12+', label: 'Recruiter Templates', icon: Layers },
                { value: '100%', label: 'Free Forever', icon: Heart },
                { value: 'AI', label: 'Assisted Content', icon: Sparkles },
                { value: 'A4', label: 'Vector PDF Engine', icon: Shield },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="level-2-nested p-4 text-center rounded-2xl shadow-xs border border-[#E8DDD0]"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center mx-auto mb-2 text-[#C2600E]">
                    <stat.icon size={15} />
                  </div>
                  <div className="text-2xl font-black text-[#241C12]">{stat.value}</div>
                  <div className="text-[11px] text-[#5C4E3E] font-medium mt-0.5">{stat.label}</div>
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
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#C2600E] mb-2">
              <Code2 size={12} /> Tech Stack Architecture
            </div>
            <h2 className="text-2xl font-bold text-[#241C12] tracking-tight">Built with modern, production-grade technologies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="level-1-card p-5 shadow-xs hover:-translate-y-0.5 transition-transform border border-[#E8DDD0]"
              >
                <div className={`h-10 w-10 rounded-2xl ${tech.color} flex items-center justify-center mb-3 shadow-xs`}>
                  <tech.icon size={18} className={tech.textColor} />
                </div>
                <h3 className="text-sm font-bold text-[#241C12] mb-1">{tech.name}</h3>
                <p className="text-xs text-[#5C4E3E] leading-relaxed font-medium">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </main>
    </div>
  );
}
