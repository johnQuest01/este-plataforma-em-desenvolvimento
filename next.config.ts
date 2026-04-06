import type { NextConfig } from "next";
import withProgressiveWebAppInitialization from "@ducanh2912/next-pwa";
import path from "path";

const shouldDisableProgressiveWebApp = process.env.NODE_ENV === "development" && !process.env.ENABLE_PWA_DEV;

const withProgressiveWebApp = withProgressiveWebAppInitialization({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: shouldDisableProgressiveWebApp,
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
      {
        urlPattern: /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.*$/,
        handler: "CacheFirst",
        options: {
          cacheName: "vercel-blob-assets",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
});

const nextConfiguration: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }
    ],
    unoptimized: false,
  },
  // 🛡️ Garante que os adaptadores nativos rodam perfeitamente na Vercel
  serverExternalPackages: [
    "@google-cloud/vertexai", 
    "@prisma/client", 
    "@neondatabase/serverless", 
    "@prisma/adapter-neon",
    "zod"
  ],
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
};

export default withProgressiveWebApp(nextConfiguration);