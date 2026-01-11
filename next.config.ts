import type { NextConfig } from "next";
import withProgressiveWebAppInitialization from "@ducanh2912/next-pwa";
import path from "path";

/**
 * PWA Configuration - Optimized for 2026 Mobile-First POS
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
 */
const nextConfiguration = {
  output: "standalone",

  // CORREÇÃO: Define explicitamente a raiz do projeto para ignorar lockfiles externos
  outputFileTracingRoot: path.join(__dirname),

  // --- IMAGENS (Preservado conforme solicitado) ---
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

  // --- EXTERNALIZAÇÃO DE PACOTES ---
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

  // CORREÇÃO: Removidas as chaves 'eslint' e 'typescript' do objeto principal
  // No Next 16, se houver erro de 'Unrecognized key', as configurações de lint 
  // devem ser mantidas apenas no .eslintrc.json ou passadas via CLI no build.
};

export default withProgressiveWebApp(nextConfiguration as NextConfig);