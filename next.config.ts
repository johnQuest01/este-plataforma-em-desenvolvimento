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
  // --- CORREÇÃO TURBOPACK (Next 16) ---
  // Silencia o erro de conflito entre Webpack (PWA) e Turbopack
  turbopack: {},

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "replicate.delivery" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // O coringa permite flexibilidade no cadastro de referências externas
      { protocol: "https", hostname: "**" } 
    ],
    unoptimized: false,
  },
  
  output: "standalone",

  // Mantém pacotes críticos fora do bundle do cliente
  serverExternalPackages: [
    "@google-cloud/vertexai", 
    "@prisma/client", 
    "@neondatabase/serverless", 
    "@prisma/adapter-neon"
  ],

  experimental: {
    // No Next 16, serverActions já são estáveis, mas as configurações de 
    // limite de tamanho e origens permitidas permanecem aqui.
    serverActions: {
      bodySizeLimit: "50mb",
      allowedOrigins: [
        "localhost:3000", 
        "*.cloudworkstations.dev", 
        "*.app.github.dev",
        "*.trycloudflare.com" // Adicionado para suportar seus túneis Cloudflare
      ],
    },
  },
};

export default withProgressiveWebApp(nextConfiguration);