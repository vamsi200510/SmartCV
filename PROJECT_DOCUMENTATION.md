# SmartCV — Complete Technical Architecture & Detailed Project Documentation

Welcome to the comprehensive technical documentation for **SmartCV**, a state-of-the-art AI-powered Resume Builder and ATS Optimization platform built with Next.js, TypeScript, Tailwind CSS, Supabase, Google Gemini AI, and Puppeteer.

---

## 1. Executive Summary & Core Value Proposition

**SmartCV** is a high-performance web application designed to help job seekers, students, and professionals craft ATS-friendly, recruiter-approved resumes in minutes. Unlike basic text-to-PDF tools, SmartCV combines:

- **Real-Time Optical Canvas Syncing**: Changes in the form editor update the A4 paper canvas instantly.
- **Deep ATS (Applicant Tracking System) Intelligence**: Evaluates keyword density, formatting compliance, and role suitability against real-time job descriptions.
- **Google Gemini AI Optimization**: Rewrites weak bullet points with action verbs, quantifies achievements, and suggests missing industry skills.
- **100% Vector-Sharp PDF Generation**: Uses a dedicated headless Puppeteer engine (`/builder/print-viewport`) to render pixel-perfect, 300+ DPI PDF downloads.
- **Apple-Inspired Glassmorphism UI**: High-intensity Liquid Glass controls, solid white content cards, and crisp typography.

---

## 2. Technology Stack & Key Dependencies

### Frontend & Application Layer
- **Framework**: Next.js 16.2.9 (App Router with Turbopack & React Server Components)
- **UI Engine**: React 19.2.4
- **Styling**: Tailwind CSS v4 with custom CSS Material System in `src/app/globals.css`
- **Iconography**: Lucide React (`lucide-react`)
- **Animations**: Framer Motion 12.40.0 (`framer-motion`)

### Backend, Database & Authentication
- **Database & SSR Auth**: Supabase SSR (`@supabase/ssr`) & Supabase Client (`@supabase/supabase-js`)
- **Database Engine**: PostgreSQL with JSONB schema storage for flexible resume data

### Artificial Intelligence & Processing
- **AI Model**: Google Gemini API (`@google/genai` v2.10.0) — Gemini 2.5 Flash Lite & Flash Models
- **Document Parsing**: `pdf-parse` (PDF text extraction) and `mammoth` (Docx file parsing)

### PDF Render Engine & Emailing
- **PDF Generation**: Puppeteer (`puppeteer` v25.1.0) headless browser print viewport
- **Email Delivery**: Resend (`resend`) & Nodemailer (`nodemailer`) for 6-digit OTP verification codes

---

## 3. UI/UX Design System & Material Identity

SmartCV features a modern productivity design language inspired by Apple UI conventions:

### Color Palette Architecture
1. **Application Canvas**: Plain Solid White (`#FFFFFF`) / Soft Slate Canvas (`#F8FAFC`).
2. **Primary Brand Accent**: Vibrant Royal Purple (`#7C3AED`, hover `#6D28D9`, soft `bg-purple-50`, border `border-purple-200`).
3. **Solid Content Cards**: Thick Solid Pure White (`#FFFFFF`, opacity 100%, border `border-slate-200`, shadow `shadow-xs` / `shadow-sm`).
4. **Semantic Color Anchors**:
   - **Emerald / Success**: `#10B981` (hover `#059669`, score badges, saved indicators).
   - **Amber / Warning**: `#F59E0B` (hover `#D97706`, ATS missing keywords, tip highlights).
   - **Rose / Danger**: `#EF4444` (hover `#DC2626`, delete/destructive actions).
   - **Dark Slate Anchors**: `#0F172A`, `#1E1035`, `#130826`.

### Liquid Glassmorphism Material System
Controlled Liquid Glass treatment is used selectively for floating elements:
- **Optical Backdrop Blur**: `backdrop-blur-2xl` (`32px` to `40px` blur radius).
- **Color Refraction Saturation**: Boosted `200%` saturation for vibrant background refraction.
- **Specular Highlight Borders**: Multi-layered inset light borders (`inset 0 1.5px 0 0 rgba(255, 255, 255, 0.98)`).

### The Sacred Paper Isolation Rule
To guarantee PDF print fidelity, elements styled with `.resume-paper` or `.resume-canvas-paper` are hardcoded to `#FFFFFF !important` with zero blurs, filters, or backdrop transforms.

### Dynamic A4 Scaling Engine (`A4ResumePreview.tsx`)
Rather than using static CSS scale factors, resume preview cards use an internal `ResizeObserver` that computes `containerWidth / 794` in real-time. This ensures templates fit **100% edge-to-edge** (`aspect-[210/297]`) with zero empty margins.

---

## 4. Codebase Directory Structure

```
SmartCV/
├── src/
│   ├── app/                         # Next.js App Router Page & API Routes
│   │   ├── about/                   # About page
│   │   ├── api/                     # Serverless API Endpoints
│   │   │   ├── ai/                  # AI endpoints (chat, score, optimize, summary)
│   │   │   ├── auth/                # Auth endpoints (send-otp, verify-otp, profile)
│   │   │   └── resumes/             # Resume CRUD & PDF export endpoints
│   │   ├── auth/                    # Login / Signup / OTP verification pages
│   │   ├── builder/                 # Main Resume Builder Workspace
│   │   │   └── print-viewport/      # Puppeteer PDF print target page
│   │   ├── dashboard/               # Main Dashboard (Resumes, Templates, ATS, AI)
│   │   ├── onboarding/              # User onboarding wizard
│   │   ├── profile/                 # Profile settings page
│   │   ├── templates/               # Filterable Template Gallery
│   │   ├── globals.css              # Design tokens & Material utility classes
│   │   ├── layout.tsx               # Root HTML layout & fonts
│   │   └── page.tsx                 # Public Landing Page
│   ├── components/                  # Shared React Components
│   │   ├── A4ResumePreview.tsx      # Responsive edge-to-edge A4 preview wrapper
│   │   ├── AIChatPanel.tsx          # AI Assistant chat panel
│   │   ├── DesignWorkspace.tsx      # Font, spacing, & color customization controls
│   │   ├── FormPrimitives.tsx       # Standardized input fields & section cards
│   │   ├── ResumeBuilderForm.tsx    # Multi-section resume form editor
│   │   ├── TemplateRenderer.tsx     # Core renderer for 12+ resume templates
│   │   ├── TemplatePreviewModal.tsx # Fullscreen template preview modal
│   │   └── ui/                     # Reusable design system primitives
│   ├── context/                     # AuthContext for session management
│   ├── lib/                         # Core utilities, Supabase admin client, AI services
│   └── types/                       # TypeScript interfaces (ResumeData, Template, User)
```

---

## 5. Detailed Feature & Route Breakdown

### 1. Landing Page (`src/app/page.tsx`)
- **Hero Section**: Headline, feature pills, quick CTA buttons, and interactive glass browser mockup.
- **Trusted Stats**: Key numbers (12+ Templates, AI Optimization, 100% Free).
- **Bento Grid Features**: Visual showcase of Real-Time Canvas, AI Bullet Rewriting, and ATS Checker.
- **Interactive Step Flow**: 3-step visualization (Select Template -> Fill & AI Optimize -> Download PDF).
- **Live ATS Score Simulation**: Interactive progress bars showcasing formatting, keyword density, and impact metrics.
- **Template Showcase**: Interactive cards rendering live template thumbnails via `A4ResumePreview`.

### 2. Authentication System (`src/app/auth/page.tsx`)
- **Dual Authentication**:
  1. **Password-based Auth**: Supabase Email & Password.
  2. **OTP Verification**: 6-digit email OTP generated via Nodemailer/Resend with a 60-second cooldown timer.
- **Branding Panel**: Left column highlighting key metrics with auto-rotating feature bullets.

### 3. Application Dashboard (`src/app/dashboard/page.tsx`)
The dashboard is split into 5 tabs:
1. **Home / Recent Drafts**:
   - Displays user's recent resumes in a 3-column grid with completion percentage progress bars, ATS scores, and last edited relative timestamps.
   - Includes quick action buttons to edit, copy/duplicate, or delete drafts.
   - Features a "Recruiter Approved Layouts" sidebar recommendation panel.
2. **Templates Gallery**: Filterable by role categories (ATS Friendly, Software Engineer, Fresher, Executive, Designer).
3. **Real-Time ATS Analyzer**:
   - Allows users to select a resume and paste any job description.
   - Calls `/api/resumes/ats-analyze` to return overall score, matched keywords, missing keywords, and actionable tips.
4. **AI Assistant Tab**: Embedded chat interface for quick resume enhancements.
5. **Settings Tab**: Form to update name, department, experience level, and career goals.

### 4. Resume Builder Workspace (`src/app/builder/page.tsx`)
The core workspace offering 4 view modes:
- **Form Mode**: Left-side editor with expandable sections (Personal Info, Summary, Experience, Education, Projects, Skills, Certifications, Custom Sections).
- **Design Mode**: Controls to modify font family (*Inter, DM Sans, Poppins, Manrope, Jakarta, Lato*), font size, line spacing, section density (*compact, balanced, spacious*), and accent colors.
- **Split Mode**: Side-by-side view with live form editor on the left and live A4 canvas on the right.
- **Preview Mode**: Full-screen optical canvas view with interactive zoom slider (30% to 150%).
- **Floating Action Control Dock**:
  - **ATS Button**: Solid Emerald (`#10B981`) showing real-time ATS match percentage.
  - **Template Button**: Solid Purple (`#7C3AED`) to open the template switcher.
  - **Export PDF Button**: Solid Amber (`#F59E0B`) to trigger Puppeteer PDF compilation.

---

## 6. Template Engine (`TemplateRenderer.tsx`)

`TemplateRenderer.tsx` contains 12+ industry-tailored resume layouts rendered at a native A4 resolution of **794px × 1123px**:

1. **`ats-professional`**: Single-column clean layout optimized for corporate ATS parsers.
2. **`tech-minimal`**: Modern developer layout with prominent skills badges and repository links.
3. **`silicon-valley`**: Clean, high-impact layout modeled after top tech company standards.
4. **`modern-gradient`**: Sleek layout with colored section headers for creative roles.
5. **`executive-pro`**: Two-column layout designed for senior management and executives.
6. **`creative-portfolio`**: Vibrant two-column design with portfolio highlights.
7. **`clean-academic`**: Formal layout suitable for research, medical, and academic CVs.
8. **`impact-startup`**: Modern layout focusing on key achievements and metrics.
9. **`faang-elite`**: High-density single-column template used by tier-1 engineering candidates.
10. **`one-page-compact`**: Optimized single-page layout for candidates with dense work histories.
11. **`modern-two-column`**: Balanced two-column split layout.
12. **`product-manager-pro`**: Specialized layout highlighting product metrics, leadership, and technical skills.

---

## 7. AI Subsystem & API Endpoints

All AI operations interface with Google Gemini API via serverless Next.js API routes:

- `/api/ai/score-resume`: Evaluates resume quality and assigns ATS scores.
- `/api/ai/suggest-bullets`: Generates impact-driven bullet points for work experience.
- `/api/ai/write-summary`: Writes tailored professional summaries based on career goals.
- `/api/ai/suggest-skills`: Suggests relevant hard and soft skills for a given job title.
- `/api/ai/optimize-full-resume`: Performs comprehensive grammar, impact, and keyword optimization across all sections.
- `/api/ai/extract-job-keywords`: Extracts required skills and qualifications from raw job descriptions.
- `/api/resumes/ats-analyze`: Compares resume JSON payload against job description text to identify missing keywords.

---

## 8. Database Schema & Data Models

SmartCV uses Supabase PostgreSQL with two core tables:

### `profiles` Table
- `id` (uuid, primary key, references `auth.users`)
- `full_name` (text)
- `profile_image` (text URL)
- `department` (text)
- `experience_level` (text)
- `career_goal` (text)
- `created_at` / `updated_at` (timestamp)

### `resumes` Table
- `id` (uuid, primary key)
- `user_id` (uuid, references `profiles.id`)
- `title` (text)
- `role` (text)
- `category` (text)
- `template_id` (text)
- `resume_data` (jsonb — stores contact info, summary, experience, education, projects, skills, certifications, and customization settings)
- `created_at` / `updated_at` (timestamp)

---

## 9. Verification & Build Commands

- **Development Server**: `npm run dev` (Runs Next.js dev server on `http://localhost:3000`)
- **Production Build**: `npm run build` (Compiles TypeScript and generates static/dynamic routes using Next.js Turbopack)
- **Production Start**: `npm start` (Launches production node server)

---

*Documentation compiled and verified for SmartCV.*
