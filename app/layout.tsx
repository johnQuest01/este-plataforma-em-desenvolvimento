// path: src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ Importamos APENAS o Shell (que já contém o Guardian e Admin)
import { RootLayoutShell } from "@/components/layouts/RootLayoutShell";

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loja Maryland",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Loja Maryland",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#5874f6",
    "msapplication-config": "/browserconfig.xml",
  },
  openGraph: {
    type: "website",
    title: "Loja Maryland",
    description: "Sua loja virtual exclusiva",
  },
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
    <html lang="pt-BR" className="selection:bg-indigo-500/30">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-200`}>
        {/* 
            ✅ Delegamos a renderização para o Shell Rastreado.
            Isso ativará o 'withGuardian' dentro do RootLayoutShell.tsx
        */}
        <RootLayoutShell>
          {children}
        </RootLayoutShell>
      </body>
    </html>
  );
}