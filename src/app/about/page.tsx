'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, ArrowLeft, Globe, Code2,
  Database, Palette, Zap, Shield, Rocket,
  Heart, Star, ExternalLink, GraduationCap, Calendar,
  CheckCircle, ArrowRight, Layers
} from 'lucide-react';

const TECH_STACK = [
  { name: 'Next.js 16', desc: 'React framework with server components, app router, and edge runtime.', icon: Code2, color: 'bg-[#111827]', textColor: 'text-white' },
  { name: 'Supabase', desc: 'Postgres database, auth, storage, and real-time subscriptions.', icon: Database, color: 'bg-emerald-500', textColor: 'text-white' },
  { name: 'Tailwind CSS 4', desc: 'Utility-first CSS framework for rapid, consistent UI development.', icon: Palette, color: 'bg-cyan-500', textColor: 'text-white' },
  { name: 'Framer Motion', desc: 'Production-ready animations and gesture support for React.', icon: Zap, color: 'bg-purple-500', textColor: 'text-white' },
  { name: 'Puppeteer', desc: 'Headless Chrome for pixel-perfect A4 PDF resume generation.', icon: Globe, color: 'bg-orange-500', textColor: 'text-white' },
  { name: 'Google Gemini AI', desc: 'AI-powered resume optimization, content rewriting, and ATS analysis.', icon: Sparkles, color: 'bg-blue-500', textColor: 'text-white' },
];

const TIMELINE = [
  { version: 'v1.0', title: 'Foundation', desc: 'Core builder, 4 templates, basic auth.', status: 'completed' },
  { version: 'v2.0', title: 'AI Integration', desc: 'Gemini-powered rewriting, resume import, ATS scoring.', status: 'completed' },
  { version: 'v3.0', title: 'Production Release', desc: '12+ templates, dashboard, direct PDF export, profile system.', status: 'current' },
  { version: 'v4.0', title: 'Collaboration', desc: 'Team workspaces, resume sharing, recruiter analytics.', status: 'upcoming' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Subtle dot grid */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #C7C9D3 0.6px, transparent 0.6px)', backgroundSize: '24px 24px', opacity: 0.2 }} />

      {/* Nav */}
      <nav className="bg-white border-b border-[#ECEDF3] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-lg bg-[#F7F8FC] border border-[#ECEDF3] hover:bg-[#EFF6FF] flex items-center justify-center text-[#6B7280] transition">
              <ArrowLeft size={15} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-white border border-[#ECEDF3] flex items-center justify-center shadow-sm">
                <img src="/SmartCV_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
              </div>
              <span className="font-bold text-[15px] text-[#111827] tracking-tight">SmartCV</span>
            </div>
          </div>
          <Link href="/auth?mode=signup">
            <button className="h-9 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
              Get Started <ArrowRight size={12} />
            </button>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 relative z-10">

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <Rocket size={12} /> Version 3.0.0
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight leading-tight">
            Building the future of<br />
            <span style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              resume creation.
            </span>
          </h1>
          <p className="text-lg text-[#6B7280] mt-5 max-w-2xl mx-auto leading-relaxed">
            SmartCV is a free, AI-powered resume builder designed for students and freshers. We combine modern web technologies with intelligent optimization to help you land your dream job.
          </p>
        </motion.section>

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-[#ECEDF3] p-10 mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#2563EB] mb-4">
                <Heart size={12} /> Our Mission
              </div>
              <h2 className="text-2xl font-bold text-[#111827] tracking-tight mb-4">
                Level the playing field for every job seeker.
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                We believe every student deserves a professional, ATS-optimized resume — regardless of their design skills or budget. SmartCV is and will always be completely free, with no hidden premium tiers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#F7F8FC] rounded-2xl p-5 text-center border border-[#ECEDF3]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#ECEDF3] flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <stat.icon size={16} className="text-[#2563EB]" />
                  </div>
                  <div className="text-2xl font-bold text-[#111827]">{stat.value}</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">{stat.label}</div>
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
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#7C3AED] mb-3">
              <Code2 size={12} /> Tech Stack
            </div>
            <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Built with modern technologies</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-white border border-[#ECEDF3] rounded-2xl p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#DDDEE8] transition-all group"
              >
                <div className={`h-10 w-10 rounded-xl ${tech.color} flex items-center justify-center mb-3`}>
                  <tech.icon size={18} className={tech.textColor} />
                </div>
                <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">{tech.name}</h3>
                <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Timeline Roadmap */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#0891B2] mb-3">
              <Calendar size={12} /> Roadmap
            </div>
            <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Our journey so far</h2>
          </div>
          <div className="bg-white border border-[#ECEDF3] rounded-2xl overflow-hidden">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.version}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-4 p-5 ${i < TIMELINE.length - 1 ? 'border-b border-[#F0F1F8]' : ''}`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  item.status === 'current' ? 'bg-[#2563EB] text-white' :
                  item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  'bg-[#F7F8FC] text-[#9CA3AF] border border-[#ECEDF3]'
                }`}>
                  {item.status === 'completed' ? <CheckCircle size={16} /> : item.version}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[#111827]">{item.title}</h4>
                    {item.status === 'current' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">Current</span>
                    )}
                    {item.status === 'upcoming' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">Upcoming</span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">{item.desc}</p>
                </div>
                <span className="text-[11px] font-bold text-[#9CA3AF] shrink-0">{item.version}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Developer Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#EA580C] mb-3">
              <Star size={12} /> Developer
            </div>
            <h2 className="text-2xl font-bold text-[#111827] tracking-tight">Meet the builder</h2>
          </div>
          <div className="bg-white border border-[#ECEDF3] rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-blue-50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-4xl font-extrabold shadow-lg shadow-blue-600/20">
                  VK
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-[#111827]">Vamsi Krishna Tadisetti</h3>
                <p className="text-sm text-[#6B7280] mt-1">Computer Science Engineering</p>
                <div className="flex items-center gap-1.5 justify-center md:justify-start mt-1">
                  <GraduationCap size={13} className="text-[#9CA3AF]" />
                  <span className="text-xs text-[#9CA3AF]">NRI Institute of Technology</span>
                </div>
                <p className="text-sm text-[#6B7280] mt-4 leading-relaxed max-w-lg">
                  Passionate about building products that make a real difference. SmartCV started as a personal project to help fellow students create professional resumes and has grown into a full-featured SaaS platform.
                </p>
                <div className="flex items-center gap-3 mt-5 justify-center md:justify-start">
                  <a href="https://github.com/vamsi200510" target="_blank" rel="noopener noreferrer"
                    className="h-9 px-4 rounded-xl border border-[#ECEDF3] bg-white hover:bg-[#F7F8FC] text-xs font-medium text-[#374151] flex items-center gap-1.5 transition">
                    <ExternalLink size={13} /> GitHub
                  </a>
                  <a href="https://linkedin.com/in/vamsi-krishna-tadisetti" target="_blank" rel="noopener noreferrer"
                    className="h-9 px-4 rounded-xl border border-[#ECEDF3] bg-white hover:bg-[#F7F8FC] text-xs font-medium text-[#374151] flex items-center gap-1.5 transition">
                    <ExternalLink size={13} /> LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Future Vision */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="rounded-3xl overflow-hidden p-10 md:p-14 text-center text-white relative"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5, #7C3AED)' }}>
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative z-10">
              <Rocket className="h-8 w-8 mx-auto mb-4 text-white/80" />
              <h2 className="text-3xl font-extrabold tracking-tight mb-3">The Vision</h2>
              <p className="text-blue-100 text-base max-w-xl mx-auto leading-relaxed mb-6">
                We are building towards a world where every job seeker — from students to executives — has access to AI-powered career tools. Resume building is just the beginning.
              </p>
              <Link href="/auth?mode=signup">
                <button className="h-11 px-6 rounded-xl bg-white text-[#2563EB] text-sm font-bold hover:bg-blue-50 transition cursor-pointer inline-flex items-center gap-2">
                  Start Building Free <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#ECEDF3] bg-white py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-[#111827]">SmartCV</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">&copy; 2025 SmartCV. Built with care for students everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
