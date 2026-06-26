import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "SmartCV - Premium Resume Builder",
  description: "AI-Powered Resume Builder & Verification Gateway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
      style={{
        colorScheme: 'light dark',
        ['--font-geist' as any]: 'Geist, ui-sans-serif, system-ui, sans-serif',
        ['--font-geist-sans' as any]: 'Geist, ui-sans-serif, system-ui, sans-serif',
        ['--font-geist-mono' as any]: 'ui-monospace, SFMono-Regular, Roboto Mono, Menlo, Monaco, Consolas, monospace',
        ['--font-inter' as any]: "'Inter', system-ui, sans-serif",
        ['--font-poppins' as any]: "'Poppins', sans-serif",
        ['--font-manrope' as any]: "'Manrope', sans-serif",
        ['--font-source-sans' as any]: "'Source Sans 3', system-ui, sans-serif",
        ['--font-ibm-plex' as any]: "'IBM Plex Sans', system-ui, sans-serif",
        ['--font-plus-jakarta' as any]: "'Plus Jakarta Sans', system-ui, sans-serif",
        ['--font-lato' as any]: "'Lato', system-ui, sans-serif"
      }}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Lato:wght@300;400;700;900&family=Manrope:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800;900&family=Source+Sans+3:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

