# SmartCV ✨

> **Next-Generation AI Resume Builder with Real-Time ATS Optimization & iOS-Style Liquid Glass Design**

![SmartCV](https://raw.githubusercontent.com/vamsi200510/SmartCV/main/public/SmartCV_logo.png)

SmartCV is a state-of-the-art resume engineering platform engineered to help job seekers, students, and professionals craft ATS-optimized, high-impact resumes in minutes. Powered by Next.js 16, Google Gemini AI, Supabase, and a handcrafted optical Liquid Glass design system.

---

## 🌟 Key Features

### 1. 🤖 Intelligent Real-Time ATS Engine
- **Deterministic 100-Point ATS Scoring**: Evaluates contact details, summary, work experience impact, action verbs, quantified metrics, education, and technical skill balance.
- **Actionable AI Feedback**: Categorized improvements with critical fixes, suggestions, and instant one-click AI bullet enhancements.
- **Interactive Scoring Ring**: Real-time visual feedback that updates as you type and structure your resume.

### 2. 🎨 12+ Recruiter-Approved Professional Templates
- **FAANG Elite, Silicon Valley, ATS Professional, Tech Minimal, Executive Pro, Modern Gradient, and more**.
- Dynamic single-column and two-column layouts optimized for automated parsing and human recruiter readability.
- Flexible color themes, typography selections, and custom section ordering.

### 3. ⚡ Real-Time WYSIWYG A4 Canvas Builder
- **Exact-Print Viewport**: Live true-to-life A4 dimensions with zero layout distortion.
- **Interactive Split Pane**: Draggable, persistent split-screen editor with collapsible sections.
- **Physics-Based Floating Action Rail**: Movable ATS inspector, template switcher, and PDF exporter with spring physics and edge snapping.
- **Undo / Redo History**: Full state timeline support with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).

### 4. 🔮 AI Assistant & Co-Pilot
- **Floating Draggable AI Assistant**: Movable on-canvas AI chatbot widget with physics drag and edge snapping.
- **Intelligent Bullet Polishing**: Transform weak bullet points into high-impact accomplishment statements with active verbs and quantifiable outcomes.
- **Context-Aware Recommendations**: Tailor resumes directly to target job descriptions.

### 5. 💎 iOS-Style Optical Liquid Glass UI
- **Physical Specular Highlights & Refraction**: Layered diagonal gradients, top-edge rim reflections, and chromatic dispersion.
- **Scoped Color Mesh Backdrops**: Vibrant backdrop-filter refraction without bleeding across page sections.
- **High-Contrast Typography**: Tailored warm-to-cool palettes with dark mode and high-contrast readability.

### 6. 🔒 Enterprise-Grade Authentication & Cloud Storage
- **Passwordless OTP Verification**: Fast, secure email OTP authentication.
- **Supabase Backend**: Row Level Security (RLS) ensuring strict multi-tenant isolation.
- **Cross-Device Cloud Sync**: Real-time auto-saving with instant recovery across sessions.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router & Turbopack)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | Vanilla CSS + [TailwindCSS](https://tailwindcss.com/) with Custom Optical Glass Tokens |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Storage) |
| **AI Intelligence** | [Google Gemini API](https://ai.google.dev/) |
| **PDF Generation** | HTML5 Canvas / Puppeteer Print Pipeline |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** / **yarn** / **pnpm** / **bun**
- A **Supabase** account with a project created
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
├── public/                     # Static assets, branding logos, icons
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/                # Backend API endpoints (Auth, AI, ATS, PDF)
│   │   ├── auth/               # Sign-in, sign-up, and OTP verification flow
│   │   ├── builder/            # Full-featured split-pane resume builder
│   │   ├── dashboard/          # User dashboard, resume management & templates
│   │   ├── profile/            # Profile settings & account preferences
│   │   ├── templates/          # Template showcase & preview gallery
│   │   ├── globals.css         # Liquid Glass tokens & global design system
│   │   ├── layout.tsx          # Root application layout
│   │   └── page.tsx            # High-conversion landing page
│   ├── components/             # Reusable UI & resume builder components
│   │   ├── ui/                 # Design system primitives (Buttons, Badges, Modals, Mesh)
│   │   ├── templates/          # 12+ Resume template renderers
│   │   ├── AIChatPanel.tsx     # AI assistant side drawer
│   │   ├── FloatingAIAssistant.tsx # Draggable floating AI bot widget
│   │   ├── ResumeBuilderForm.tsx   # Multi-section resume form editor
│   │   └── TemplateRenderer.tsx    # Live A4 Canvas resume renderer
│   ├── context/                # Global React context providers (AuthContext)
│   ├── lib/                    # Utilities, Supabase client, and AI engines
│   │   ├── ai/                 # Gemini AI integration & deterministic ATS scoring
│   │   └── supabase.ts         # Supabase client & session management
│   └── types/                  # TypeScript interface definitions
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
