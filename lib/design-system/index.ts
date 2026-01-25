/**
 * 🎯 DESIGN SYSTEM - INDEX (Exportação Central)
 * 
 * Ponto de entrada único para todo o Design System.
 * Importa todos os módulos e exporta em um lugar só.
 * 
 * 📦 ANALOGIA LEGO:
 * Como uma caixa organizada de LEGO com todas as peças separadas
 * por tipo - você pega desta caixa tudo que precisa.
 * 
 * 💡 USO:
 * import { SIZING, COLORS, SPACING } from '@/lib/design-system';
 */

// 📦 Importa todos os módulos do Design System
export * from './spacing';
export * from './sizing';
export * from './typography';
export * from './borders';
export * from './shadows';
export * from './colors';
export * from './breakpoints';
export * from './z-index';

// 🔧 Importa utilitário para combinar classes
export { cn } from '@/lib/utils';

/**
 * 📚 DOCUMENTAÇÃO DE USO
 * 
 * ===========================================
 * 1️⃣ IMPORTAÇÃO
 * ===========================================
 * 
 * // Importar tudo:
 * import * as DS from '@/lib/design-system';
 * 
 * // Importar específico:
 * import { SIZING, COLORS, SPACING } from '@/lib/design-system';
 * 
 * ===========================================
 * 2️⃣ USO EM COMPONENTES
 * ===========================================
 * 
 * // ANTES (hardcoded):
 * <div className="w-full max-w-[420px] px-4 py-3 shadow-lg rounded-2xl bg-white">
 * 
 * // DEPOIS (Design System):
 * <div className={`${SIZING.container.desktop} ${SPACING.container.md} ${SHADOWS.lg} ${BORDERS.radius['2xl']} ${COLORS.bg.white}`}>
 * 
 * // COM cn() helper (melhor):
 * <div className={cn(
 *   SIZING.container.desktop,
 *   SPACING.container.md,
 *   SHADOWS.lg,
 *   BORDERS.radius['2xl'],
 *   COLORS.bg.white
 * )}>
 * 
 * ===========================================
 * 3️⃣ EXEMPLOS PRÁTICOS
 * ===========================================
 * 
 * // BOTÃO:
 * <button className={cn(
 *   SIZING.button.md,
 *   SPACING.horizontal.md,
 *   COLORS.bg.primary,
 *   COLORS.text.white,
 *   BORDERS.presets.button,
 *   SHADOWS.component.button,
 *   TYPOGRAPHY.button.base
 * )}>
 *   Clique aqui
 * </button>
 * 
 * // CARD:
 * <div className={cn(
 *   SIZING.container.desktop,
 *   SPACING.container.lg,
 *   SHADOWS.component.card,
 *   BORDERS.presets.card,
 *   COLORS.bg.white
 * )}>
 *   Conteúdo do card
 * </div>
 * 
 * // MODAL:
 * <div className={cn(
 *   SIZING.modal.md,
 *   SPACING.container.lg,
 *   SHADOWS.component.modal,
 *   BORDERS.radius['3xl'],
 *   COLORS.bg.white,
 *   Z_INDEX.component.modal
 * )}>
 *   Conteúdo do modal
 * </div>
 * 
 * // HEADER:
 * <header className={cn(
 *   SIZING.header.compact,
 *   SPACING.horizontal.md,
 *   SPACING.vertical.sm,
 *   SHADOWS.component.header,
 *   COLORS.bg.white,
 *   Z_INDEX.component.header,
 *   'fixed top-0 left-0 right-0'
 * )}>
 *   Header content
 * </header>
 * 
 * ===========================================
 * 4️⃣ TYPESCRIPT AUTOCOMPLETE
 * ===========================================
 * 
 * Todos os módulos têm tipos exportados para autocomplete:
 * - SIZING.container. (autocomplete mostra: mobile, desktop, wide, etc)
 * - COLORS.bg. (autocomplete mostra: primary, secondary, white, etc)
 * - SPACING.gap. (autocomplete mostra: none, xs, sm, md, lg, xl)
 * 
 * ===========================================
 * 5️⃣ BENEFÍCIOS
 * ===========================================
 * 
 * ✅ Consistência visual garantida
 * ✅ Autocomplete do TypeScript
 * ✅ Fácil de manter (1 lugar só)
 * ✅ Fácil de atualizar (muda 1 vez, aplica em todos)
 * ✅ Código mais limpo e legível
 * ✅ Onboarding rápido para novos devs
 * ✅ Documentação viva (código = doc)
 */
