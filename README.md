# SmartCV ✨

> **Next-Generation AI Resume Builder with Real-Time ATS Optimization & iOS-Style Optical Liquid Glass Design**

![SmartCV](https://raw.githubusercontent.com/vamsi200510/SmartCV/main/public/SmartCV_logo.png)

SmartCV is a state-of-the-art resume engineering platform designed to help job seekers, students, and professionals craft ATS-optimized, high-impact resumes in minutes. Built on Next.js 16, Google Gemini AI, Supabase, and a handcrafted optical Liquid Glass design system with physics-based fluid interactions.

---

## 🌟 Key Features & Capabilities

### 1. 🤖 Intelligent Real-Time ATS Optimization Engine
- **Deterministic 100-Point Scoring**: Evaluates contact completeness, summary alignment, work experience impact, active verbs, quantified achievements, education, and technical skill balance.
- **Categorized Actionable Recommendations**: Pinpoints critical structural fixes, missing industry keywords, and high-priority bullet improvements.
- **Live Visual Score Ring**: Real-time feedback ring and score badges that immediately recalculate as you edit.

### 2. 🎨 12+ Recruiter-Tested Industry Templates
- **FAANG Elite, Silicon Valley, ATS Professional, Tech Minimal, Executive Pro, Modern Gradient, Impact Startup, and more**.
- Available in dynamic single-column and two-column architectures engineered for automated parser readability and human recruiter scanning.
- Dynamic color themes, typography sets, section toggling, and drag-and-drop section ordering.

### 3. ⚡ Real-Time WYSIWYG A4 Canvas Builder
- **True-to-Print A4 Viewport**: Live canvas rendering with exact print-geometry precision and zero page overflow distortion.
- **Draggable Split-Pane Workspace**: Persistent, adjustable split-screen editor with collapsible sections.
- **Physics-Based Floating Action Dock**: Movable vertical glass control rail (`ATS Score`, `Template Switcher`, `PDF Export`) with spring physics, boundary constraints, and edge snapping.
- **Full History State Manager**: Complete timeline undo/redo support with standard keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).

### 4. 🔮 Floating AI Assistant & Co-Pilot
- **Enlarged 72px Draggable AI Assistant**: Movable on-canvas chatbot widget with smooth spring motion and drag-safe click guards.
- **Intelligent Bullet Polishing**: Automatically transforms passive descriptions into high-impact accomplishment bullets with metrics and active verbs.
- **Tailored Job Matching**: Analyzes target job descriptions to extract essential skills and keywords directly into your resume.

### 5. 💎 iOS-Style Optical Liquid Glass UI Architecture
- **Chromatic Navbar Refraction (`.liquid-glass-nav`)**: Embedded horizontal Warm Amber (`#C2600E`) to Ocean Blue (`#1E6FA8`) refraction gradient, perfectly masked to the navbar pill silhouette with zero external seams.
- **Pure Neutral Crystalline Surfaces (`.liquid-glass-surface`, `.liquid-glass-dock`, `.liquid-glass-circle`)**: Gradient-free, high-clarity glass for action docks and circular widgets.
- **Multi-Layer Specular Edge Highlights**: Inset top-edge rim reflections, bottom pooling highlights, and soft ambient elevation shadows.
- **Unclipped Dropdowns & Menus**: Seamless interaction for Search modals, Notifications popovers, and Profile settings menus without container clipping.
- **Polished Interactive States**: Smooth capsule hover animations across "Sign In" and "Get Started Free" CTAs.

### 6. 🔒 Authentication & Cloud Synchronization
- **Email OTP & Password Authentication**: Flexible authentication with passwordless OTP verification flows.
- **Supabase Backend**: Robust PostgreSQL database with Row Level Security (RLS) ensuring strict multi-tenant data isolation.
- **Automatic Cloud Auto-Save**: Real-time drafting with cross-session and cross-device synchronization.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router & Turbopack)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | Vanilla CSS + [TailwindCSS](https://tailwindcss.com/) with Custom Optical Glass Tokens |
| **Animations & Physics** | [Framer Motion](https://www.framer.com/motion/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Storage) |
| **AI Intelligence** | [Google Gemini API](https://ai.google.dev/) |
| **PDF Generation Pipeline** | HTML5 Canvas / Dedicated Print Viewport Pipeline |
| **Icons & Micro-Graphics** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** / **yarn** / **pnpm** / **bun**
- A **Supabase** project
- A **Google Gemini API Key**

### 1. Clone the Repository
```bash
git clone https://github.com/vamsi200510/SmartCV.git
cd SmartCV
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
SmartCV/
├── public/                         # Static assets, branding logos, icons
├── src/
│   ├── app/                        # Next.js App Router pages and API routes
│   │   ├── api/                    # Backend API endpoints
│   │   │   ├── ai/edit/            # AI resume content polishing
│   │   │   ├── auth/               # OTP delivery, verification, profile update
│   │   │   └── resumes/            # Resume CRUD, PDF export, ATS analyze, import
│   │   ├── auth/                   # Authentication pages (Sign-in, sign-up, OTP)
│   │   ├── builder/                # Full-featured split-pane resume builder
│   │   │   └── print-viewport/     # Dedicated pixel-perfect PDF print renderer
│   │   ├── dashboard/              # User dashboard, resume management & templates
│   │   ├── onboarding/             # New user onboarding wizard
│   │   ├── profile/                # User profile settings & preferences
│   │   ├── templates/              # 12+ Template showcase & preview gallery
│   │   ├── globals.css             # Liquid Glass optical tokens & global styling
│   │   ├── layout.tsx              # Root application layout
│   │   └── page.tsx                # High-conversion landing page
│   ├── components/                 # Reusable UI & resume builder components
│   │   ├── ui/                     # Core design system primitives
│   │   │   ├── ColorMeshBackdrop.tsx # Scoped backdrop refraction component
│   │   │   ├── LiquidGlassButton.tsx # Optical glass button primitives
│   │   │   ├── LoadingScreen.tsx     # Animated branding loader
│   │   │   ├── AppLogo.tsx           # Scalable brand icon and typography
│   │   │   └── design-system.tsx     # Buttons, Badges, Modals, ATSRings
│   │   ├── templates/              # 12+ Resume template renderers
│   │   ├── A4ResumePreview.tsx     # High-fidelity A4 sheet renderer
│   │   ├── AIChatPanel.tsx         # AI assistant side drawer
│   │   ├── DesignWorkspace.tsx     # Visual customization & layout workspace
│   │   ├── FloatingAIAssistant.tsx # 72px Draggable floating AI bot widget
│   │   ├── FormPrimitives.tsx      # Specialized input, tag, and array editors
│   │   ├── ResumeBuilderForm.tsx   # Multi-section resume form editor
│   │   ├── TemplateDetailsDrawer.tsx # Template metadata inspector
│   │   ├── TemplatePreviewModal.tsx  # Fullscreen template preview modal
│   │   └── TemplateRenderer.tsx    # Live A4 Canvas resume renderer
│   ├── config/                     # Feature flags & authentication config
│   │   └── authConfig.ts           # Centralized auth toggles
│   ├── context/                    # React Context providers (AuthContext)
│   ├── lib/                        # Utilities, Supabase client, and AI engines
│   │   ├── ai/                     # AI services & ATS algorithms
│   │   │   ├── aiService.ts        # Gemini AI prompt orchestration
│   │   │   └── atsEngine.ts        # Deterministic 100-point ATS evaluation
│   │   ├── supabase.ts             # Supabase client & session management
│   │   └── templatePreviewData.ts  # Mock preview datasets for templates
│   └── types/                      # TypeScript definitions & Supabase DB types
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

---

## 🎯 ATS Scoring Algorithm Breakdown

SmartCV evaluates every resume against the following 6 core pillars:

1. **Contact Information & Completeness (15 pts)**: Validates full name, email, phone, location, LinkedIn, and GitHub/Portfolio URLs.
2. **Professional Summary / Objective (15 pts)**: Evaluates clarity, length, target role alignment, and keyword density.
3. **Experience & Bullet Impact (30 pts)**: Analyzes strong action verbs (e.g., *Spearheaded*, *Architected*, *Accelerated*), measurable metrics (percentages, revenue, time savings), and chronological consistency.
4. **Skills & Keyword Optimization (20 pts)**: Categorizes skills into Frontend, Backend, Cloud, Tools, and Soft Skills.
5. **Education & Certifications (10 pts)**: Detects degree, institution, graduation year, and academic achievements.
6. **Layout & Formatting ATS Compatibility (10 pts)**: Ensures single/clean-flow hierarchy, standard headings, and absence of unparseable graphical elements.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Crafted with ❤️ by **[Vamsi](https://github.com/vamsi200510)**.
