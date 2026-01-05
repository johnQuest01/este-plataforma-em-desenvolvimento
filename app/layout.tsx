// path: src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ Importamos o Shell (Client Component) que contém o Guardian
import { RootLayoutShell } from "@/components/layout/RootLayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loja Maryland",
  description: "Sua loja virtual exclusiva",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#5874f6",
};

// ❌ SEM 'use client' aqui (Preserva SEO)
// ❌ SEM withGuardian aqui (Evita erro de hidratação no <html>)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="selection:bg-indigo-500/30">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-200`}>
        {/* O Shell gerencia a UI e o Guardian */}
        <RootLayoutShell>
          {children}
        </RootLayoutShell>
      </body>
    </html>
  );
}