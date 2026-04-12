# PACOTE 3 — Design System
> Envie este arquivo para o Google AI Studio criar novas telas com visual consistente.
> Contém: SIZING · SPACING · COLORS · TYPOGRAPHY · BORDERS · SHADOWS · lib/utils · globals.css

---

## 📄 lib/design-system/index.ts (ponto de entrada)

```typescript
// Importação única para tudo:
// import { SIZING, COLORS, SPACING, TYPOGRAPHY, BORDERS, SHADOWS, cn } from '@/lib/design-system';

export * from './spacing';
export * from './sizing';
export * from './typography';
export * from './borders';
export * from './shadows';
export * from './colors';
export { cn } from '@/lib/utils';
```

---

## 📄 lib/design-system/colors.ts

```typescript
export const COLORS = {
  values: {
    primary: '#5874f6',
    secondary: '#F5A5C2',
    success: '#50E3C2',
    warning: '#fb923c',
    error: '#ff4d6d',
    info: '#3b82f6',
    white: '#ffffff',
    black: '#000000',
  },
  bg: {
    primary: 'bg-[#5874f6]',
    primaryLight: 'bg-[#5874f6]/10',
    secondary: 'bg-[#F5A5C2]',
    secondaryLight: 'bg-[#F5A5C2]/10',
    success: 'bg-[#50E3C2]',
    warning: 'bg-[#fb923c]',
    error: 'bg-[#ff4d6d]',
    white: 'bg-white',
    black: 'bg-black',
    gray: 'bg-gray-100',
    grayLight: 'bg-gray-50',
    grayDark: 'bg-gray-800',
    transparent: 'bg-transparent',
  },
  text: {
    primary: 'text-[#5874f6]',
    secondary: 'text-[#F5A5C2]',
    success: 'text-[#50E3C2]',
    warning: 'text-[#fb923c]',
    error: 'text-[#ff4d6d]',
    white: 'text-white',
    black: 'text-gray-900',
    gray: 'text-gray-600',
    grayLight: 'text-gray-400',
    grayDark: 'text-gray-800',
    muted: 'text-gray-500',
  },
  border: {
    primary: 'border-[#5874f6]',
    secondary: 'border-[#F5A5C2]',
    success: 'border-[#50E3C2]',
    warning: 'border-[#fb923c]',
    error: 'border-[#ff4d6d]',
    white: 'border-white',
    gray: 'border-gray-200',
    grayLight: 'border-gray-100',
    grayDark: 'border-gray-400',
  },
  gradient: {
    primary: 'bg-gradient-to-r from-[#5874f6] to-[#6b8af7]',
    secondary: 'bg-gradient-to-r from-[#F5A5C2] to-[#f7b5ce]',
    success: 'bg-gradient-to-r from-[#50E3C2] to-[#6febd3]',
    sunset: 'bg-gradient-to-r from-[#fb923c] to-[#ff4d6d]',
  },
} as const;

export type BgColor = keyof typeof COLORS.bg;
export type TextColor = keyof typeof COLORS.text;
```

---

## 📄 lib/design-system/typography.ts

```typescript
export const TYPOGRAPHY = {
  size: {
    xs: 'text-xs',     // 12px
    sm: 'text-sm',     // 14px
    base: 'text-base', // 16px
    lg: 'text-lg',     // 18px
    xl: 'text-xl',     // 20px
    '2xl': 'text-2xl', // 24px
    '3xl': 'text-3xl', // 30px
  },
  weight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  },
  heading: {
    h1: 'text-3xl font-black leading-tight',
    h2: 'text-2xl font-bold leading-tight',
    h3: 'text-xl font-bold leading-tight',
    h4: 'text-lg font-bold leading-tight',
    h5: 'text-base font-bold leading-tight',
  },
  body: {
    xs: 'text-xs font-normal leading-normal',
    sm: 'text-sm font-normal leading-normal',
    base: 'text-base font-normal leading-normal',
  },
  button: {
    sm: 'text-xs font-semibold',
    base: 'text-sm font-semibold',
    lg: 'text-base font-bold',
  },
  caption: {
    xs: 'text-xs font-normal text-gray-500',
    sm: 'text-sm font-normal text-gray-600',
  },
} as const;
```

---

## 📄 lib/design-system/spacing.ts

```typescript
export const SPACING = {
  container: {
    none: '', xs: 'px-2 py-1', sm: 'px-3 py-2',
    md: 'px-4 py-3', lg: 'px-6 py-4', xl: 'px-8 py-6',
  },
  gap: {
    none: 'gap-0', xs: 'gap-1', sm: 'gap-2',
    md: 'gap-3', lg: 'gap-4', xl: 'gap-6', '2xl': 'gap-8',
  },
  margin: {
    section: 'mb-4',   // Entre seções
    component: 'mb-2', // Entre componentes
    element: 'mb-1',   // Entre elementos
  },
  horizontal: {
    none: 'px-0', xs: 'px-2', sm: 'px-3', md: 'px-4', lg: 'px-6', xl: 'px-8',
  },
  vertical: {
    none: 'py-0', xs: 'py-1', sm: 'py-2', md: 'py-3', lg: 'py-4', xl: 'py-6',
  },
} as const;
```

---

## 📄 lib/design-system/sizing.ts

```typescript
export const SIZING = {
  container: {
    mobile: 'w-full',
    desktop: 'w-full max-w-[420px]', // Largura do celular simulado em desktop
    wide: 'w-full max-w-[1600px]',
    full: 'w-full h-full',
    fullScreen: 'w-full h-dvh-real',
  },
  header: {
    mini: 'h-12', compact: 'h-14', standard: 'h-16', tall: 'h-20',
  },
  modal: {
    sm: 'w-[90%] max-w-[400px]', md: 'w-[90%] max-w-[600px]',
    lg: 'w-[90%] max-w-[900px]', full: 'w-full h-dvh-real',
  },
  button: {
    xs: 'h-8 min-w-[60px]', sm: 'h-9 min-w-[80px]',
    md: 'h-10 min-w-[100px]', lg: 'h-12 min-w-[120px]',
    xl: 'h-14 min-w-[140px]', icon: 'w-10 h-10',
    iconSm: 'w-8 h-8', iconLg: 'w-12 h-12',
  },
  input: {
    sm: 'h-8', md: 'h-9', lg: 'h-10', xl: 'h-12',
  },
  avatar: {
    xs: 'w-8 h-8', sm: 'w-12 h-12', md: 'w-16 h-16',
    lg: 'w-24 h-24', xl: 'w-32 h-32',
  },
  icon: {
    xs: 'w-4 h-4', sm: 'w-5 h-5', md: 'w-6 h-6',
    lg: 'w-8 h-8', xl: 'w-10 h-10', '2xl': 'w-12 h-12',
  },
  footer: {
    compact: 'h-16', standard: 'h-20', tall: 'h-24',
  },
} as const;
```

---

## 📄 lib/design-system/borders.ts

```typescript
export const BORDERS = {
  radius: {
    none: 'rounded-none', sm: 'rounded-sm', base: 'rounded',
    md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl',
    '2xl': 'rounded-2xl', '3xl': 'rounded-3xl', full: 'rounded-full',
  },
  width: {
    none: 'border-0', thin: 'border', medium: 'border-2',
    thick: 'border-4', heavy: 'border-8',
  },
  presets: {
    card: 'rounded-2xl border border-gray-200',
    cardStrong: 'rounded-2xl border-2 border-gray-300',
    button: 'rounded-xl border-2',
    buttonSoft: 'rounded-lg border',
    input: 'rounded-lg border border-gray-300',
    badge: 'rounded-full border',
    modal: 'rounded-3xl border-0',
    avatar: 'rounded-full border-2 border-white',
  },
} as const;
```

---

## 📄 lib/design-system/shadows.ts

```typescript
export const SHADOWS = {
  none: 'shadow-none', sm: 'shadow-sm', base: 'shadow',
  md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl', '2xl': 'shadow-2xl',
  inner: 'shadow-inner', // Simula profundidade (botões físicos)
  component: {
    card: 'shadow-lg',
    popup: 'shadow-2xl',
    modal: 'shadow-2xl',
    button: 'shadow-sm hover:shadow-md',
    buttonActive: 'shadow-inner',
    header: 'shadow-md',
    footer: 'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
    floating: 'shadow-2xl',
  },
  colored: {
    primary: 'shadow-lg shadow-blue-500/20',
    success: 'shadow-lg shadow-green-500/20',
    error: 'shadow-lg shadow-red-500/20',
    pink: 'shadow-lg shadow-pink-500/20',
  },
} as const;
```

---

## 📄 lib/utils.ts

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// cn() é o helper central para combinar classes Tailwind condicionalmente
// Uso: className={cn('base-class', condition && 'conditional-class', COLORS.bg.primary)}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatProductName = (name: string) => {
  if (!name) return '';
  return name.trim();
};
```

---

## 📄 app/globals.css (classes customizadas relevantes)

```css
@import "tailwindcss";

@layer base {
  * { -webkit-tap-highlight-color: transparent; }
  html { @apply h-full w-full overflow-hidden; }
  /* IMPORTANTE: html e body têm overflow:hidden — scroll deve existir nos containers filhos */
  body { @apply h-full w-full overflow-hidden bg-background text-foreground overscroll-none; }
}

@layer utilities {
  /* Ocultar scrollbar mantendo funcionalidade */
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

  /* Altura real da viewport (evita bug do Safari com barra de URL) */
  .h-dvh-real { height: 100dvh; }

  /* Scroll suave iOS */
  .ios-scroll-enabled {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
}

/* Padrão para páginas com scroll:
   Como html/body têm overflow:hidden, cada página que precisa de scroll
   deve ter um container com: h-dvh-real flex flex-col overflow-hidden
   e uma área filha com: flex-1 overflow-y-auto ios-scroll-enabled pb-28
   O pb-28 garante espaço para o footer fixo global (h-20 + margem).
*/
```

---

## Resumo: Como usar o Design System

```tsx
// Importação
import { SIZING, COLORS, SPACING, TYPOGRAPHY, BORDERS, SHADOWS, cn } from '@/lib/design-system';

// Botão padrão
<button className={cn(
  SIZING.button.lg,           // h-12 min-w-[120px]
  SPACING.horizontal.md,      // px-4
  COLORS.bg.primary,          // bg-[#5874f6]
  COLORS.text.white,          // text-white
  BORDERS.radius.xl,          // rounded-xl
  SHADOWS.component.button,   // shadow-sm hover:shadow-md
  TYPOGRAPHY.button.base,     // text-sm font-semibold
  'transition-all duration-200 active:scale-95'
)}>
  Salvar
</button>

// Card padrão
<div className={cn(
  SIZING.container.desktop,   // w-full max-w-[420px]
  SPACING.container.md,       // px-4 py-3
  COLORS.bg.white,            // bg-white
  BORDERS.presets.card,       // rounded-2xl border border-gray-200
  SHADOWS.component.card,     // shadow-lg
)}>
  Conteúdo
</div>

// Cores do sistema Maryland
// Azul principal:  #5874f6
// Rosa vendedor:   #F5A5C2
// Verde sucesso:   #50E3C2
// Vermelho alerta: #ff4d6d
// Laranja aviso:   #fb923c
// Fundo cinza:     #eeeeee
```
