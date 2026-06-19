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
        ['--font-inter' as any]: 'Inter, system-ui, sans-serif',
        ['--font-poppins' as any]: 'Poppins, sans-serif',
        ['--font-manrope' as any]: 'Manrope, sans-serif'
      }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
