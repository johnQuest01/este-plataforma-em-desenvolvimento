// arquivo: next.config.ts
import type { NextConfig as NextConfiguration } from "next";
import withProgressiveWebAppInitialization from "@ducanh2912/next-pwa";

const withProgressiveWebApp = withProgressiveWebAppInitialization({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/placehold\.co\/.*$/,
        handler: "CacheFirst",
        options: {
          cacheName: "placeholder-images",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/replicate\.delivery\/.*$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "artificial-intelligence-images",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
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

const nextConfiguration: NextConfiguration = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "**" }
    ],
    unoptimized: false,
  },
  
  output: "standalone",

  // --- CORREÇÃO CRÍTICA DO PRISMA 7 + NEON ---
  // Isso impede que o Next.js quebre a conexão do banco de dados
  serverExternalPackages: [
    "@google-cloud/vertexai", 
    "@prisma/client", 
    "@neondatabase/serverless", 
    "@prisma/adapter-neon"
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default withProgressiveWebApp(nextConfiguration);