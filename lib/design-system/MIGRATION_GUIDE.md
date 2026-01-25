# 🚀 Guia de Migração - Design System

## 📝 Checklist de Migração

Use este guia ao migrar componentes para usar o Design System.

---

## ✅ PASSO A PASSO

### 1️⃣ Importar o Design System

```typescript
// No topo do arquivo
import { 
  SIZING, 
  SPACING, 
  COLORS, 
  BORDERS, 
  SHADOWS, 
  TYPOGRAPHY,
  Z_INDEX,
  BREAKPOINTS,
  cn 
} from '@/lib/design-system';
```

**💡 Dica:** Só importe o que for usar!

---

### 2️⃣ Identificar classes para migrar

Procure por padrões comuns:

```tsx
// ❌ ANTES
className="w-full max-w-[420px] px-4 py-3 shadow-lg rounded-2xl bg-white"
```

**Classes identificadas:**
- `w-full max-w-[420px]` → Tamanho (SIZING)
- `px-4 py-3` → Espaçamento (SPACING)
- `shadow-lg` → Sombra (SHADOWS)
- `rounded-2xl` → Borda (BORDERS)
- `bg-white` → Cor (COLORS)

---

### 3️⃣ Substituir por tokens

```tsx
// ✅ DEPOIS
className={cn(
  SIZING.container.desktop,    // w-full max-w-[420px]
  SPACING.container.md,        // px-4 py-3
  SHADOWS.lg,                  // shadow-lg
  BORDERS.radius['2xl'],       // rounded-2xl
  COLORS.bg.white              // bg-white
)}
```

---

### 4️⃣ Testar o componente

```bash
# Verificar se não quebrou nada
npm run dev
```

**Checklist de teste:**
- [ ] Aparência visual está igual?
- [ ] Responsividade funciona?
- [ ] Hover states funcionam?
- [ ] Nenhum erro de TypeScript?

---

## 📋 TABELA DE CONVERSÃO RÁPIDA

| Classe Tailwind | Design System | Módulo |
|----------------|---------------|---------|
| `w-full` | `SIZING.container.mobile` | SIZING |
| `max-w-[420px]` | `SIZING.container.desktop` | SIZING |
| `h-10` | `SIZING.button.md` | SIZING |
| `h-14` | `SIZING.header.compact` | SIZING |
| `px-4 py-3` | `SPACING.container.md` | SPACING |
| `gap-2` | `SPACING.gap.sm` | SPACING |
| `mb-4` | `SPACING.margin.section` | SPACING |
| `text-xl` | `TYPOGRAPHY.size.xl` | TYPOGRAPHY |
| `font-bold` | `TYPOGRAPHY.weight.bold` | TYPOGRAPHY |
| `text-xl font-bold` | `TYPOGRAPHY.heading.h2` | TYPOGRAPHY |
| `text-base font-normal` | `TYPOGRAPHY.body.base` | TYPOGRAPHY |
| `rounded-2xl` | `BORDERS.radius['2xl']` | BORDERS |
| `border-2` | `BORDERS.width.medium` | BORDERS |
| `shadow-lg` | `SHADOWS.lg` | SHADOWS |
| `bg-white` | `COLORS.bg.white` | COLORS |
| `bg-[#5874f6]` | `COLORS.bg.primary` | COLORS |
| `text-gray-900` | `COLORS.text.black` | COLORS |
| `z-50` | `Z_INDEX.component.header` | Z_INDEX |
| `z-70` | `Z_INDEX.component.modal` | Z_INDEX |
| `hidden md:block` | `BREAKPOINTS.hide.onMobile` | BREAKPOINTS |

---

## 🎯 PADRÕES COMUNS

### 🔘 Botão

```tsx
// ANTES
className="h-10 px-4 bg-[#5874f6] text-white rounded-xl shadow-sm font-semibold"

// DEPOIS
className={cn(
  SIZING.button.md,
  SPACING.horizontal.md,
  COLORS.bg.primary,
  COLORS.text.white,
  BORDERS.radius.xl,
  SHADOWS.component.button,
  TYPOGRAPHY.button.base
)}
```

### 📦 Card

```tsx
// ANTES
className="w-full max-w-[420px] p-6 shadow-lg rounded-2xl border border-gray-200 bg-white"

// DEPOIS
className={cn(
  SIZING.container.desktop,
  SPACING.container.lg,
  SHADOWS.component.card,
  BORDERS.presets.card,
  COLORS.bg.white
)}
```

### 🪟 Modal

```tsx
// ANTES
className="w-[90%] max-w-[600px] p-6 shadow-2xl rounded-3xl bg-white fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-70"

// DEPOIS
className={cn(
  SIZING.modal.md,
  SPACING.container.lg,
  SHADOWS.component.modal,
  BORDERS.radius['3xl'],
  COLORS.bg.white,
  Z_INDEX.component.modal,
  'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
)}
```

### 🎯 Header

```tsx
// ANTES
className="h-14 px-4 py-2.5 shadow-md bg-white fixed top-0 left-0 right-0 z-50"

// DEPOIS
className={cn(
  SIZING.header.compact,
  SPACING.horizontal.md,
  SPACING.vertical.sm,
  SHADOWS.component.header,
  COLORS.bg.white,
  Z_INDEX.component.header,
  'fixed top-0 left-0 right-0'
)}
```

---

## ⚠️ CUIDADOS

### ❌ NÃO FAÇA:

```tsx
// ❌ Não misture hardcoded com Design System
className={cn(
  SIZING.button.md,
  'h-12'  // ← ERRADO! Sobrescreve o SIZING.button.md
)}

// ❌ Não crie valores customizados sem adicionar ao Design System
className="w-[437px]"  // ← Adicione ao Design System primeiro!
```

### ✅ FAÇA:

```tsx
// ✅ Use apenas tokens do Design System
className={cn(
  SIZING.button.lg,  // Se h-12 for necessário, use button.lg
)}

// ✅ Ou adicione novo token
// Em sizing.ts:
button: {
  custom: 'h-12 min-w-[140px]',
}
```

---

## 📊 ORDEM DE MIGRAÇÃO SUGERIDA

### Fase 1: Componentes novos (Imediato)
- ✅ Sempre usar Design System desde o início
- ✅ Exemplo: `AuthorizedSellerBadge.EXAMPLE.tsx`

### Fase 2: Componentes compartilhados (Semana 1-2)
- [ ] `Header.tsx`
- [ ] `Footer.tsx`
- [ ] Modals (`StockModal`, `CatalogModal`, `OrdersModal`)
- [ ] Componentes de UI base (`Button`, `Input`, `Card`)

### Fase 3: Telas principais (Semana 3-4)
- [ ] `app/inventory/page.tsx`
- [ ] `app/page.tsx` (cadastro)
- [ ] `app/product/jeans/page.tsx`
- [ ] `components/admin/GlobalAdmin.tsx`

### Fase 4: Telas secundárias (Semana 5+)
- [ ] Blocos individuais
- [ ] Popups específicos
- [ ] Componentes menos usados

---

## 🎓 DICAS PRO

1. **Use `cn()` sempre**
   ```tsx
   // ✅ BOM
   className={cn(SIZING.button.md, COLORS.bg.primary)}
   
   // ❌ RUIM
   className={`${SIZING.button.md} ${COLORS.bg.primary}`}
   ```

2. **Combine classes customizadas quando necessário**
   ```tsx
   className={cn(
     SIZING.button.md,
     COLORS.bg.primary,
     'hover:scale-105'  // Classes específicas são OK!
   )}
   ```

3. **Documente desvios do padrão**
   ```tsx
   // OK usar classe customizada aqui porque [razão específica]
   className={cn(SIZING.button.md, 'w-[437px]')}
   ```

4. **TypeScript é seu amigo**
   - Use autocomplete (Ctrl+Space)
   - Veja os tipos disponíveis
   - Erros de tipo = proteção contra bugs

---

## ✅ CHECKLIST FINAL

Antes de dar PR/commit, verifique:

- [ ] Todos os imports estão corretos
- [ ] Usei `cn()` para combinar classes
- [ ] Nenhum valor hardcoded desnecessário
- [ ] Componente testado visualmente
- [ ] Nenhum erro de TypeScript
- [ ] Nenhum erro de linter
- [ ] Responsividade funciona
- [ ] Comportamento idêntico ao anterior

---

## 🆘 Precisa de ajuda?

1. Consulte `lib/design-system/README.md`
2. Veja exemplo em `AuthorizedSellerBadge.EXAMPLE.tsx`
3. Abra os arquivos individuais (`spacing.ts`, `sizing.ts`, etc)
4. Todos têm comentários explicativos e analogias LEGO
