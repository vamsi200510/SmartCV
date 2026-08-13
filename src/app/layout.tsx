import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/design-system";

export const metadata: Metadata = {
  title: "SmartCV — Premium AI Resume Builder",
  description: "Build ATS-optimized resumes in minutes. AI-powered bullet rewriting, 12+ premium templates, and real-time preview.",
  keywords: ["resume builder", "ATS resume", "AI resume", "CV builder"],
  openGraph: {
    title: "SmartCV — Premium AI Resume Builder",
    description: "Build ATS-optimized resumes in minutes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7C3AED",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Lato:wght@300;400;700;900&family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800;900&family=Source+Sans+3:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FFFDD0] text-[#0F172A]">

        {/* Hidden SVG filters for liquid glass displacement distortion */}
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="liquid-glass-distortion" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.015 0.015"
                numOctaves="2"
                seed="3"
                stitchTiles="stitch"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        <AuthProvider>
          <ToastProvider>
            <div className="relative z-10 flex flex-col min-h-full flex-1">
              {children}
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

