// path: src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { GlobalAdmin } from '@/components/admin/GlobalAdmin';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { MasterGuardianDashboard } from "@/components/builder/blocks/MasterGuardianDashboard";
import { GlobalGuardianObserver } from "@/components/builder/blocks/master/RexRuntimePixel";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';

  return (
    <html lang="pt-BR" className="selection:bg-indigo-500/30">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-200`}>
        <main className="relative z-0">
          {children}
        </main>
        
        <GlobalAdmin />
        <InstallPrompt />

        {isDevelopmentEnvironment && (
          <>
            <GlobalGuardianObserver />
            <MasterGuardianDashboard />
          </>
        )}
      </body>
    </html>
  );
}