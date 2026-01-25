/**
 * 🎯 DESIGN SYSTEM - ESPAÇAMENTOS
 * 
 * Define todos os espaçamentos (padding, margin, gap) do sistema.
 * Garante consistência visual em toda aplicação.
 * 
 * 📦 ANALOGIA LEGO:
 * Como espaços entre peças de LEGO - sempre os mesmos tamanhos
 * para tudo encaixar perfeitamente.
 */

export const SPACING = {
  /**
   * 📏 Padding interno de containers
   * Usado em: Cards, Sections, Wrappers
   */
  container: {
    none: '',
    xs: 'px-2 py-1',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
    xl: 'px-8 py-6',
  },
  
  /**
   * 🔲 Gap entre elementos (flexbox/grid)
   * Usado em: Listas, Menus, Grids
   */
  gap: {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
    '2xl': 'gap-8',
  },
  
  /**
   * 📐 Margens específicas por contexto
   * Usado em: Separação de seções e componentes
   */
  margin: {
    section: 'mb-4',      // Entre seções grandes
    component: 'mb-2',    // Entre componentes médios
    element: 'mb-1',      // Entre elementos pequenos
  },
  
  /**
   * 📱 Padding horizontal (px-*)
   * Usado em: Telas, Containers laterais
   */
  horizontal: {
    none: 'px-0',
    xs: 'px-2',
    sm: 'px-3',
    md: 'px-4',
    lg: 'px-6',
    xl: 'px-8',
  },
  
  /**
   * 📏 Padding vertical (py-*)
   * Usado em: Headers, Footers, Sections
   */
  vertical: {
    none: 'py-0',
    xs: 'py-1',
    sm: 'py-2',
    md: 'py-3',
    lg: 'py-4',
    xl: 'py-6',
  },
} as const;

/**
 * 🎨 TypeScript type para autocomplete
 */
export type SpacingContainerSize = keyof typeof SPACING.container;
export type SpacingGapSize = keyof typeof SPACING.gap;
