# PACOTE 4 — Configurações do Projeto
> Envie este arquivo ao Google AI Studio na primeira vez ou quando criar novos arquivos de config.
> Contém: tsconfig.json · next.config.ts · postcss.config.mjs · components.json

---

## 📄 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "baseUrl": ".",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

### Regras importantes do TypeScript neste projeto

| Regra | Impacto |
|-------|---------|
| `"strict": true` | Todos os tipos obrigatórios. Nunca usar `any`. |
| `"@/*": ["./*"]` | Alias `@/` aponta para a raiz do projeto. Ex.: `@/lib/utils` = `./lib/utils` |
| `"moduleResolution": "bundler"` | Modo Next.js/Vite — não usar extensões nos imports |
| `"noEmit": true` | TypeScript só valida, o Next.js compila |

---

## 📄 next.config.ts

```typescript
import type { NextConfig } from 'next';
import withProgressiveWebAppInitialization from '@ducanh2912/next-pwa';
import path from 'path';

// PWA desabilitado em desenvolvimento
const shouldDisablePWA = process.env.NODE_ENV === 'development' && !process.env.ENABLE_PWA_DEV;

const withProgressiveWebApp = withProgressiveWebAppInitialization({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: shouldDisablePWA,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 } },
      },
      {
        urlPattern: /^https:\/\/placehold\.co\/.*$/,
        handler: 'CacheFirst',
        options: { cacheName: 'placeholder-images', expiration: { maxEntries: 50, maxAgeSeconds: 2592000 } },
      },
    ],
  },
});

const nextConfiguration = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: false,
  },

  serverExternalPackages: [
    '@google-cloud/vertexai',
    '@prisma/client',
    '@neondatabase/serverless',
    '@prisma/adapter-neon',
    'zod',
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
      allowedOrigins: [
        'localhost:3000',
        '192.168.15.24:3000',
        '*.cloudworkstations.dev',
        '*.app.github.dev',
        '*.trycloudflare.com',
        '*.vercel.app',
      ],
    },
  },

  allowedDevOrigins: ['192.168.15.24'],
};

export default withProgressiveWebApp(nextConfiguration as NextConfig);
```

### Notas importantes sobre o Next.js deste projeto

| Configuração | Por quê |
|---|---|
| `output: 'standalone'` | Build otimizado para deploy em containers (Vercel, Railway, etc.) |
| `serverExternalPackages: ['zod']` | Zod é usado no servidor — evita bundling desnecessário |
| `bodySizeLimit: '50mb'` | Server Actions suportam upload de vídeos/imagens grandes |
| `remotePatterns: ['**']` | Imagens de qualquer domínio (Cloudinary, Firebase, Neon, etc.) |
| `dangerouslyAllowSVG: true` | SVGs de placehold.co e outros usados em avatars |

---

## 📄 postcss.config.mjs

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

> **Tailwind v4**: Este projeto usa Tailwind v4 via `@tailwindcss/postcss`.
> **Não existe `tailwind.config.js`** — a configuração é feita via CSS no `app/globals.css` com `@import "tailwindcss"`.

---

## 📄 components.json (shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Stack completa do projeto

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16.1.1 | Framework React (App Router) |
| React | 19.2.1 | UI |
| TypeScript | Strict | Tipagem (sem `any`) |
| Tailwind CSS | v4 | Estilização |
| Framer Motion | — | Animações |
| Prisma | — | ORM |
| Neon PostgreSQL | — | Banco de dados |
| Zod | — | Validação de schemas |
| Lucide React | — | Ícones |
| shadcn/ui | new-york | Componentes base |

---

## Estrutura de pastas

```
/
├── app/
│   ├── actions/          # Server Actions ('use server')
│   ├── admin/manage/     # Painel de gerenciamento
│   ├── dashboard/        # Tela inicial do app
│   ├── inventory/        # Inventário (comprador e vendedor)
│   ├── login/            # Autenticação
│   └── globals.css       # Estilos globais + Tailwind v4
├── components/
│   ├── admin/            # Componentes do painel admin
│   ├── auth/             # Formulários de autenticação
│   ├── builder/
│   │   ├── blocks/       # Blocos LEGO (componentes de tela)
│   │   ├── ui/           # Modais e UI reutilizável
│   │   ├── BlockRegistry.ts   # Mapa tipo → componente
│   │   └── BlockRender.tsx    # Renderizador de blocos
│   └── layouts/          # RootLayoutShell
├── data/
│   ├── initial-state.ts  # Blocos da tela home
│   ├── inventory-state.ts
│   └── templates/        # Templates por nicho
├── docs/                 # Este pacote de documentação
├── lib/
│   ├── design-system/    # Tokens de UI
│   ├── local-db.ts       # Sessão do usuário (localStorage)
│   ├── prisma.ts         # Cliente Prisma singleton
│   └── utils.ts          # cn() e helpers
├── prisma/
│   └── schema.prisma     # Modelos do banco
├── schemas/              # Schemas Zod
│   ├── registration-schema.ts
│   ├── auth-schema.ts
│   └── blocks/           # Schemas de dados dos blocos
└── types/
    └── builder.ts        # Tipos centrais da arquitetura LEGO
```

---

## Convenções obrigatórias para o AI Studio seguir

1. **Sem `any`** — usar `unknown`, generics ou tipos explícitos
2. **Server Actions** sempre com `'use server'` no topo e validação Zod antes de tocar no Prisma
3. **Novos blocos** seguem a interface `BlockComponentProps` de `@/types/builder`
4. **Cores** sempre do `COLORS` do design-system ou os valores HEX do projeto: `#5874f6` (azul), `#F5A5C2` (rosa), `#50E3C2` (verde), `#eeeeee` (fundo)
5. **Alias `@/`** para todos os imports internos (nunca `../../`)
6. **Framer Motion** para animações (não CSS puro)
7. **`cn()`** de `@/lib/utils` para classes condicionais
8. **Scroll em páginas**: container com `h-dvh-real flex flex-col overflow-hidden` + filho com `flex-1 overflow-y-auto ios-scroll-enabled pb-28`
