/**
 * 🎯 DESIGN SYSTEM - BORDAS
 * 
 * Define todos os estilos de bordas (radius, width) do sistema.
 * Garante arredondamentos e espessuras consistentes.
 * 
 * 📦 ANALOGIA LEGO:
 * Como os cantos das peças de LEGO - alguns quadrados,
 * outros arredondados. Tudo padronizado.
 */

export const BORDERS = {
  /**
   * 🔲 Radius (arredondamento de cantos)
   * Usado em: Cards, Buttons, Inputs, Modals
   */
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  },
  
  /**
   * 📏 Width (espessura da borda)
   * Usado em: Containers, Cards, Separadores
   */
  width: {
    none: 'border-0',
    thin: 'border',        // 1px
    medium: 'border-2',    // 2px
    thick: 'border-4',     // 4px
    heavy: 'border-8',     // 8px
  },
  
  /**
   * 🎨 Combinações pré-configuradas
   * Usado em: Componentes específicos
   */
  presets: {
    card: 'rounded-2xl border border-gray-200',
    cardStrong: 'rounded-2xl border-2 border-gray-300',
    button: 'rounded-xl border-2',
    buttonSoft: 'rounded-lg border',
    input: 'rounded-lg border border-gray-300',
    inputFocus: 'rounded-lg border-2 border-blue-500',
    badge: 'rounded-full border',
    modal: 'rounded-3xl border-0',
    popup: 'rounded-2xl border border-gray-200',
    avatar: 'rounded-full border-2 border-white',
  },
  
  /**
   * 🔄 Radius por lado específico
   * Usado em: Casos especiais (tabs, dropdowns)
   */
  sides: {
    top: {
      lg: 'rounded-t-lg',
      xl: 'rounded-t-xl',
      '2xl': 'rounded-t-2xl',
      '3xl': 'rounded-t-3xl',
    },
    bottom: {
      lg: 'rounded-b-lg',
      xl: 'rounded-b-xl',
      '2xl': 'rounded-b-2xl',
      '3xl': 'rounded-b-3xl',
    },
    left: {
      lg: 'rounded-l-lg',
      xl: 'rounded-l-xl',
      '2xl': 'rounded-l-2xl',
    },
    right: {
      lg: 'rounded-r-lg',
      xl: 'rounded-r-xl',
      '2xl': 'rounded-r-2xl',
    },
  },
} as const;

/**
 * 🎨 TypeScript types para autocomplete
 */
export type BorderRadius = keyof typeof BORDERS.radius;
export type BorderWidth = keyof typeof BORDERS.width;
export type BorderPreset = keyof typeof BORDERS.presets;
