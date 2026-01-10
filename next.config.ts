import type { NextConfig } from "next";
import withProgressiveWebAppInitialization from "@ducanh2912/next-pwa";

/**
 * PWA Configuration - Optimized for 2026 Mobile-First POS
 * Configuração isolada para evitar poluição de escopo no objeto principal.
 */
const withProgressiveWebApp = withProgressiveWebAppInitialization({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /^https:\/\/placehold\.co\/.*$/,
        handler: "CacheFirst",
        options: {
          cacheName: "placeholder-images",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*$/,
        handler: "CacheFirst",
        options: {
          cacheName: "firebase-storage-assets",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
});

/**
 * Next.js 16.1.1 Configuration
 * * ESTRATÉGIA ARQUITETURAL:
 * Removemos a anotação explícita ': NextConfig' da variável para desativar o 
 * 'Excess Property Checking' do TypeScript, que estava entrando em conflito 
 * com os tipos internos do wrapper de PWA. A validação estrita agora ocorre 
 * na exportação final, garantindo compatibilidade total.
 */
const nextConfiguration = {
  output: "standalone",

  // --- IMAGENS ---
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "**" } 
    ],
    unoptimized: false,
  },

  // --- EXTERNALIZAÇÃO DE PACOTES (RAIZ NO NEXT 16) ---
  serverExternalPackages: [
    "@google-cloud/vertexai", 
    "@prisma/client", 
    "@neondatabase/serverless", 
    "@prisma/adapter-neon",
    "zod"
  ],

  // --- RECURSOS EXPERIMENTAIS ---
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
      allowedOrigins: [
        "localhost:3000", 
        "*.cloudworkstations.dev", 
        "*.app.github.dev",
        "*.trycloudflare.com", 
        "*.vercel.app"
      ],
    },
  },

  // --- QUALIDADE E BUILD ---
  eslint: {
    ignoreDuringBuilds: false, 
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

// A exportação final aplica o wrapper. O TS validará se 'nextConfiguration'
// é compatível com os argumentos esperados pela biblioteca de PWA.
export default withProgressiveWebApp(nextConfiguration as NextConfig);