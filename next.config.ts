// next.config.ts
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false, // OTIMIZAÇÃO: Evita reload automático que pode perder estado do usuário
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    // OTIMIZAÇÃO: Cache Runtime para imagens e recursos externos
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/placehold\.co\/.*$/,
        handler: "CacheFirst",
        options: {
          cacheName: "placeholder-images",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 dias
        },
      },
      {
        urlPattern: /^https:\/\/replicate\.delivery\/.*$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "ai-images",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 dias
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Permite imagens do Placeholder (Nosso simulador atual)
      { protocol: 'https', hostname: 'placehold.co' },
      // Permite imagens da IA
      { protocol: 'https', hostname: 'replicate.delivery' },
      // FUTURO: Permita seu bucket aqui
      // { protocol: 'https', hostname: 'pub-*.r2.dev' }, 
    ],
    // OTIMIZAÇÃO: Garante que o Next.js optimize as imagens no build
    unoptimized: false, 
  },
};

export default withPWA(nextConfig);