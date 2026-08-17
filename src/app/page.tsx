'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, Check, Shield, Cpu,
  ChevronDown, FileText, Zap, Target,
  BarChart2, CheckCircle, Building2, Menu, X, Download,
  Brain, Rocket, LayoutTemplate, ChevronRight,
  GraduationCap, Briefcase, Users
} from 'lucide-react';
import { Button, Badge, ATSRing, Card } from '@/components/ui/design-system';
import { ColorMeshBackdrop } from '@/components/ui/ColorMeshBackdrop';
import TemplateRenderer from '@/components/TemplateRenderer';
import A4ResumePreview from '@/components/A4ResumePreview';

// ── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = ['Features', 'Templates', 'How It Works', 'About'];

const FAQS = [
  { q: 'Is SmartCV completely free?', a: 'Yes — SmartCV is free for everyone. No credit card, no hidden fees, no premium tier. Build, customize, and export as many resumes as you need.' },
  { q: 'How does the AI resume optimization work?', a: 'Our AI analyzes your resume against industry standards, rewrites weak bullet points with action verbs, adds impactful keywords, and structures your experience for maximum clarity.' },
  { q: 'Will my resume pass ATS systems?', a: 'Our templates are built specifically to pass Applicant Tracking Systems. We check formatting, keywords, section structure, and more in real-time as you type.' },
  { q: 'Can I import my existing resume?', a: 'Absolutely. Upload your PDF or DOCX and SmartCV will extract your information automatically. Then refine and enhance it with our builder tools.' },
  { q: 'How many templates are available?', a: 'SmartCV offers 12+ professionally designed templates across styles — minimal, creative, corporate, tech, and academic — all ATS-optimized and recruiter-approved.' },
];

const SKILL_BARS = [
  { skill: 'React', match: 95, color: 'bg-[#1E6FA8]' },
  { skill: 'TypeScript', match: 88, color: 'bg-[#C2600E]' },
  { skill: 'Node.js', match: 72, color: 'bg-[#1F7A3D]' },
  { skill: 'Docker', match: 45, color: 'bg-[#B23A2E]' },
];

const ATS_PANELS = [
  { label: 'ATS Score', value: '92', unit: '/100', color: 'text-[#1F7A3D]', bar: 92, barColor: 'bg-[#1F7A3D]' },
  { label: 'Keyword Match', value: '87', unit: '%', color: 'text-[#1E6FA8]', bar: 87, barColor: 'bg-[#1E6FA8]' },
  { label: 'Formatting', value: '100', unit: '%', color: 'text-[#C2600E]', bar: 100, barColor: 'bg-[#C2600E]' },
  { label: 'Readability', value: '94', unit: '%', color: 'text-[#14587E]', bar: 94, barColor: 'bg-[#14587E]' },
];

const TEMPLATE_CARDS = [
  { name: 'ATS Professional', ats: 98, tag: 'Most Popular', tagColor: 'bg-[#C7E1F0]/30 text-[#1E6FA8] border-[#C7E1F0]', accent: '#1E6FA8' },
  { name: 'FAANG Elite', ats: 99, tag: 'Top Rated', tagColor: 'bg-[#F2D9B8]/30 text-[#C2600E] border-[#F2D9B8]', accent: '#C2600E' },
  { name: 'Tech Minimal', ats: 97, tag: 'Trending', tagColor: 'bg-[#C7E1F0]/30 text-[#14587E] border-[#C7E1F0]', accent: '#14587E' },
  { name: 'Executive Pro', ats: 96, tag: 'New', tagColor: 'bg-[#F2D9B8]/30 text-[#9C4A08] border-[#F2D9B8]', accent: '#9C4A08' },
];

const TRUSTED_BY = [
  { label: 'University Students', Icon: GraduationCap },
  { label: 'Fresh Graduates', Icon: Briefcase },
  { label: 'Job Seekers', Icon: Building2 },
  { label: 'Career Switchers', Icon: Rocket },
  { label: 'Tech Professionals', Icon: Brain },
  { label: 'Working Professionals', Icon: Users },
];

const HOW_STEPS = [
  { step: '01', Icon: FileText, bg: 'bg-[#C7E1F0]/25 border-[#C7E1F0]', color: 'text-[#1E6FA8]', title: 'Import or Create', desc: 'Upload your existing resume or start fresh. AI extracts and organizes everything instantly.' },
  { step: '02', Icon: Sparkles, bg: 'bg-[#F2D9B8]/25 border-[#F2D9B8]', color: 'text-[#C2600E]', title: 'AI Optimizes', desc: 'Our AI rewrites bullets, adds keywords, and gives you a live ATS score as you type.' },
  { step: '03', Icon: Download, bg: 'bg-[#DCFCE7]/25 border-[#86EFAC]/60', color: 'text-[#1F7A3D]', title: 'Export and Apply', desc: 'Export a pixel-perfect PDF that beats ATS filters and impresses human reviewers.' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-[#172B4D] overflow-x-hidden relative color-mesh-backdrop" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <ColorMeshBackdrop />

      {/* ── FLOATING LIQUID GLASS NAVBAR ── */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 max-w-7xl mx-auto pointer-events-none">
        <div className="liquid-glass-surface rounded-[28px] px-5 py-2.5 flex items-center justify-between shadow-lg pointer-events-auto border border-white/80">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white/70 border border-white/80 flex items-center justify-center shadow-xs">
              <img src="/SmartCV_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[16px] font-black tracking-tight text-[#172B4D]">SmartCV</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-white/50 p-1 rounded-full border border-white/60">
            {NAV_LINKS.map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-1.5 text-xs font-bold text-[#405A73] hover:text-[#172B4D] rounded-full hover:bg-white/70 transition-all duration-150"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/auth?mode=signin">
              <Button variant="ghost" size="sm" className="text-[#405A73] hover:text-[#172B4D] font-bold">Sign In</Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button variant="primary" size="sm" className="bg-[#C2600E] text-white hover:bg-[#9C4A08] font-bold shadow-md">
                Get Started Free <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-full bg-white/60 border border-white/80 flex items-center justify-center text-[#405A73] transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 overflow-hidden bg-white/95 border border-white/80 rounded-2xl p-4 shadow-xl pointer-events-auto backdrop-blur-md"
            >
              <div className="space-y-1">
                {NAV_LINKS.map(link => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-xs font-bold text-[#405A73] hover:text-[#172B4D] hover:bg-[#F5EFEB] rounded-xl transition-colors"
                  >
                    {link}
                  </a>
                ))}
                <div className="pt-3 flex flex-col gap-2">
                  <Link href="/auth?mode=signin" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full bg-[#F5EFEB] text-[#172B4D] border-[#E8DDD0]">Sign In</Button>
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full bg-[#C2600E] hover:bg-[#9C4A08] text-white font-bold">Get Started Free</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── 1. HERO SECTION (Ivory Light Band #FFFEF9) ── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden min-h-[92vh] flex items-center band-ivory color-mesh-backdrop">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left — Copy */}
            <div className="lg:col-span-6 flex flex-col gap-7">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCE3C7] border border-[#F4B77E] text-[#C2600E] text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#C2600E] animate-pulse shadow-xs" />
                  Free · No account required to browse · Built for students
                </span>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <h1 className="text-5xl sm:text-6xl lg:text-[4.2rem] font-black text-[#241C12] leading-[1.07] tracking-tight">
                  Build a Resume<br />
                  <span className="text-[#C2600E]">
                    Recruiters Notice.
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-[#5C4E3E] leading-relaxed max-w-lg font-medium"
              >
                SmartCV gives students and freshers a polished, ATS-optimized resume in minutes. Real-time optical preview, AI-assisted bullet rewriting, and 12+ industry layouts.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link href="/auth?mode=signup">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto bg-[#C2600E] hover:bg-[#9C4A08] text-white font-bold shadow-md">
                    Start Building Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#templates">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white border-[#E8DDD0] text-[#241C12] font-bold hover:bg-[#F5EFEB] shadow-xs">Browse Templates</Button>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8DDD0] text-xs font-bold text-[#241C12] shadow-xs">
                  <CheckCircle className="h-4 w-4 text-[#1F7A3D]" />
                  <span>Real-Time Canvas Editor & ATS Optimization</span>
                </div>
              </motion.div>
            </div>

            {/* Right — Liquid Glass Browser Mockup with Crisp Resume Preview */}
            <div className="lg:col-span-6 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="liquid-glass-surface rounded-3xl p-4 sm:p-5 border border-white/80 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/60">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-400 shadow-xs" />
                      <div className="w-3 h-3 rounded-full bg-amber-400 shadow-xs" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-xs" />
                    </div>
                    <div className="flex-1 mx-2 bg-white/50 border border-white/70 rounded-full px-3 py-1 text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Shield className="h-3 w-3 text-[#C2600E]" /> smartcv.app/builder
                    </div>
                    <div className="text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">Saved ✓</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2.5">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">// Personal Info</div>
                      <div className="h-8 bg-white/70 rounded-xl border border-slate-200/80 flex items-center px-2.5 shadow-xs"><div className="h-2 bg-slate-300 rounded-full w-3/4" /></div>
                      <div className="h-8 bg-white/70 rounded-xl border border-slate-200/80 flex items-center px-2.5 shadow-xs"><div className="h-2 bg-slate-300 rounded-full w-1/2" /></div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-2">// Experience</div>
                      <div className="h-8 bg-[#FCE3C7] border border-[#F4B77E] rounded-xl flex items-center px-2.5"><div className="h-2 bg-[#C2600E] rounded-full w-4/5" /></div>
                      <div className="h-8 bg-white/70 rounded-xl border border-slate-200/80 flex items-center px-2.5 shadow-xs"><div className="h-2 bg-slate-300 rounded-full w-2/3" /></div>
                    </div>

                    {/* Sharp Solid Paper Inside Glass Container */}
                    <div className="resume-paper rounded-xl border border-slate-200/80 p-3 shadow-md">
                      <div className="h-3.5 w-2/3 bg-slate-800 rounded mb-1" />
                      <div className="h-2 w-1/2 bg-slate-400 rounded mb-1.5" />
                      <div className="h-px bg-slate-100 my-2" />
                      <div className="space-y-1 mb-2">
                        <div className="h-1.5 bg-slate-200 rounded w-full" />
                        <div className="h-1.5 bg-slate-200 rounded w-5/6" />
                        <div className="h-1.5 bg-slate-200 rounded w-4/6" />
                      </div>
                      <div className="mt-2.5 flex gap-1 flex-wrap">
                        {['React', 'TS', 'Node'].map(t => (
                          <span key={t} className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-3 bg-white border border-[#E8DDD0] rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-lg"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-[#1F7A3D]" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-[#5C4E3E]">ATS Score</div>
                    <div className="text-sm font-black text-[#1F7A3D] leading-none">98/100</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-4 -left-3 bg-white border border-[#E8DDD0] rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-lg max-w-[190px]"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#C2600E] flex items-center justify-center shrink-0 shadow-xs">
                    <Cpu className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#241C12]">AI Suggestion</div>
                    <div className="text-[9px] text-[#5C4E3E] font-medium">Action verb improved ✓</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUSTED BY & BENTO FEATURES (Sky Tint Mid Band #C8D9E6) ── */}
      <section id="features" className="py-20 px-6 band-sky">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Trusted By strip */}
          <div className="bg-white/85 backdrop-blur-sm border border-white/90 rounded-3xl p-6 shadow-md">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[#567C8D] mb-6">
              Built for every stage of your career journey
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {TRUSTED_BY.map(({ label, Icon }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center gap-2 text-center p-2.5 rounded-2xl hover:bg-[#F5EFEB] transition-all duration-200 group cursor-default"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FCE3C7] border border-[#F4B77E] flex items-center justify-center text-[#C2600E] shadow-xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#241C12] group-hover:text-[#C2600E] transition-colors leading-tight">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '12+', label: 'ATS Templates', Icon: LayoutTemplate },
              { value: 'AI', label: 'Smart Optimization', Icon: Cpu },
              { value: 'Real-Time', label: 'ATS Analysis', Icon: BarChart2 },
              { value: '100%', label: 'Free Platform', Icon: Shield },
            ].map(({ value, label, Icon }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-white/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FCE3C7] border border-[#F4B77E] flex items-center justify-center text-[#C2600E] mb-3 shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-black text-[#241C12] tracking-tight">{value}</div>
                <div className="text-xs font-bold text-[#567C8D] mt-0.5">{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Bento Features Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center pt-6 max-w-2xl mx-auto"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#9BC4DE] text-[11px] font-bold text-[#1E6FA8] mb-3 shadow-xs">Core Features</span>
            <h2 className="text-4xl font-black text-[#241C12] tracking-tight mb-3">
              Engineered for{' '}
              <span className="text-[#C2600E]">
                Career Growth
              </span>
            </h2>
            <p className="text-[#3A4D5F] text-base leading-relaxed font-medium">
              Intelligent tools that take the guesswork out of resume creation. Know exactly how strong your resume is before you apply.
            </p>
          </motion.div>

          {/* Bento Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* AI Optimization */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
              className="md:col-span-8 bg-white border border-white/90 rounded-3xl p-7 group overflow-hidden shadow-md">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#FCE3C7] border border-[#F4B77E] flex items-center justify-center text-[#C2600E]"><Cpu className="h-6 w-6" /></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FCE3C7] text-[#C2600E] border border-[#F4B77E]">AI-Powered</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#241C12] mb-2">AI Resume Optimization</h3>
              <p className="text-xs text-[#5C4E3E] leading-relaxed mb-5 font-medium">Upload your existing resume and our AI rewrites it for maximum impact — stronger verbs, quantified achievements, perfectly structured experience.</p>
              <ul className="space-y-2 mb-5">
                {['Context-aware bullet rewriting', 'Action verb optimization', 'Keyword density tuning for ATS'].map((b, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs font-bold text-[#241C12]"><Check className="h-4 w-4 text-[#1F7A3D] shrink-0" />{b}</li>
                ))}
              </ul>
              <div className="bg-[#F5EFEB] rounded-2xl p-4 space-y-2.5 border border-[#E8DDD0]">
                {[{ r: 'Software Engineer', s: 98, m: 94 }, { r: 'Product Manager', s: 95, m: 91 }, { r: 'UX Designer', s: 92, m: 88 }].map((x, j) => (
                  <div key={j} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#E8DDD0] shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-[#C2600E] flex items-center justify-center text-white text-xs font-bold shrink-0">{x.r[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#241C12] truncate">{x.r}</div>
                      <div className="text-[10px] text-[#5C4E3E] font-medium">Match: {x.m}%</div>
                    </div>
                    <div className="text-sm font-black text-[#1F7A3D] shrink-0">{x.s}%</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ATS Score */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="md:col-span-4 bg-white border border-white/90 rounded-3xl p-7 group overflow-hidden shadow-md">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#1F7A3D]"><Target className="h-6 w-6" /></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#1F7A3D] border border-[#86EFAC]">Real-Time</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#241C12] mb-2">ATS Score</h3>
              <p className="text-xs text-[#5C4E3E] leading-relaxed mb-5 font-medium">See exactly how your resume scores before you apply.</p>
              <div className="bg-[#F5EFEB] rounded-2xl p-4 flex flex-col items-center gap-3 py-6 border border-[#E8DDD0]">
                <ATSRing score={92} size={90} />
                <div className="text-center">
                  <div className="text-xs font-bold text-[#241C12]">Excellent</div>
                  <div className="text-[10px] text-[#5C4E3E] font-medium">Ready for submission</div>
                </div>
              </div>
            </motion.div>

            {/* Templates */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="md:col-span-4 bg-white border border-white/90 rounded-3xl p-7 group overflow-hidden shadow-md">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#B5790C]"><LayoutTemplate className="h-6 w-6" /></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B5790C] border border-[#FDE68A]">12+ Templates</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#241C12] mb-2">Recruiter Layouts</h3>
              <p className="text-xs text-[#5C4E3E] leading-relaxed mb-5 font-medium">ATS-optimized templates for every industry.</p>
              <div className="bg-[#F5EFEB] rounded-2xl p-4 flex gap-2 items-end justify-center py-6 border border-[#E8DDD0]">
                <div className="w-14 aspect-[210/297] rounded-lg opacity-60 -rotate-6 translate-x-2 shadow-sm overflow-hidden resume-paper border border-slate-200">
                  <div className="scale-[0.07] origin-top-left pointer-events-none" style={{ width: '794px', height: '1123px', position: 'relative', left: '0px', top: '0px' }}>
                    <TemplateRenderer templateId="tech-minimal" zoom={100} />
                  </div>
                </div>
                <div className="w-16 aspect-[210/297] rounded-lg shadow-lg z-10 overflow-hidden border-2 border-[#C2600E] resume-paper">
                  <div className="scale-[0.08] origin-top-left pointer-events-none" style={{ width: '794px', height: '1123px', position: 'relative', left: '0px', top: '0px' }}>
                    <TemplateRenderer templateId="ats-professional" zoom={100} />
                  </div>
                </div>
                <div className="w-14 aspect-[210/297] rounded-lg opacity-60 rotate-6 -translate-x-2 shadow-sm overflow-hidden resume-paper border border-slate-200">
                  <div className="scale-[0.07] origin-top-left pointer-events-none" style={{ width: '794px', height: '1123px', position: 'relative', left: '0px', top: '0px' }}>
                    <TemplateRenderer templateId="faang-elite" zoom={100} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skill Gap */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="md:col-span-8 bg-white border border-white/90 rounded-3xl p-7 group overflow-hidden shadow-md">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#1F7A3D]"><BarChart2 className="h-6 w-6" /></div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#1F7A3D] border border-[#86EFAC]">Analysis</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#241C12] mb-2">Skill Gap Analysis</h3>
              <p className="text-xs text-[#5C4E3E] leading-relaxed mb-5 font-medium">Paste a job description and our AI highlights missing keywords and skills with natural suggestions to incorporate them.</p>
              <div className="bg-[#F5EFEB] rounded-2xl p-4 space-y-2.5 border border-[#E8DDD0]">
                {SKILL_BARS.map((s, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-[#241C12] w-20 shrink-0">{s.skill}</span>
                    <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-[#E8DDD0] p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.match}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: j * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${s.color}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#5C4E3E] w-8 text-right shrink-0">{s.match}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS (Deep Ocean Dark Anchor Band #0B5497) ── */}
      <section id="how-it-works" className="py-24 px-6 band-ocean relative overflow-hidden">
        {/* Subtle background refraction glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#C2600E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 border border-white/30 text-[11px] font-bold text-[#FFFEF9] mb-3.5 shadow-xs">How It Works</span>
            <h2 className="text-4xl font-black text-[#FFFEF9] tracking-tight mb-3">Ready in three simple steps</h2>
            <p className="text-ocean-secondary text-base font-medium max-w-lg mx-auto">From a blank canvas to an interview-ready ATS resume in under five minutes.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="bg-[#083E70] border border-white/20 rounded-3xl p-8 text-center shadow-xl hover:border-white/40 transition-all">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center shadow-inner">
                    <s.Icon className="h-7 w-7 text-[#FFFEF9]" />
                  </div>
                </div>
                <div className="text-4xl font-black text-[#C2600E] mb-2 tracking-tight">{s.step}</div>
                <h3 className="text-lg font-bold text-[#FFFEF9] mb-2">{s.title}</h3>
                <p className="text-xs text-ocean-secondary leading-relaxed font-medium">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. ATS CHECKER / STATS (Warm Beige Light Band #F5EFEB) ── */}
      <section className="py-20 px-6 band-warm-beige">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[11px] font-bold text-[#1F7A3D] mb-4">ATS Intelligence</span>
              <h2 className="text-4xl font-black text-[#241C12] tracking-tight mb-4">
                Know your score<br />
                <span className="text-[#1F7A3D]">
                  before you apply.
                </span>
              </h2>
              <p className="text-[#5C4E3E] text-base leading-relaxed mb-6 font-medium">
                SmartCV&apos;s ATS checker analyzes your resume across multiple dimensions and shows you exactly what to fix before you hit submit.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Real-time keyword match vs job descriptions',
                  'Formatting compatibility check',
                  'Recruiter readability score',
                  'One-click improvement suggestions',
                ].map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-[#241C12]">
                    <div className="w-5 h-5 rounded-full bg-white border border-[#86EFAC] flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-[#1F7A3D]" />
                    </div>
                    {pt}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup">
                <Button variant="primary" size="md" className="bg-[#1F7A3D] hover:bg-[#166B32] text-white font-bold shadow-md">Try ATS Checker Free <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="bg-white border border-[#E8DDD0] rounded-3xl p-7 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#9A8C7E]">ATS Analysis</div>
                    <div className="text-sm font-bold text-[#241C12] mt-0.5">Frontend Developer Resume</div>
                  </div>
                  <div className="text-xs font-bold text-[#1F7A3D] bg-[#DCFCE7] border border-[#86EFAC] px-3 py-1 rounded-full">ATS Ready</div>
                </div>
                <div className="space-y-3.5">
                  {ATS_PANELS.map((panel, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.15 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#5C4E3E]">{panel.label}</span>
                        <span className={`text-xs font-black ${panel.color}`}>{panel.value}{panel.unit}</span>
                      </div>
                      <div className="h-1.5 bg-[#F5EFEB] rounded-full overflow-hidden p-0.5 border border-[#E8DDD0]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${panel.bar}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                          className={`h-full rounded-full ${panel.barColor}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-[#E8DDD0]">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[#9A8C7E] mb-2.5">Quick Fixes</div>
                  <div className="space-y-2">
                    {['Add "Agile" to skills section', 'Quantify achievement in line 3', 'Move summary above experience'].map((fix, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-[#241C12] p-2.5 bg-[#F5EFEB] rounded-xl border border-[#E8DDD0] font-bold">
                        <Zap className="h-3.5 w-3.5 text-[#C2600E] shrink-0" />{fix}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. TEMPLATES PREVIEW (Ivory Light Band #FFFEF9) ── */}
      <section id="templates" className="py-20 px-6 band-ivory">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE3C7] border border-[#F4B77E] text-[11px] font-bold text-[#C2600E] mb-3">Templates</span>
              <h2 className="text-4xl font-black text-[#241C12] tracking-tight">
                Designs that get<br />
                <span className="text-[#C2600E]">
                  you noticed.
                </span>
              </h2>
            </div>
            <Link href="/templates">
              <Button variant="secondary" size="md" className="bg-white border-[#E8DDD0] text-[#241C12] font-bold hover:bg-[#F5EFEB]">Browse All Templates <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEMPLATE_CARDS.map((tmpl, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative bg-white border border-[#E8DDD0] rounded-2xl p-4 overflow-hidden shadow-sm hover:-translate-y-1 hover:border-[#C2600E] cursor-pointer transition-all">
                <span className={`absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tmpl.tagColor} z-20`}>{tmpl.tag}</span>
                {/* Exact A4 Portrait Box */}
                <div className="w-full aspect-[210/297] rounded-xl border border-slate-200 bg-[#F5EFEB] mb-3.5 shadow-xs relative overflow-hidden">
                  <A4ResumePreview templateId={tmpl.name === 'ATS Professional' ? 'ats-professional' : tmpl.name === 'FAANG Elite' ? 'faang-elite' : tmpl.name === 'Tech Minimal' ? 'tech-minimal' : 'executive-pro'} />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl backdrop-blur-xs">
                    <Link href="/templates">
                      <button className="text-[10px] font-bold px-3.5 py-1.5 shadow-md text-white bg-[#C2600E] hover:bg-[#9C4A08] rounded-full">Use Template</button>
                    </Link>
                  </div>
                </div>
                <div className="text-xs font-bold text-[#241C12] mb-1">{tmpl.name}</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1F7A3D]" />
                  <span className="text-[10px] font-bold text-[#1F7A3D]">ATS {tmpl.ats}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CAPABILITIES & FAQ (Sky Tint Mid Band #C8D9E6) ── */}
      <section className="py-20 px-6 band-sky">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Capabilities */}
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#9BC4DE] text-[11px] font-bold text-[#1E6FA8] mb-3 shadow-xs">Capabilities</span>
              <h2 className="text-4xl font-black text-[#241C12] tracking-tight mb-2">Built with features that empower your search</h2>
              <p className="text-[#3A4D5F] text-base font-medium">Real tools designed to help you build and refine your resume.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: 'Real-Time Canvas Editing',
                  desc: 'Instantly preview layout modifications, formatting choices, and live updates as you build.',
                  icon: LayoutTemplate,
                  color: 'bg-[#C2600E]'
                },
                {
                  title: 'AI Resume Optimization',
                  desc: 'Leverage smart content suggestions to improve action verbs, structure, and professional summary impact.',
                  icon: Cpu,
                  color: 'bg-[#1E6FA8]'
                },
                {
                  title: 'ATS Compatibility & Scoring',
                  desc: 'Analyze keyword density, formatting compliance, and readiness for automated applicant tracking systems.',
                  icon: Target,
                  color: 'bg-[#1F7A3D]'
                }
              ].map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-white border border-white/90 rounded-3xl p-7 shadow-md flex flex-col justify-between">
                  <div>
                    <div className={`w-11 h-11 rounded-2xl ${feature.color} flex items-center justify-center text-white mb-5 shadow-xs`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#241C12] mb-1.5">{feature.title}</h3>
                    <p className="text-xs text-[#5C4E3E] leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto pt-6">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#9BC4DE] text-[11px] font-bold text-[#1E6FA8] mb-3 shadow-xs">FAQ</span>
              <h2 className="text-4xl font-black text-[#241C12] tracking-tight">Frequently asked questions</h2>
            </motion.div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <div onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="bg-white border border-white/90 rounded-2xl p-5 cursor-pointer shadow-sm hover:border-[#C2600E] transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-[#241C12] text-sm">{faq.q}</span>
                      <motion.div animate={{ rotate: faqOpen === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {faqOpen === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <p className="mt-3 text-xs text-[#5C4E3E] leading-relaxed font-medium border-t border-slate-100 pt-3">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── 7. ABOUT & DEVELOPER STORY (#about Band - Warm Sand/Ivory #FFFEF9) ── */}
      <section id="about" className="py-24 px-6 band-ivory border-t border-[#E8DDD0] relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCE3C7] border border-[#F4B77E] text-[11px] font-bold text-[#C2600E] mb-3.5 shadow-xs">About SmartCV</span>
            <h2 className="text-4xl font-black text-[#241C12] tracking-tight mb-3">Built with purpose, free forever</h2>
            <p className="text-[#5C4E3E] text-base font-medium max-w-xl mx-auto">
              Empowering students, fresh graduates, and career switchers with free, honest AI career engineering tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Developer Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:col-span-5 level-1-card p-8 text-center shadow-lg border border-[#E8DDD0] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C2600E]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C2600E] to-[#E67E22] text-white flex items-center justify-center text-3xl font-black shadow-md border-4 border-white mx-auto mb-4">
                VK
              </div>
              <h3 className="text-xl font-black text-[#241C12]">Vamsi Krishna Tadisetti</h3>
              <p className="text-xs font-bold text-[#C2600E] mt-0.5">Creator &amp; Full Stack Software Engineer</p>

              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full badge-emerald text-[10px] font-bold shadow-xs">
                  <CheckCircle className="h-3 w-3" /> Project Creator
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full badge-sky text-[10px] font-bold shadow-xs">
                  <Brain className="h-3 w-3" /> AI Architect
                </span>
              </div>

              <p className="text-xs text-[#5C4E3E] leading-relaxed font-medium mt-5 text-center">
                Dedicated to making professional ATS-optimized resume creation accessible to everyone without deceptive paywalls or fake scores.
              </p>

              <div className="mt-6 pt-5 border-t border-[#E8DDD0] flex justify-center">
                <Link href="/about">
                  <Button variant="secondary" size="sm" className="bg-white border-[#E8DDD0] text-[#241C12] font-bold hover:bg-[#F5EFEB]">
                    Read Developer Story <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Core Values / Features */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="lg:col-span-7 space-y-4">
              {[
                {
                  title: '100% Free & Unrestricted Exports',
                  desc: 'Every template, AI rewrite, and A4 PDF export is completely free with no paywalls or watermark traps.',
                  color: 'text-[#1F7A3D]',
                  bg: 'bg-[#DCFCE7]',
                  border: 'border-[#86EFAC]'
                },
                {
                  title: 'Honest, Evidence-Based ATS Audits',
                  desc: 'No inflated fake 99% scores. Transparent 4-tier sub-score breakdown based on actual keyword overlap and bullet metrics.',
                  color: 'text-[#C2600E]',
                  bg: 'bg-[#FCE3C7]',
                  border: 'border-[#F4B77E]'
                },
                {
                  title: 'Production-Grade Optical UI',
                  desc: 'Built with Next.js 16, Supabase, TypeScript, and a handcrafted optical liquid glass design system.',
                  color: 'text-[#1E6FA8]',
                  bg: 'bg-[#C7E1F0]',
                  border: 'border-[#9BC4DE]'
                }
              ].map((item, idx) => (
                <div key={idx} className="level-1-card p-5 border border-[#E8DDD0] shadow-xs flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl ${item.bg} border ${item.border} ${item.color} flex items-center justify-center shrink-0 shadow-xs font-bold text-sm`}>
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241C12] mb-1">{item.title}</h4>
                    <p className="text-xs text-[#5C4E3E] leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 8. FINAL CTA (Deep Ocean Dark Anchor Band #0B5497) ── */}
      <section className="py-24 px-6 band-ocean relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center text-white bg-[#083E70] border border-white/20 shadow-2xl">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-[#FFFEF9] text-xs font-bold mb-6">
                <Rocket className="h-3.5 w-3.5 text-[#C8D9E6]" /> 100% Free · No credit card required
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-[#FFFEF9]">
                Start building your<br />dream resume today.
              </h2>
              <p className="text-ocean-secondary text-base mb-8 max-w-xl mx-auto font-medium">
                Build ATS-ready resumes with real-time feedback, AI optimization, and custom templates. No hidden fees. No limits.
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                <Link href="/auth?mode=signup">
                  <Button variant="primary" size="lg" className="bg-[#C2600E] text-white hover:bg-[#9C4A08] font-bold shadow-lg">
                    Create My Resume <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#templates">
                  <Button variant="ghost" size="lg" className="text-white border border-white/30 hover:bg-white/10 font-bold">Browse Templates</Button>
                </Link>
              </div>
              <p className="text-ocean-muted text-xs mt-6 font-medium">No credit card · No subscription · No nonsense</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 9. FOOTER (Near-Black Navy Final Anchor #082D4D) ── */}
      <footer className="py-12 px-6 band-footer text-[#FFFEF9] border-t border-white/10">
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xs">
                  <img src="/SmartCV_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                </div>
                <span className="text-[17px] font-black tracking-tight text-[#FFFEF9]">SmartCV</span>
              </div>
              <p className="text-xs text-ocean-secondary leading-relaxed max-w-xs font-medium mb-3">
                The free, AI-powered resume builder for students and freshers. Build ATS-ready resumes that actually get you interviews.
              </p>
              <p className="text-xs text-ocean-secondary font-medium">
                Crafted &amp; Engineered by <span className="text-[#FFFEF9] font-bold">Vamsi Krishna Tadisetti</span>
              </p>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#C8D9E6] mb-4">Product</div>
              <div className="space-y-2.5">
                {[{ label: 'Features', href: '#features' }, { label: 'Templates', href: '/templates' }, { label: 'ATS Checker', href: '/auth?mode=signup' }, { label: 'Resume Builder', href: '/auth?mode=signup' }, { label: 'Import Resume', href: '/auth?mode=signup' }].map(l => (
                  <a key={l.label} href={l.href} className="block text-xs font-semibold text-ocean-secondary hover:text-white transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#C8D9E6] mb-4">Company</div>
              <div className="space-y-2.5">
                {[{ label: 'About', href: '/about' }, { label: 'Developer Story', href: '/about' }, { label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }].map(l => (
                  <a key={l.label} href={l.href} className="block text-xs font-semibold text-ocean-secondary hover:text-white transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-ocean-secondary font-medium">© 2025 SmartCV. Designed &amp; Developed by <strong className="text-white">Vamsi Krishna Tadisetti</strong>.</p>
            <p className="text-xs text-ocean-secondary font-medium">Free forever · No premium · No subscriptions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
