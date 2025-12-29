// arquivo: next.config.ts
import type { NextConfig as NextConfiguration } from "next";
import withProgressiveWebAppInitialization from "@ducanh2912/next-pwa";

const withProgressiveWebApp = withProgressiveWebAppInitialization({
  // OBRIGATÓRIO: Chaves da API da biblioteca (mantenha os nomes exatos para evitar erros de tipo)
  dest: "public",
  cacheOnFrontEndNav: true, // Habilita cache na navegação de front-end
  aggressiveFrontEndNavCaching: true, // Caching agressivo para performance
  reloadOnOnline: false, // Evita recarregamento ao voltar online para preservar estado do e-commerce
  disable: process.env.NODE_ENV === "development", // Desativa o PWA em desenvolvimento para facilitar o debug
  
  workboxOptions: {
    // OTIMIZAÇÃO: Cache em tempo de execução para o seu Globo 3D e Imagens de IA
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
          cacheName: "artificial-intelligence-images",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 dias
        },
      },
      {
        // OTIMIZAÇÃO: Essencial para texturas do Globo 3D e fotos de produtos no Firebase
        urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*$/,
        handler: "CacheFirst",
        options: {
          cacheName: "firebase-storage-assets",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 dias
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
      { protocol: "https", hostname: "firebasestorage.googleapis.com" }, // Domínio do seu bucket Firebase
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
    unoptimized: false, // Garante otimização de imagem para mobile no build
  },
  // Requisito para hospedar no Firebase App Hosting através do Firebase Studio
  output: "standalone",
  experimental: {
    // Integração necessária para utilizar o Vertex AI no servidor Next.js
    serverComponentsExternalPackages: ["@google-cloud/vertexai"],
  },
};

export default withProgressiveWebApp(nextConfiguration);