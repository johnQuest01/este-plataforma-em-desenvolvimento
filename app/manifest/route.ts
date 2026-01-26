import { NextResponse } from 'next/server';

/**
 * Rota API para servir o manifest.json com headers corretos
 * Garante que o manifest seja servido como application/manifest+json
 * Segue protocolo @.cursorrules: Zero any, TypeScript Strict
 */
export async function GET(): Promise<NextResponse> {
  const manifestContent = {
    name: "Loja Maryland",
    short_name: "Maryland",
    description: "Web App de Loja Virtual",
    start_url: "/",
    display: "standalone",
    background_color: "#5874f6",
    theme_color: "#5874f6",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    categories: ["shopping", "business"],
    share_target: {
      action: "/",
      method: "GET",
      enctype: "application/x-www-form-urlencoded",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };

  return NextResponse.json(manifestContent, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
