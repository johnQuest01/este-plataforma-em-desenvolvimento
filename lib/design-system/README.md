# 🎨 Design System

Sistema de design centralizado para garantir consistência visual em toda aplicação.

---

## 📦 O que é?

Uma coleção de **tokens de design** (tamanhos, cores, espaçamentos, etc) organizados em arquivos TypeScript que podem ser importados e usados em qualquer componente.

**Analogia LEGO:** Como uma caixa organizada de LEGO com todas as peças separadas por tipo e tamanho.

---

## 📁 Estrutura

```
lib/design-system/
├── spacing.ts          # Espaçamentos (padding, margin, gap)
├── sizing.ts           # Tamanhos (width, height)
├── typography.ts       # Tipografia (font-size, weight)
├── borders.ts          # Bordas (radius, width)
├── shadows.ts          # Sombras
├── colors.ts           # Cores do sistema
├── breakpoints.ts      # Responsividade
├── z-index.ts          # Camadas (z-index)
├── index.ts            # Exportação central
└── README.md           # Este arquivo
```

---

## 🚀 Como usar

### 1️⃣ Importação

```typescript
// Importar tudo:
import * as DS from '@/lib/design-system';

// Importar específico (recomendado):
import { SIZING, COLORS, SPACING, BORDERS, SHADOWS } from '@/lib/design-system';
```

### 2️⃣ Uso básico

```tsx
// ANTES (hardcoded):
<div className="w-full max-w-[420px] px-4 py-3 shadow-lg rounded-2xl bg-white">
  <h1 className="text-xl font-bold">Título</h1>
</div>

// DEPOIS (Design System):
import { SIZING, SPACING, SHADOWS, BORDERS, COLORS, TYPOGRAPHY } from '@/lib/design-system';

<div className={`${SIZING.container.desktop} ${SPACING.container.md} ${SHADOWS.lg} ${BORDERS.radius['2xl']} ${COLORS.bg.white}`}>
  <h1 className={TYPOGRAPHY.heading.h2}>Título</h1>
</div>
```

### 3️⃣ Com helper `cn()` (recomendado)

```tsx
import { SIZING, COLORS, cn } from '@/lib/design-system';

<div className={cn(
  SIZING.container.desktop,
  SPACING.container.md,
  SHADOWS.lg,
  BORDERS.radius['2xl'],
  COLORS.bg.white
)}>
  Conteúdo
</div>
```

---

## 📚 Módulos disponíveis

### 🔹 SPACING - Espaçamentos

```typescript
SPACING.container.md      // px-4 py-3
SPACING.gap.lg           // gap-4
SPACING.horizontal.md    // px-4
SPACING.vertical.sm      // py-2
```

### 🔹 SIZING - Tamanhos

```typescript
SIZING.container.desktop  // w-full max-w-[420px]
SIZING.button.md         // h-10 min-w-[100px]
SIZING.header.compact    // h-14
SIZING.modal.lg          // w-[90%] max-w-[900px]
```

### 🔹 TYPOGRAPHY - Tipografia

```typescript
TYPOGRAPHY.heading.h1     // text-3xl font-black leading-tight
TYPOGRAPHY.body.base      // text-base font-normal leading-normal
TYPOGRAPHY.button.base    // text-sm font-semibold
```

### 🔹 BORDERS - Bordas

```typescript
BORDERS.radius['2xl']     // rounded-2xl
BORDERS.width.medium      // border-2
BORDERS.presets.card      // rounded-2xl border border-gray-200
```

### 🔹 SHADOWS - Sombras

```typescript
SHADOWS.lg                // shadow-lg
SHADOWS.component.card    // shadow-lg
SHADOWS.component.modal   // shadow-2xl
```

### 🔹 COLORS - Cores

```typescript
COLORS.bg.primary         // bg-[#5874f6]
COLORS.text.white         // text-white
COLORS.border.gray        // border-gray-200
COLORS.gradient.primary   // bg-gradient-to-r from-[#5874f6] to-[#6b8af7]
```

### 🔹 BREAKPOINTS - Responsividade

```typescript
BREAKPOINTS.hide.onMobile    // hidden md:block
BREAKPOINTS.text.h1          // text-2xl md:text-3xl lg:text-4xl
BREAKPOINTS.padding.page     // px-4 md:px-6 lg:px-8
```

### 🔹 Z_INDEX - Camadas

```typescript
Z_INDEX.component.header     // z-50
Z_INDEX.component.modal      // z-70
Z_INDEX.component.tooltip    // z-100
```

---

## 💡 Exemplos práticos

### 🔘 Botão

```tsx
import { SIZING, SPACING, COLORS, BORDERS, SHADOWS, TYPOGRAPHY, cn } from '@/lib/design-system';

<button className={cn(
  SIZING.button.md,
  SPACING.horizontal.md,
  COLORS.bg.primary,
  COLORS.text.white,
  BORDERS.presets.button,
  SHADOWS.component.button,
  TYPOGRAPHY.button.base
)}>
  Clique aqui
</button>
```

### 📦 Card

```tsx
<div className={cn(
  SIZING.container.desktop,
  SPACING.container.lg,
  SHADOWS.component.card,
  BORDERS.presets.card,
  COLORS.bg.white
)}>
  <h2 className={TYPOGRAPHY.heading.h3}>Título do Card</h2>
  <p className={TYPOGRAPHY.body.base}>Descrição do card...</p>
</div>
```

### 🪟 Modal

```tsx
<div className={cn(
  SIZING.modal.md,
  SPACING.container.lg,
  SHADOWS.component.modal,
  BORDERS.radius['3xl'],
  COLORS.bg.white,
  Z_INDEX.component.modal,
  'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
)}>
  Conteúdo do modal
</div>
```

### 🎯 Header

```tsx
<header className={cn(
  SIZING.header.compact,
  SPACING.horizontal.md,
  SPACING.vertical.sm,
  SHADOWS.component.header,
  COLORS.bg.white,
  Z_INDEX.component.header,
  'fixed top-0 left-0 right-0'
)}>
  Header content
</header>
```

---

## ✅ Benefícios

1. **Consistência visual** - Todos os componentes usam os mesmos valores
2. **Manutenibilidade** - Alterar em 1 lugar, aplica em todos
3. **Autocomplete TypeScript** - IDE sugere opções disponíveis
4. **Código limpo** - Menos classes hardcoded
5. **Documentação viva** - O código é a documentação
6. **Onboarding rápido** - Novos devs entendem rápido
7. **Escalabilidade** - Fácil adicionar novos tokens

---

## 🔄 Migração gradual

Não precisa migrar tudo de uma vez! Siga esta ordem:

1. ✅ **Componentes novos** - Use Design System desde o início
2. 🔄 **Headers e Footers** - Impacto em todas as telas
3. 🔄 **Modals e Popups** - Consistência em overlays
4. 🔄 **Telas principais** - Dashboard, Inventory, etc
5. 🔄 **Telas secundárias** - Gradualmente

---

## 📝 Regras de uso

1. **SEMPRE** prefira usar Design System tokens ao invés de valores hardcoded
2. **NÃO** crie valores customizados sem adicionar ao Design System primeiro
3. **DOCUMENTE** novos tokens adicionados com comentários
4. **TESTE** alterações em tokens (impacta múltiplos componentes)
5. **REVISE** componentes após alterar tokens

---

## 🎯 Próximos passos

1. ✅ Design System criado
2. 🔜 Migrar `AuthorizedSellerBadge` (exemplo)
3. 🔜 Migrar `Header.tsx`
4. 🔜 Migrar componentes de Modal
5. 🔜 Continuar migração gradual

---

## 🆘 Precisa de ajuda?

Consulte os arquivos individuais para ver todos os tokens disponíveis. Cada arquivo tem comentários explicativos e analogias LEGO para facilitar o entendimento.
