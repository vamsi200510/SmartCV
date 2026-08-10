# SmartCV Design System

This document outlines the core design rules, constraints, and tokens used across SmartCV. Keeping this consistent ensures that every page feels premium and unified.

## 📏 Layout & Spacing
- **Grid System:** 8px base grid.
- **Max Width:** `max-w-7xl` (1280px) for standard page containers.
- **Responsive Breakpoints:** Tailwind defaults (sm: 640px, md: 768px, lg: 1024px, xl: 1280px).

## 🔲 Border Radius
- **Small components (Inputs, Badges):** `8px` (`rounded-lg`)
- **Medium components (Cards, Modals):** `16px` (`rounded-2xl`)
- **Large components (Hero images, Feature blocks):** `24px` (`rounded-3xl`)
- **Pills / Avatars:** `9999px` (`rounded-full`)

## ⚡ Animation & Transitions
- **Duration:** 250ms (`duration-250` or `duration-300` in Tailwind)
- **Easing:** Ease-out (`ease-out`)
- **Micro-interactions:** Hover lifts (`-translate-y-1`), scale up (`scale-105`), subtle shadow changes.
- **Page Transitions:** Framer Motion `AnimatePresence` with subtle fade & slide.

## 🔤 Typography
- **Font Family:** Inter (Next.js `next/font/google`).
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700).

### Heading Scale
- **H1:** `56px` (`text-5xl` to `text-6xl` responsive) - Hero headers
- **H2:** `40px` (`text-4xl`) - Section headers
- **H3:** `32px` (`text-3xl`) - Feature titles
- **H4:** `24px` (`text-2xl`) - Card titles
- **H5:** `20px` (`text-xl`) - Small titles

### Body Scale
- **Body Large:** `18px` (`text-lg`) - Lead paragraphs
- **Body Base:** `16px` (`text-base`) - Standard text
- **Body Small:** `14px` (`text-sm`) - Captions, metadata, hints

## 🎨 Colors & Themes
- **Mode:** Light Mode Only. Dark mode has been explicitly removed to reduce technical debt and ensure absolute consistency.
- **Primary:** Deep Blue / Indigo gradients (`indigo-600` to `blue-600`).
- **Neutrals:** Slate / Gray scale (`slate-50` to `slate-900`).
- **Success:** Emerald / Green scale (`emerald-500`).
- **Warning:** Amber / Yellow scale (`amber-500`).
- **Danger:** Rose / Red scale (`rose-500`).

## 🃏 Cards & Surfaces
- **Base Surface:** White (`bg-white`)
- **Subtle Surface:** Off-white (`bg-slate-50`)
- **Glass / Floating:** White with opacity and blur (`bg-white/80 backdrop-blur-md`). Used for sticky navs and floating toolbars.
- **Shadows:** Soft, diffused shadows (`shadow-sm`, `shadow-md`, `shadow-xl`). Avoid harsh, dark shadows.
- **Borders:** Thin, subtle borders (`border border-slate-200`).

## 🔘 Buttons
- **Primary:** Solid background, white text, subtle hover lift, shadow. (e.g., `bg-indigo-600 hover:bg-indigo-700`).
- **Secondary:** White background, thin border, dark text, subtle hover fill. (e.g., `bg-white border border-slate-200 hover:bg-slate-50`).
- **Ghost:** No background, no border, text changes color or gains light background on hover. (e.g., `hover:bg-slate-100`).
- **Danger:** Solid red or ghost red, used only for destructive actions.

## 🖼️ Icons & Illustrations
- **Icons:** **Lucide Icons** only. Ensure consistent stroke width (usually `2px`).
- **Illustrations:** 3D style or soft gradient illustrations. Avoid flat corporate vector art.
- **Empty States:** Always pair an illustration with a clear message and a primary CTA.

## 🚫 Anti-Patterns (Do NOT use)
- `alert()` or `confirm()` dialogs (Use custom modals or toasts).
- `isDarkMode` state or `dark:` Tailwind classes.
- Generic placeholders.
- Complex prop chains for basic styling.
