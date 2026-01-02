import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalAdmin } from '@/components/admin/GlobalAdmin';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

// IMPORTAR O GUARDIAN
import { MasterGuardianDashboard } from "@/components/builder/blocks/MasterGuardianDashboard";

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
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        {children}
        
        <GlobalAdmin />
        <InstallPrompt />

        {/* INSERIR O GUARDIAN AQUI */}
        <MasterGuardianDashboard />
      </body>
    </html>
  );
}