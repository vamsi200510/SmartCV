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
import { MouseGlow, AnimatedShader, Button, Badge, ATSRing } from '@/components/ui/design-system';
import TemplateRenderer from '@/components/TemplateRenderer';

// ── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = ['Features', 'Templates', 'How It Works', 'About'];

const _REVIEWS = [
  {
    name: 'Priya S.', role: 'Software Engineer @ Google', initials: 'PS',
    color: 'from-blue-500 to-indigo-600', rating: 5,
    text: 'SmartCV helped me land my dream job at Google. The ATS score feature is a game-changer — I knew exactly what to fix before applying.',
  },
  {
    name: 'Rahul M.', role: 'Product Manager @ Flipkart', initials: 'RM',
    color: 'from-purple-500 to-fuchsia-600', rating: 5,
    text: 'I went from zero callbacks to 8 interviews in 2 weeks after rebuilding my resume with SmartCV. The AI suggestions were spot-on.',
  },
  {
    name: 'Ananya K.', role: 'UX Designer @ Razorpay', initials: 'AK',
    color: 'from-cyan-500 to-blue-600', rating: 5,
    text: 'The templates are gorgeous and the customization is unmatched. My resume finally looks like a premium product, not a Word doc.',
  },
];

const FAQS = [
  { q: 'Is SmartCV completely free?', a: 'Yes — SmartCV is free for everyone. No credit card, no hidden fees, no premium tier. Build, customize, and export as many resumes as you need.' },
  { q: 'How does the AI resume optimization work?', a: 'Our AI analyzes your resume against industry standards, rewrites weak bullet points with action verbs, adds impactful keywords, and structures your experience for maximum clarity.' },
  { q: 'Will my resume pass ATS systems?', a: 'Our templates are built specifically to pass Applicant Tracking Systems. We check formatting, keywords, section structure, and more in real-time as you type.' },
  { q: 'Can I import my existing resume?', a: 'Absolutely. Upload your PDF or DOCX and SmartCV will extract your information automatically. Then refine and enhance it with our builder tools.' },
  { q: 'How many templates are available?', a: 'SmartCV offers 12+ professionally designed templates across styles — minimal, creative, corporate, tech, and academic — all ATS-optimized and recruiter-approved.' },
];

const SKILL_BARS = [
  { skill: 'React', match: 95, color: 'bg-blue-500' },
  { skill: 'TypeScript', match: 88, color: 'bg-purple-500' },
  { skill: 'Node.js', match: 72, color: 'bg-amber-500' },
  { skill: 'Docker', match: 45, color: 'bg-red-400' },
];

const ATS_PANELS = [
  { label: 'ATS Score', value: '92', unit: '/100', color: 'text-emerald-600', bar: 92, barColor: 'bg-emerald-500' },
  { label: 'Keyword Match', value: '87', unit: '%', color: 'text-blue-600', bar: 87, barColor: 'bg-blue-500' },
  { label: 'Formatting', value: '100', unit: '%', color: 'text-purple-600', bar: 100, barColor: 'bg-purple-500' },
  { label: 'Readability', value: '94', unit: '%', color: 'text-cyan-600', bar: 94, barColor: 'bg-cyan-500' },
];

const TEMPLATE_CARDS = [
  { name: 'ATS Professional', ats: 98, tag: 'Most Popular', tagColor: 'bg-blue-100 text-blue-700', accent: '#2563EB' },
  { name: 'FAANG Elite', ats: 99, tag: 'Top Rated', tagColor: 'bg-purple-100 text-purple-700', accent: '#7C3AED' },
  { name: 'Tech Minimal', ats: 97, tag: 'Trending', tagColor: 'bg-cyan-100 text-cyan-700', accent: '#0891B2' },
  { name: 'Executive Pro', ats: 96, tag: 'New', tagColor: 'bg-amber-100 text-amber-700', accent: '#D97706' },
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
  { step: '01', Icon: FileText, bg: 'bg-blue-50 border-blue-100', color: 'text-blue-600', title: 'Import or Create', desc: 'Upload your existing resume or start fresh. AI extracts and organizes everything instantly.' },
  { step: '02', Icon: Sparkles, bg: 'bg-violet-50 border-violet-100', color: 'text-violet-600', title: 'AI Optimizes', desc: 'Our AI rewrites bullets, adds keywords, and gives you a live ATS score as you type.' },
  { step: '03', Icon: Download, bg: 'bg-emerald-50 border-emerald-100', color: 'text-emerald-600', title: 'Export and Apply', desc: 'Export a pixel-perfect PDF that beats ATS filters and impresses human reviewers.' },
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
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AnimatedShader />
      <MouseGlow />

      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm">
              <img src="/SmartCV_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight text-slate-900">SmartCV</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all duration-150"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth?mode=signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button variant="primary" size="sm">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden bg-white border-b border-slate-200"
            >
              <div className="px-6 py-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    {link}
                  </a>
                ))}
                <div className="pt-3 flex flex-col gap-2">
                  <Link href="/auth?mode=signin" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">Get Started Free</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden min-h-screen flex items-center">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.4 }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left — Copy */}
            <div className="lg:col-span-6 flex flex-col gap-7">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Free · No account required to browse · Built for students
                </span>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <h1 className="text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold text-slate-900 leading-[1.07] tracking-tight">
                  Build a Resume<br />
                  <span style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Recruiters Notice.
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-slate-500 leading-relaxed max-w-lg"
              >
                SmartCV gives students and freshers a polished, ATS-optimized resume in minutes. No templates that look like everyone else&apos;s.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link href="/auth?mode=signup">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Start Building Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#templates">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">Browse Templates</Button>
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Real-Time Canvas Editor & ATS Optimization</span>
                </div>
              </motion.div>
            </div>

            {/* Right — Browser mockup */}
            <div className="lg:col-span-6 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-[0_32px_80px_rgba(37,99,235,0.12)] p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 mx-2 bg-slate-100 rounded-full px-3 py-1 text-[10px] text-slate-400 flex items-center gap-1.5">
                      <Shield className="h-2.5 w-2.5" /> smartcv.app/builder
                    </div>
                    <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Saved ✓</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2.5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">// Personal Info</div>
                      <div className="h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center px-2.5"><div className="h-2 bg-slate-300 rounded w-3/4" /></div>
                      <div className="h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center px-2.5"><div className="h-2 bg-slate-300 rounded w-1/2" /></div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">// Experience</div>
                      <div className="h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center px-2.5"><div className="h-2 bg-blue-300 rounded w-4/5" /></div>
                      <div className="h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center px-2.5"><div className="h-2 bg-slate-300 rounded w-2/3" /></div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                      <div className="h-3.5 w-2/3 bg-slate-800 rounded mb-1" />
                      <div className="h-2 w-1/2 bg-slate-300 rounded mb-0.5" />
                      <div className="h-px bg-slate-100 my-2" />
                      <div className="space-y-1 mb-2">
                        <div className="h-1.5 bg-slate-200 rounded w-full" />
                        <div className="h-1.5 bg-slate-200 rounded w-5/6" />
                        <div className="h-1.5 bg-slate-200 rounded w-4/6" />
                      </div>
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {['React', 'TS', 'Node'].map(t => (
                          <span key={t} className="text-[7px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-5 -right-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500">ATS Score</div>
                    <div className="text-base font-black text-emerald-600 leading-none">98/100</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-5 -left-4 bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl max-w-[190px]"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0">
                    <Cpu className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-900">AI Suggestion</div>
                    <div className="text-[9px] text-slate-400">Action verb improved ✓</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </section>

      {/* ── TRUSTED BY ── */}
      <section className="border-y border-slate-200 bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-8">
            Built for every stage of your career journey
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {TRUSTED_BY.map(({ label, Icon }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center gap-2 text-center p-3 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-slate-800 transition-colors leading-tight">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '12+', label: 'ATS Templates', Icon: LayoutTemplate },
            { value: 'AI', label: 'Smart Optimization', Icon: Cpu },
            { value: 'Real-Time', label: 'ATS Analysis', Icon: BarChart2 },
            { value: '100%', label: 'Free Platform', Icon: Shield },
          ].map(({ value, label, Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
              <div className="text-sm text-slate-400 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <Badge variant="primary" className="mb-4">Core Features</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Engineered for{' '}
              <span style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Career Growth
              </span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              A suite of intelligent tools that takes the guesswork out of resume creation. Know exactly how strong your resume is before you apply.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* AI Optimization */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
              className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-7 group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-blue-50 border-blue-100"><Cpu className="h-6 w-6 text-blue-600" /></div>
                <Badge variant="blue">AI-Powered</Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Resume Optimization</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">Upload your existing resume and our AI rewrites it for maximum impact — stronger verbs, quantified achievements, perfectly structured experience.</p>
              <ul className="space-y-2 mb-5">
                {['Context-aware bullet rewriting', 'Action verb optimization', 'Keyword density tuning for ATS'].map((b, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-blue-600 shrink-0" />{b}</li>
                ))}
              </ul>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                {[{ r: 'Software Engineer', s: 98, m: 94 }, { r: 'Product Manager', s: 95, m: 91 }, { r: 'UX Designer', s: 92, m: 88 }].map((x, j) => (
                  <div key={j} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{x.r[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{x.r}</div>
                      <div className="text-[10px] text-slate-400">Match: {x.m}%</div>
                    </div>
                    <div className="text-sm font-black text-emerald-600 shrink-0">{x.s}%</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ATS Score */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-7 group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-purple-50 border-purple-100"><Target className="h-6 w-6 text-purple-600" /></div>
                <Badge variant="purple">Real-Time</Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">ATS Score</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">See exactly how your resume scores before you apply.</p>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-3 py-6">
                <ATSRing score={92} size={90} />
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-800">Excellent</div>
                  <div className="text-[10px] text-slate-400">Ready for submission</div>
                </div>
              </div>
            </motion.div>

            {/* Templates */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-7 group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-amber-50 border-amber-100"><LayoutTemplate className="h-6 w-6 text-amber-600" /></div>
                <Badge variant="amber">12+ Templates</Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Recruiter-Approved Layouts</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">ATS-optimized templates for every industry — from tech to finance.</p>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-2 items-end justify-center py-6">
                <div className="w-14 h-20 rounded-lg opacity-60 -rotate-6 translate-x-2 shadow-sm overflow-hidden border border-slate-200 bg-white">
                  <div className="scale-[0.065] origin-top-left pointer-events-none" style={{ width: '900px', height: '1200px', position: 'relative', left: '2px', top: '2px' }}>
                    <TemplateRenderer templateId="tech-minimal" zoom={100} />
                  </div>
                </div>
                <div className="w-16 h-24 rounded-lg shadow-lg z-10 overflow-hidden border-2 border-blue-400 bg-white">
                  <div className="scale-[0.075] origin-top-left pointer-events-none" style={{ width: '900px', height: '1200px', position: 'relative', left: '2px', top: '2px' }}>
                    <TemplateRenderer templateId="ats-professional" zoom={100} />
                  </div>
                </div>
                <div className="w-14 h-20 rounded-lg opacity-60 rotate-6 -translate-x-2 shadow-sm overflow-hidden border border-slate-200 bg-white">
                  <div className="scale-[0.065] origin-top-left pointer-events-none" style={{ width: '900px', height: '1200px', position: 'relative', left: '2px', top: '2px' }}>
                    <TemplateRenderer templateId="faang-elite" zoom={100} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skill Gap */}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-7 group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-cyan-50 border-cyan-100"><BarChart2 className="h-6 w-6 text-cyan-600" /></div>
                <Badge variant="cyan">Analysis</Badge>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Skill Gap Analysis</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">Paste a job description and our AI highlights missing keywords and skills with natural suggestions to incorporate them.</p>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
                {SKILL_BARS.map((s, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-slate-600 w-20 shrink-0">{s.skill}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.match}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: j * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${s.color}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right shrink-0">{s.match}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="purple" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Ready in three steps</h2>
            <p className="text-slate-500 text-lg">From blank page to interview-ready in minutes.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-white border border-slate-200 rounded-2xl p-7 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-center mb-5">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${s.bg}`}>
                    <s.Icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                </div>
                <div className="text-5xl font-black text-slate-100 mb-3">{s.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ATS PREVIEW ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Badge variant="cyan" className="mb-5">ATS Intelligence</Badge>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-5">
                Know your score<br />
                <span style={{ background: 'linear-gradient(135deg, #0891B2, #2563EB)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  before you apply.
                </span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                SmartCV&apos;s ATS checker analyzes your resume across multiple dimensions and shows you exactly what to fix before you hit submit.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Real-time keyword match vs job descriptions',
                  'Formatting compatibility check',
                  'Recruiter readability score',
                  'One-click improvement suggestions',
                ].map((pt, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    {pt}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup">
                <Button variant="primary" size="md">Try ATS Checker Free <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-blue-600/5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">ATS Analysis</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">Frontend Developer Resume</div>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">ATS Ready</div>
                </div>
                <div className="space-y-4">
                  {ATS_PANELS.map((panel, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.2 }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-600">{panel.label}</span>
                        <span className={`text-sm font-black ${panel.color}`}>{panel.value}{panel.unit}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${panel.bar}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                          className={`h-full rounded-full ${panel.barColor}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Quick Fixes</div>
                  <div className="space-y-2">
                    {['Add "Agile" to skills section', 'Quantify achievement in line 3', 'Move summary above experience'].map((fix, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-600 p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />{fix}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <Badge variant="amber" className="mb-4">Templates</Badge>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Designs that get<br />
                <span style={{ background: 'linear-gradient(135deg, #D97706, #EA580C)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  you noticed.
                </span>
              </h2>
            </div>
            <Link href="/auth?mode=signup">
              <Button variant="secondary" size="md">Browse All Templates <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEMPLATE_CARDS.map((tmpl, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group relative bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${tmpl.tagColor}`}>{tmpl.tag}</span>
                <div className="bg-white rounded-xl border border-slate-200 mb-4 shadow-sm h-[160px] relative overflow-hidden">
                  <div className="scale-[0.155] origin-top-left pointer-events-none" style={{ width: '900px', height: '1200px', position: 'relative', left: '4px', top: '4px' }}>
                    <TemplateRenderer templateId={tmpl.name === 'ATS Professional' ? 'ats-professional' : tmpl.name === 'FAANG Elite' ? 'faang-elite' : tmpl.name === 'Tech Minimal' ? 'tech-minimal' : 'executive-pro'} zoom={100} />
                  </div>
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl">
                    <Link href="/auth?mode=signup">
                      <button className="text-[10px] font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg shadow-md">Use Template</button>
                    </Link>
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-800 mb-1">{tmpl.name}</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-slate-500">ATS {tmpl.ats}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL PLATFORM HIGHLIGHTS ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge variant="success" className="mb-4">Capabilities</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Built with features that empower your search</h2>
            <p className="text-slate-500 text-lg">Real tools designed to help you build and refine your resume.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'Real-Time Canvas Editing',
                desc: 'Instantly preview layout modifications, formatting choices, and live updates as you build.',
                icon: LayoutTemplate,
                color: 'from-blue-500 to-indigo-600'
              },
              {
                title: 'AI Resume Optimization',
                desc: 'Leverage smart content suggestions to improve action verbs, structure, and professional summary impact.',
                icon: Cpu,
                color: 'from-purple-500 to-fuchsia-600'
              },
              {
                title: 'ATS Compatibility & Scoring',
                desc: 'Analyze keyword density, formatting compliance, and readiness for automated applicant tracking systems.',
                icon: Target,
                color: 'from-cyan-500 to-blue-600'
              }
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <Badge variant="cyan" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Frequently asked questions</h2>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-900 text-sm">{faq.q}</span>
                    <motion.div animate={{ rotate: faqOpen === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {faqOpen === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <p className="mt-3 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5, #7C3AED)' }}>
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold mb-6">
                <Rocket className="h-3.5 w-3.5" /> 100% Free · No credit card required
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Start building your<br />dream resume today.
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Build ATS-ready resumes with real-time feedback, AI optimization, and custom templates. No hidden fees. No limits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth?mode=signup">
                  <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-bold shadow-lg">
                    Create My Resume <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#templates">
                  <Button variant="ghost" size="lg" className="text-white border-white/30 hover:bg-white/10">Browse Templates</Button>
                </Link>
              </div>
              <p className="text-blue-200/70 text-xs mt-6">No credit card · No subscription · No nonsense</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm">
                  <img src="/SmartCV_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                </div>
                <span className="text-[17px] font-extrabold tracking-tight text-slate-900">SmartCV</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                The free, AI-powered resume builder for students and freshers. Build ATS-ready resumes that actually get you interviews.
              </p>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Product</div>
              <div className="space-y-2.5">
                {[{ label: 'Features', href: '#features' }, { label: 'Templates', href: '#templates' }, { label: 'ATS Checker', href: '/auth?mode=signup' }, { label: 'Resume Builder', href: '/auth?mode=signup' }, { label: 'Import Resume', href: '/auth?mode=signup' }].map(l => (
                  <a key={l.label} href={l.href} className="block text-sm text-slate-500 hover:text-slate-900 transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Company</div>
              <div className="space-y-2.5">
                {[{ label: 'About', href: '/about' }, { label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Contact', href: '#' }].map(l => (
                  <a key={l.label} href={l.href} className="block text-sm text-slate-500 hover:text-slate-900 transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">· 2025 SmartCV. Built with care for students everywhere.</p>
            <p className="text-xs text-slate-300">Free forever · No premium · No subscriptions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
