# SmartCV — Complete System Architecture & Technical Specification 📘

> **An in-depth guide covering the AI models, core tools, design system architecture, UI features, and backend infrastructure powering SmartCV.**

---

## 1. 🌟 Platform Overview & Mission

**SmartCV** is an enterprise-grade AI resume engineering platform engineered to empower students, freshers, and seasoned professionals to build recruiter-ready, ATS-compliant resumes with real-time feedback.

The platform bridges the gap between automated Applicant Tracking Systems (ATS) and human recruiters through:
1. **Algorithmic ATS Compliance**: Real-time scoring against industry-standard hiring heuristics.
2. **Generative AI Co-Pilot**: Deep contextual bullet rewriting and keyword matching using Google Gemini.
3. **State-of-the-Art Optical Design**: An iOS-inspired Liquid Glass user interface built with mathematical precision, physical specular highlights, and fluid physics.

---

## 2. 🧠 AI Models & Intelligence Engines

SmartCV employs a hybrid AI architecture combining **Large Language Models (LLMs)** with **Deterministic Algorithmic Evaluation**:

### A. Google Gemini AI Models
- **Models Utilized**: `gemini-1.5-flash` / `gemini-1.5-pro` (via `@google/genai` / Google AI Studio API).
- **Core AI Capabilities**:
  - **Contextual Bullet Polishing**: Analyzes raw draft bullet points and converts them into active, impact-oriented statements following the Google X-Y-Z formula (*Accomplished [X], as measured by [Y], by doing [Z]*).
  - **Dynamic ATS Summaries**: Generates tailored executive bios based on target job roles (e.g., Full Stack Engineer, Product Manager, Data Scientist).
  - **Job Description Keyword Matcher**: Ingests job descriptions, extracts essential technical requirements, and suggests missing high-impact keywords.
  - **Interactive On-Canvas AI Assistant**: An intelligent conversational agent that provides instant suggestions, critique, and structural formatting advice.

### B. Deterministic 100-Point ATS Scoring Engine (`atsEngine.ts`)
Rather than relying solely on non-deterministic LLM guesses for scoring, SmartCV utilizes a deterministic, heuristic-based parser that executes client-side and server-side:

| Pillar | Maximum Points | Evaluation Criteria |
|---|---|---|
| **Contact Completeness** | 15 pts | Full Name, Professional Email, Phone Number, Location, LinkedIn URL, GitHub/Portfolio. |
| **Professional Summary** | 15 pts | Word count optimization (40–120 words), presence of role keywords, active voice. |
| **Work Experience Impact** | 30 pts | Action verb density, quantifiable metrics (`%`, `$`, numbers), reverse-chronological dates. |
| **Technical Skill Balance** | 20 pts | Categorized grouping (Frontend, Backend, Cloud, Tools), keyword saturation. |
| **Education & Honors** | 10 pts | Degree title, University/College, Graduation Year, CGPA/Honors. |
| **Layout & Formatting** | 10 pts | Single/clean hierarchy, standard section headers, absence of unparseable graphics. |

---

## 3. 🛠️ Complete Technology Stack & Tools

### Frontend & Application Layer
- **Framework**: **[Next.js 16 (App Router)](https://nextjs.org/)** — Leveraging React Server Components (RSC), Turbopack compilation, client-side streaming, and Edge API route execution.
- **Language**: **[TypeScript 5](https://www.typescriptlang.org/)** — Strict end-to-end type safety covering database schemas, API contracts, resume data models, and template states.
- **Styling Architecture**: **[Vanilla CSS + TailwindCSS](https://tailwindcss.com/)** — Custom CSS design tokens with HSL color palettes and zero Tailwind bloat.
- **Motion & Physics**: **[Framer Motion](https://www.framer.com/motion/)** — Physics-based spring animations, gesture dragging, elastic edge-snapping, and layout transitions.
- **Iconography**: **[Lucide React](https://lucide.dev/)** — Scalable vector icons tailored with custom stroke weights and state transitions.

### Backend, Database & Security
- **Database**: **[Supabase PostgreSQL](https://supabase.com/)** — Relational database storing resume JSON documents, user metadata, audit trails, and template preferences.
- **Security & Authorization**: **PostgreSQL Row Level Security (RLS)** — Enforces strict tenant data isolation, ensuring users can only read/write their own resumes.
- **Authentication**: **Supabase Auth** — Passwordless Email OTP delivery, session cookies, and JWT token validation.
- **Storage**: **Supabase Storage** — Secure cloud buckets for profile avatar uploads and document attachments.

### PDF Rendering & Document Processing
- **Live Canvas**: Custom DOM-to-Canvas high-dpi rendering engine matching exact ISO 216 A4 paper dimensions (210mm × 297mm).
- **Print Viewport**: Dedicated print route (`/builder/print-viewport`) with `@media print` CSS rules, page-break prevention, and vector PDF exporting.

---

## 4. 💎 Optical Liquid Glass UI & Design System

SmartCV features a custom **Liquid Glass Material System** inspired by modern iOS aesthetics, focusing on physical lighting realism, depth, and optical refraction:

```
┌────────────────────────────────────────────────────────┐
│  Top Specular Highlight: Inset 0 1.5px (95% White)    │
│  Layered Background: 135deg Gradient (Translucent)     │
│  Chromatic Edge Dispersion: 90deg Amber → Blue Tint    │
│  Bottom Pooling Shadow: Inset 0 -1px (20% White)       │
│  Ambient Elevation: Tinted Ocean Shadow (0 6px 24px)   │
└────────────────────────────────────────────────────────┘
```

### Key UI Features & Specifications:

1. **Scoped Chromatic Navbar Refraction (`.liquid-glass-nav`)**:
   - Integrates a horizontal warm amber (`#C2600E` @ 18%) to ocean blue (`#1E6FA8` @ 18%) gradient within the nav bar.
   - Perfectly masked to the rounded-pill container (`rounded-[28px]` or `rounded-full`) with zero external rectangular seam lines.

2. **Pure Neutral Crystalline Surfaces (`.liquid-glass-surface`, `.liquid-glass-dock`, `.liquid-glass-circle`)**:
   - Dedicated clean, crystal-clear glass for floating toolbars, circular widgets, and action rails without unwanted color tinting.
   - High backdrop blur (`32px`) and enhanced saturation (`240%`) for crisp visual depth over any background.

3. **Physics-Based Draggable UI Widgets**:
   - **72px Floating AI Assistant**: An on-canvas AI chatbot button with smooth physics drag, cursor adaptation (`grab` / `grabbing`), and automatic horizontal edge-snapping.
   - **Movable Vertical Action Rail**: A floating dock housing real-time ATS scores, template switcher, and PDF exporter. Includes drag guards to prevent accidental button clicks while repositioning.

4. **Unclipped Layering Architecture**:
   - Multi-tier `z-index` hierarchy allowing Search quick-actions, Notification popovers, and Profile menus to seamlessly expand without container boundary clipping.

5. **Live WYSIWYG A4 Resume Canvas**:
   - Exact true-to-scale A4 sheet representation with zoom control (`50%` to `150%`), interactive split-pane resizer, and collapsible form sections.

6. **12+ Specialized Industry Templates**:
   - Includes **FAANG Elite**, **Silicon Valley**, **ATS Professional**, **Tech Minimal**, **Executive Pro**, **Modern Gradient**, **Clean Academic**, and **Impact Startup**.

---

## 5. 📂 Core File & Architecture Directory

```
SmartCV/
├── src/
│   ├── app/                                # App Router Pages & API Routes
│   │   ├── api/ai/edit/route.ts            # Gemini AI resume bullet enhancement
│   │   ├── api/resumes/ats-analyze/route.ts # Deterministic ATS evaluation endpoint
│   │   ├── api/resumes/export-pdf/route.ts # High-fidelity PDF generation
│   │   ├── api/auth/                       # OTP delivery and verification routes
│   │   ├── builder/page.tsx                # Split-pane WYSIWYG resume builder
│   │   ├── dashboard/page.tsx              # Main dashboard with metrics & management
│   │   ├── globals.css                     # Liquid Glass tokens & CSS architecture
│   │   └── page.tsx                        # High-conversion landing page
│   ├── components/
│   │   ├── ui/
│   │   │   ├── design-system.tsx           # Reusable Buttons, ATSRings, Badges, Modals
│   │   │   ├── LiquidGlassButton.tsx       # Optical glass button primitives
│   │   │   └── ColorMeshBackdrop.tsx       # Scoped backdrop refraction component
│   │   ├── templates/                      # 12+ Specialized resume template renderers
│   │   ├── AIChatPanel.tsx                 # Conversational AI assistant drawer
│   │   ├── FloatingAIAssistant.tsx         # 72px Draggable floating AI bot widget
│   │   ├── ResumeBuilderForm.tsx           # Multi-step resume section editor
│   │   └── TemplateRenderer.tsx            # Live A4 Canvas renderer
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── aiService.ts                # Gemini API client orchestration
│   │   │   └── atsEngine.ts                # Deterministic ATS scoring algorithm
│   │   └── supabase.ts                     # Supabase client & session persistence
│   └── config/
│       └── authConfig.ts                   # Centralized authentication feature flags
```

---

## 6. 📄 License & Maintainer

- **License**: MIT License
- **Author**: **[Vamsi](https://github.com/vamsi200510)**
- **Repository**: [https://github.com/vamsi200510/SmartCV](https://github.com/vamsi200510/SmartCV)
