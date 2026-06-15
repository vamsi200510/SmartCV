'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  Shield, 
  Cpu, 
  RefreshCw, 
  Layers, 
  HelpCircle, 
  Mail, 
  Globe, 
  Compass, 
  ChevronDown, 
  ChevronRight,
  Moon,
  Sun,
  Calendar,
  Layers2,
  FileSearch,
  BookOpen
} from 'lucide-react';

const TEMPLATES = [
  { id: 'creative', name: 'Creative Tech Spec', color: 'from-pink-500 via-purple-500 to-indigo-500', role: 'Senior Frontend Engineer', desc: 'Vibrant mesh background designed to stand out in creative agencies and tech startups.' },
  { id: 'minimal', name: 'Minimalist Editorial', color: 'from-slate-700 to-slate-900', role: 'Lead Product Designer', desc: 'Elegant typography-first theme optimized for structural layout and editorial design roles.' },
  { id: 'executive', name: 'Executive Corporate', color: 'from-blue-600 via-indigo-700 to-violet-800', role: 'VP of Product Management', desc: 'Structured grid alignment focusing on metrics, impact values, and key achievements.' },
  { id: 'academic', name: 'Scientific CV Grid', color: 'from-teal-500 to-emerald-700', role: 'Research Fellow (AI)', desc: 'Clean academic columns focusing on publications, projects, and educational credentials.' },
  { id: 'marketing', name: 'Impact Growth Spec', color: 'from-amber-500 to-rose-600', role: 'Director of Growth Marketing', desc: 'Warm gradients prioritizing performance metrics, marketing channels, and strategic goals.' }
];

const FEATURES = [
  {
    icon: <Cpu className="h-6 w-6 text-purple-500" />,
    title: "AI Resume Generator",
    desc: "Autocreate impact-driven bullet points customized for your specific career objectives and role descriptions."
  },
  {
    icon: <Shield className="h-6 w-6 text-teal-500" />,
    title: "ATS Real-Time Score Checker",
    desc: "Scan your resume formatting, keywords, and section hierarchy to bypass screening tools instantly."
  },
  {
    icon: <Layers className="h-6 w-6 text-blue-500" />,
    title: "Flexible Layout Editor",
    desc: "Reorder sections, toggle columns, customize headers, and format typography with zero coding experience."
  },
  {
    icon: <RefreshCw className="h-6 w-6 text-pink-500" />,
    title: "Dynamic Smart Enhancements",
    desc: "Get instant structural recommendations based on industry metrics and recruiter standards."
  }
];

const CAROUSEL_TEMPLATES = [
  { id: 1, title: 'Developer Modern', bg: 'from-slate-900 via-slate-950 to-slate-900', text: 'text-slate-100', role: 'Backend Engineer' },
  { id: 2, title: 'Editorial Executive', bg: 'from-amber-50/50 to-orange-100/50', text: 'text-slate-900', role: 'Content Writer' },
  { id: 3, title: 'Creative Designer', bg: 'from-pink-500/10 via-purple-500/10 to-indigo-500/10', text: 'text-indigo-950 dark:text-indigo-100', role: 'UX Researcher' },
  { id: 4, title: 'Structured Analyst', bg: 'from-blue-600/5 via-indigo-600/5 to-purple-600/5', text: 'text-slate-800 dark:text-slate-200', role: 'Finance Analyst' }
];

const WHY_SMARTCV = [
  {
    icon: <Shield className="h-6 w-6 text-teal-400" />,
    title: "ATS Validation Native",
    desc: "Every grid block and text column is structured according to parsing specifications, ensuring parsing algorithms read your resume content with 100% precision."
  },
  {
    icon: <Cpu className="h-6 w-6 text-indigo-400" />,
    title: "AI Optimization Core",
    desc: "Automatically checks for industry-specific terminology and checks your formatting constraints using dynamic backend checkers."
  },
  {
    icon: <Layers className="h-6 w-6 text-purple-400" />,
    title: "Clean Typography Hierarchy",
    desc: "Optimized fonts, line-height proportions, margins, and spacing built by expert engineers to make resumes stand out on screen and print."
  },
  {
    icon: <Check className="h-6 w-6 text-emerald-400" />,
    title: "Zero Branding Restrictions",
    desc: "Your data belongs entirely to you. Export standard high-contrast vector PDFs with no third-party watermark logs, limits, or branding."
  }
];

const ROADMAP_ITEMS = [
  { title: "AI Resume Builder", desc: "Interactive builder generating role-specific items tailored to career targets.", status: "In Development", icon: <Cpu className="h-5 w-5 text-purple-450" /> },
  { title: "ATS Analyzer", desc: "Live keyword scanning and structural hierarchy scoring parameters.", status: "In Development", icon: <FileSearch className="h-5 w-5 text-teal-450" /> },
  { title: "Resume Template Swiper", desc: "Interactive card deck to quickly evaluate layout options.", status: "In Development", icon: <Layers2 className="h-5 w-5 text-indigo-450" /> },
  { title: "Resume Import", desc: "Parse and ingest existing PDF/Word resumes into the SmartCV format.", status: "In Development", icon: <RefreshCw className="h-5 w-5 text-pink-450" /> },
  { title: "Portfolio Generator", desc: "Build a custom, shareable hosting page derived from your resume.", status: "In Development", icon: <Globe className="h-5 w-5 text-emerald-450" /> },
  { title: "AI Career Assistant", desc: "Tailored guidelines comparing your layout parameters with target job posts.", status: "In Development", icon: <BookOpen className="h-5 w-5 text-amber-455" /> }
];

const FAQS = [
  {
    q: "How does the AI optimize my resume templates?",
    a: "Our AI model will cross-reference your resume content with job posts, advising on keywords, structure, action verbs, and sizing to match professional recruiters' standards."
  },
  {
    q: "What makes the templates ATS-friendly?",
    a: "We avoid non-standard custom layouts that confuse parsers. Our grid layout matches standard PDF reading structures, maintaining structural accessibility while looking visually stunning."
  },
  {
    q: "Can I download my resume as a PDF?",
    a: "Yes! High-contrast, clean PDF vectors are generated instantly on export, retaining exact alignments and layout colors."
  },
  {
    q: "Is there a free tier available?",
    a: "Yes, our standard account is free to edit, preview, and build. Advanced AI analysis and templates will be available in future releases."
  }
];

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Swiper State
  const [cards, setCards] = useState(TEMPLATES);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<typeof TEMPLATES>([]);
  const [swipedCount, setSwipedCount] = useState(0);

  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % CAROUSEL_TEMPLATES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Drag and Swipe Handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (cards.length === 0) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 120;
    if (dragOffset.x > threshold) {
      triggerSwipe('right');
    } else if (dragOffset.x < -threshold) {
      triggerSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    setSwipeDir(direction);
    setTimeout(() => {
      if (direction === 'right') {
        setSelectedTemplates(prev => [...prev, cards[0]]);
      }
      setCards(prev => prev.slice(1));
      setDragOffset({ x: 0, y: 0 });
      setSwipeDir(null);
      setSwipedCount(prev => prev + 1);
    }, 250);
  };

  const handleReset = () => {
    setCards(TEMPLATES);
    setSwipedCount(0);
    setSelectedTemplates([]);
  };

  // Stack calculation style helpers
  const getSubCardStyle = (index: number) => {
    const scale = 1 - index * 0.04 + Math.min(Math.abs(dragOffset.x) / 3000, 0.04);
    const translateY = (index * 14) - Math.min(Math.abs(dragOffset.x) * 0.08, 14);
    const opacity = 1 - index * 0.25 + Math.min(Math.abs(dragOffset.x) / 1000, 0.25);
    return {
      transform: `scale(${scale}) translateY(${translateY}px)`,
      opacity,
      transition: isDragging ? 'none' : 'transform 250ms ease, opacity 250ms ease'
    };
  };

  const topCardTransform = isDragging
    ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.08}deg)`
    : swipeDir === 'right'
    ? `translate(600px, ${dragOffset.y}px) rotate(25deg)`
    : swipeDir === 'left'
    ? `translate(-600px, ${dragOffset.y}px) rotate(-25deg)`
    : 'translate(0px, 0px) rotate(0deg)';

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-500 font-sans relative overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Accent Meshes */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] animate-floating-glow" />
          <div className="absolute bottom-20 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] animate-floating-glow" style={{ animationDelay: '-5s' }} />
        </div>
      )}

      {/* Navigation Header */}
      <header className={`border-b backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'border-slate-900 bg-slate-950/70' : 'border-slate-200 bg-white/70'}`}>
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
            S
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              SmartCV
            </span>
            <span className={`text-[8.5px] block font-bold tracking-widest uppercase -mt-0.5 ${isDarkMode ? 'text-slate-550' : 'text-slate-400'}`}>
              AI Resume Platform
            </span>
          </div>
        </div>

        {/* Navigation Middle Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-indigo-500 dark:hover:text-teal-400 transition-colors">Features</a>
          <a href="#swiper" className="hover:text-indigo-500 dark:hover:text-teal-400 transition-colors">Template Gallery</a>
          <a href="#why-smartcv" className="hover:text-indigo-500 dark:hover:text-teal-400 transition-colors">Why SmartCV</a>
          <a href="#roadmap" className="hover:text-indigo-500 dark:hover:text-teal-400 transition-colors">Roadmap</a>
          <a href="#faqs" className="hover:text-indigo-500 dark:hover:text-teal-400 transition-colors">FAQs</a>
        </nav>

        {/* Theme + Entry actions */}
        <div className="flex items-center space-x-4">
          
          {/* Segmented Theme Switch */}
          <div className={`relative flex items-center p-0.5 rounded-xl border transition-all duration-500 ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-100 border-slate-200'}`}>
            <div
              className={`absolute h-[24px] rounded-lg shadow-sm transition-all duration-300 ease-out border ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-teal-400' : 'bg-white border-slate-200 text-indigo-600'
              }`}
              style={{ width: '56px', transform: `translateX(${isDarkMode ? '56px' : '0px'})` }}
            />
            <button
              onClick={() => setIsDarkMode(false)}
              className={`relative z-10 flex items-center justify-center w-[56px] py-1 rounded-lg text-[10px] font-bold cursor-pointer ${!isDarkMode ? 'text-indigo-600' : 'text-slate-550 hover:text-slate-300'}`}
            >
              <Sun className="h-3 w-3 mr-1" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              className={`relative z-10 flex items-center justify-center w-[56px] py-1 rounded-lg text-[10px] font-bold cursor-pointer ${isDarkMode ? 'text-teal-400' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Moon className="h-3 w-3 mr-1" />
              <span>Dark</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2">
            <Link
              href="/auth?mode=signin"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                isDarkMode ? 'text-slate-300 hover:bg-slate-900 border border-slate-850' : 'text-slate-700 hover:bg-slate-100 border border-slate-250 shadow-sm bg-white'
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-white shadow-lg ${
                isDarkMode ? 'bg-gradient-to-r from-teal-500 to-indigo-600 shadow-teal-500/10' : 'bg-indigo-600 shadow-indigo-600/15 hover:bg-indigo-500'
              }`}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Sections Body */}
      <main className="flex-grow">

        {/* 1. HERO SECTION */}
        <section className="relative px-6 py-20 md:py-32 max-w-6xl mx-auto flex flex-col items-center text-center space-y-8 z-10 animate-fade-in-up">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-750 border border-indigo-100'
          }`}>
            <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse text-indigo-400" />
            AI Resume Platform
          </span>

          <h1 className={`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
            Design your career path with{' '}
            <span className="bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient-shift">
              SmartCV
            </span>
          </h1>

          <p className={`text-sm sm:text-lg max-w-2xl leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-555'}`}>
            Build ATS-friendly resumes, optimize your career profile, and prepare for your next opportunity. Built and Developed by Vamsi Krishna Tadisetti.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <Link
              href="/auth?mode=signup"
              className={`inline-flex items-center space-x-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-2xl cursor-pointer ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 shadow-teal-500/20' 
                  : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-500'
              }`}
            >
              <span>Build My Resume</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#swiper"
              className={`px-7 py-3.5 border rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-sm cursor-pointer ${
                isDarkMode ? 'border-slate-850 hover:bg-slate-900 text-slate-300 bg-slate-950/20' : 'border-slate-200 hover:bg-slate-100 text-slate-700 bg-white'
              }`}
            >
              Explore Templates
            </a>
          </div>
        </section>

        {/* 2. TEMPLATE SWIPER (Deck Swipe Experience) */}
        <section id="swiper" className="py-20 bg-slate-900/10 dark:bg-slate-950/20 border-y border-slate-900/10 dark:border-slate-900/60 relative z-10 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Swiper Texts */}
            <div className="lg:col-span-5 space-y-5 text-left animate-fade-in-up">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-indigo-650'}`}>
                Swipe-To-Select Concept
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                Find your perfect format using our card deck
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-555'}`}>
                Drag cards left or right to browse layout structures. Swipe right to approve templates, and swipe left to dismiss. The matching layouts will populate your dashboard builder.
              </p>
              
              {/* Selected List Badge Indicators */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Swiped templates ({selectedTemplates.length} Selected)
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplates.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No selections yet. Swipe right to pick!</span>
                  ) : (
                    selectedTemplates.map(t => (
                      <span key={t.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/10 text-teal-400">
                        <Check className="h-3 w-3 mr-1 text-teal-400" />
                        {t.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Swiper Interactive Stack Box */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[460px]">
              
              {/* Active Deck Stack */}
              {cards.length > 0 ? (
                <div 
                  className="relative w-full max-w-[340px] h-[380px] select-none"
                  onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleEnd}
                >
                  
                  {/* Map over sub-cards stacked behind */}
                  {cards.slice(1, 4).map((template, idx) => {
                    const depthIndex = idx + 1;
                    return (
                      <div
                        key={template.id}
                        className={`absolute inset-0 rounded-[28px] border p-6 flex flex-col justify-between shadow-xl ${
                          isDarkMode 
                            ? 'bg-slate-900 border-slate-800 text-white' 
                            : 'bg-white border-slate-200 text-slate-900 shadow-slate-250/20'
                        }`}
                        style={getSubCardStyle(depthIndex)}
                      >
                        <div className="space-y-4">
                          <div className={`h-8 w-24 rounded-lg bg-gradient-to-r ${template.color} opacity-40`} />
                          <h4 className="text-base font-extrabold">{template.name}</h4>
                          <span className="text-[11px] block font-bold uppercase tracking-widest text-indigo-400">{template.role}</span>
                          <p className="text-xs leading-relaxed text-slate-400">{template.desc}</p>
                        </div>
                        <div className="h-10 border-t border-dashed border-slate-800/40 mt-4 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                          <span>A4 Format Layout</span>
                          <span>ATS Certified</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Active Top Card */}
                  <div
                    onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                    onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                    className={`absolute inset-0 rounded-[28px] border p-6 flex flex-col justify-between shadow-2xl transition-transform cursor-grab active:cursor-grabbing backdrop-blur-xl ${
                      isDarkMode 
                        ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/50' 
                        : 'bg-white/95 border-indigo-100 text-slate-900 shadow-indigo-600/5'
                    }`}
                    style={{
                      transform: topCardTransform,
                      transition: isDragging ? 'none' : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                      touchAction: 'none',
                      zIndex: 10
                    }}
                  >
                    {/* Visual Card Accent Top Gutter */}
                    <div className="space-y-4 pointer-events-none">
                      <div className="flex items-center justify-between">
                        <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${cards[0].color}`} />
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Resume Outline</span>
                      </div>
                      
                      {/* Dashboard Mockup Graphics */}
                      <div className={`rounded-xl p-4 bg-gradient-to-tr ${cards[0].color} text-white flex flex-col justify-between h-28 shadow-md relative overflow-hidden`}>
                        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                        <div>
                          <h5 className="font-extrabold text-sm tracking-tight">{cards[0].role}</h5>
                          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">Template Layout</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span>SmartCV Design</span>
                          <span>ATS Verified</span>
                        </div>
                      </div>
                      
                      <h4 className="text-base font-extrabold tracking-tight pt-2">{cards[0].name}</h4>
                      <p className="text-xs leading-relaxed text-slate-450 dark:text-slate-400">{cards[0].desc}</p>
                    </div>

                    <div className="h-10 border-t border-dashed border-slate-800/10 dark:border-slate-800/60 mt-4 flex items-center justify-between text-[10px] font-bold text-slate-500 pointer-events-none">
                      <span>Standard A4 Grid</span>
                      <span className="text-teal-400 font-extrabold uppercase tracking-widest">PRO</span>
                    </div>
                  </div>

                </div>
              ) : (
                /* Empty Deck State */
                <div className={`w-full max-w-[340px] border rounded-[28px] p-8 text-center transition-all ${
                  isDarkMode ? 'bg-slate-900/20 border-slate-850' : 'bg-white border-slate-200 shadow-md'
                }`}>
                  <div className="h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4 text-teal-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-sm mb-1">Deck Fully Reviewed</h4>
                  <p className="text-xs text-slate-500 mb-6">You have swiped all available templates. Your selected formats are loaded in onboarding.</p>
                  <button
                    onClick={handleReset}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                      isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-850' : 'bg-slate-50 hover:bg-slate-100 text-indigo-600 border border-slate-200'
                    }`}
                  >
                    Reset Stack Deck
                  </button>
                </div>
              )}

              {/* Action Circle Swiper Buttons */}
              {cards.length > 0 && (
                <div className="flex items-center space-x-6 mt-8">
                  <button
                    onClick={() => triggerSwipe('left')}
                    className={`h-11 w-11 rounded-full border flex items-center justify-center shadow-lg transition duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                      isDarkMode ? 'border-slate-800 bg-slate-900 text-rose-500 hover:border-rose-500/30' : 'border-slate-250 bg-white text-rose-600 hover:border-rose-300'
                    }`}
                    title="Dismiss Layout"
                  >
                    <X className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                    Swipe Cards
                  </span>
                  <button
                    onClick={() => triggerSwipe('right')}
                    className={`h-11 w-11 rounded-full border flex items-center justify-center shadow-lg transition duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                      isDarkMode ? 'border-slate-800 bg-slate-900 text-teal-400 hover:border-teal-500/30' : 'border-slate-250 bg-white text-teal-600 hover:border-teal-350'
                    }`}
                    title="Approve Template"
                  >
                    <Check className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* 3. INTERACTIVE TEMPLATE CAROUSEL */}
        <section className="py-20 max-w-6xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4 animate-fade-in-up">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>
              Mockups Showcase
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Browse layout variants in real-time
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
              Our carousel showcases modern resume layouts featuring elegant spacing, premium dark card options, and high contrast typography.
            </p>
          </div>

          {/* Carousel View Container */}
          <div className="relative max-w-2xl mx-auto h-52 sm:h-60 rounded-3xl overflow-hidden shadow-2xl border border-slate-900/10 dark:border-slate-900/60 transition-all duration-500 animate-fade-in-up">
            {CAROUSEL_TEMPLATES.map((item, idx) => {
              const isActive = idx === carouselIndex;
              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 p-8 flex flex-col justify-between bg-gradient-to-tr ${item.bg} ${item.text} transition-opacity duration-1000 ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <div className="text-left space-y-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Resume Style {item.id}</span>
                    <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">{item.title}</h3>
                    <span className="text-xs font-bold uppercase text-teal-400 block tracking-widest">{item.role}</span>
                  </div>
                  
                  {/* Dummy Mockup Lines */}
                  <div className="space-y-2 mt-4 opacity-40">
                    <div className="h-1.5 w-full bg-current rounded-full" />
                    <div className="h-1.5 w-5/6 bg-current rounded-full" />
                    <div className="h-1.5 w-4/6 bg-current rounded-full" />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold opacity-70 mt-4">
                    <span>Designed by SmartCV</span>
                    <span>Ready for AI Integration</span>
                  </div>
                </div>
              );
            })}

            {/* Slider Dots */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-1.5">
              {CAROUSEL_TEMPLATES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === carouselIndex ? 'w-4 bg-teal-450' : 'w-1.5 bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. FEATURES GRID */}
        <section id="features" className="py-20 max-w-6xl mx-auto px-6 relative z-10 space-y-12">
          <div className="text-center space-y-4 animate-fade-in-up">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-purple-400' : 'text-indigo-650'}`}>
              Product Capabilities
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Everything you need to land interviews
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
              Avoid boring text files. Use custom spacing frameworks, automated keyphrase scoring, and beautiful grids designed for visual excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, idx) => (
              <div
                key={idx}
                className={`border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between backdrop-blur-md ${
                  isDarkMode 
                    ? 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800 hover:bg-slate-900/30' 
                    : 'bg-white border-slate-200/50 hover:border-slate-300 shadow-slate-200/50 hover:bg-slate-50/30'
                }`}
              >
                <div>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-5 ${
                    isDarkMode ? 'bg-slate-950 border border-slate-850' : 'bg-slate-50 border border-slate-200'
                  }`}>
                    {feat.icon}
                  </div>
                  <h3 className={`text-sm sm:text-base font-bold tracking-tight mb-2.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    {feat.title}
                  </h3>
                  <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {feat.desc}
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-indigo-400 mt-6 cursor-pointer group">
                  <span>Explore features</span>
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. WHY SMARTCV SECTION (REAL CAPABILITIES ONLY) */}
        <section id="why-smartcv" className="py-20 bg-slate-900/10 dark:bg-slate-950/20 border-y border-slate-900/10 dark:border-slate-900/60 relative z-10">
          <div className="max-w-6xl mx-auto px-6 space-y-12 animate-fade-in-up">
            <div className="text-center space-y-4">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-pink-400' : 'text-indigo-600'}`}>
                Core Advantage
              </span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                Why SmartCV?
              </h2>
              <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                We build utilities tailored specifically for modern software engineers, product managers, and designers looking to highlight key data fields cleanly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {WHY_SMARTCV.map((item, idx) => (
                <div
                  key={idx}
                  className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isDarkMode ? 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800' : 'bg-white border-slate-200/50 hover:border-slate-300 shadow-slate-200/50 shadow-sm'
                  }`}
                >
                  <div className="space-y-4">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-slate-950 border border-slate-850' : 'bg-slate-50 border border-slate-250'
                    }`}>
                      {item.icon}
                    </div>
                    <h3 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>
                    <p className={`text-xs leading-relaxed font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. ROADMAP COMING SOON SECTION */}
        <section id="roadmap" className="py-20 max-w-6xl mx-auto px-6 relative z-10 space-y-12">
          <div className="text-center space-y-4 animate-fade-in-up">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-teal-400' : 'text-indigo-650'}`}>
              Roadmap Roadmap
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Product Development Pipeline
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-555'}`}>
              SmartCV is continuously evolving. Explore the core modules currently being designed and deployed under our tech roadmap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {ROADMAP_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode ? 'bg-slate-900/20 border-slate-900/60 hover:border-slate-800' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm shadow-slate-200/50'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-slate-950 border border-slate-850 shadow-inner' : 'bg-slate-50 border border-slate-200'
                    }`}>
                      {item.icon}
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/15 animate-pulse">
                      {item.status}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-850'}`}>{item.title}</h3>
                    <p className={`text-xs mt-1.5 leading-relaxed font-semibold ${isDarkMode ? 'text-slate-450' : 'text-slate-500'}`}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. FAQ SECTION */}
        <section id="faqs" className="py-20 max-w-3xl mx-auto px-6 relative z-10 space-y-12">
          <div className="text-center space-y-4 animate-fade-in-up">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-purple-400' : 'text-indigo-650'}`}>
              Help Center
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isDarkMode ? 'border-slate-900 bg-slate-900/10' : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between font-bold text-xs sm:text-sm text-left transition hover:bg-slate-850/10 cursor-pointer"
                  >
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>
                  
                  {/* Accordion content */}
                  <div
                    className="transition-all duration-300 ease-in-out overflow-hidden"
                    style={{ maxHeight: isOpen ? '160px' : '0px' }}
                  >
                    <p className={`px-6 pb-5 text-xs sm:text-[13px] leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* 8. FOOTER */}
      <footer className={`border-t py-12 px-6 transition-colors duration-500 z-10 relative ${
        isDarkMode ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-400'
      }`}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Logo Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-500 via-indigo-650 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                S
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">SmartCV</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm font-bold">
              AI Resume Platform designed to help professionals format sections cleanly and build high-performance portfolios.
            </p>
            <p className="text-[10px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Built and Developed by Vamsi Krishna Tadisetti
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="#" className="hover:text-indigo-400 transition-colors"><Mail className="h-4 w-4" /></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><Globe className="h-4 w-4" /></a>
              <a href="#" className="hover:text-indigo-400 transition-colors"><Compass className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Nav Column 1 */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Product</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#swiper" className="hover:text-indigo-400 transition-colors">Template Gallery</a></li>
              <li><a href="#roadmap" className="hover:text-indigo-400 transition-colors">Coming Soon</a></li>
            </ul>
          </div>

          {/* Nav Column 2 */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Resources</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">ATS Secrets Blog</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Resume Tips</a></li>
              <li><a href="#faqs" className="hover:text-indigo-400 transition-colors">Help FAQs</a></li>
            </ul>
          </div>

          {/* Nav Column 3 */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">Company</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About SmartCV</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between border-t border-slate-900/10 dark:border-slate-900/60 mt-12 pt-6 text-[10px] font-bold tracking-widest uppercase text-slate-550">
          <span>&copy; {new Date().getFullYear()} SmartCV. Built and Developed by Vamsi Krishna Tadisetti.</span>
          <span className="mt-2 sm:mt-0">AI Resume Platform</span>
        </div>
      </footer>

      {/* CSS Animation Overrides */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
      `}</style>
      
    </div>
  );
}
