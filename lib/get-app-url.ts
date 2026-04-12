/**
 * Detecta a URL base do app de forma confiável em qualquer ambiente:
 *   - Desenvolvimento local      → http://localhost:3000
 *   - Vercel Preview/Production  → https://<projeto>.vercel.app  (ou domínio custom)
 *   - Cloudflare / Ngrok / etc.  → lê NEXT_PUBLIC_APP_URL
 *
 * COMO USAR NO VERCEL
 * -------------------
 * 1. No dashboard Vercel → Settings → Environment Variables, adicione:
 *    NEXT_PUBLIC_APP_URL = https://seu-dominio.com   (ex: https://maryland.vercel.app)
 *
 * Se não configurar, o código usa automaticamente VERCEL_URL (gerado pelo próprio Vercel).
 *
 * ─── USO ────────────────────────────────────────────────────────────────────
 *   Servidor (Server Actions, RSC):  getServerAppUrl()
 *   Cliente (browser):               getClientAppUrl()
 *   Qualquer lado:                   getAppUrl() — decide automaticamente
 */

// ─── SERVER-SIDE (não usa window) ────────────────────────────────────────────

export function getServerAppUrl(): string {
  // 1. URL custom explicitamente definida (tem precedência)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }

  // 2. Vercel injeta VERCEL_URL automaticamente (sem protocolo: "xxx.vercel.app")
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Desenvolvimento local
  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}

// ─── CLIENT-SIDE (usa window.location) ───────────────────────────────────────

export function getClientAppUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // SSR fallback — não deveria ser chamado no cliente antes de hidratação
  return getServerAppUrl();
}

// ─── URL de uma loja específica ───────────────────────────────────────────────

export function getSellerStoreUrl(slug: string, isServer = false): string {
  const base = isServer ? getServerAppUrl() : getClientAppUrl();
  return `${base}/loja/${slug}`;
}
