/**
 * 🎯 DESIGN SYSTEM - SOMBRAS
 * 
 * Define todas as sombras do sistema.
 * Garante profundidade e elevação consistentes.
 * 
 * 📦 ANALOGIA LEGO:
 * Como quando você levanta uma peça de LEGO - ela faz sombra
 * na mesa. Quanto mais alta, maior a sombra.
 */

export const SHADOWS = {
  /**
   * 🎨 Sombras base (Tailwind padrão)
   * Usado em: Qualquer elemento que precisa sombra
   */
  none: 'shadow-none',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  
  /**
   * 🎯 Sombras específicas por componente
   * Usado em: Componentes que precisam sombra específica
   */
  component: {
    card: 'shadow-lg',
    cardHover: 'shadow-xl',
    popup: 'shadow-2xl',
    modal: 'shadow-2xl',
    button: 'shadow-sm hover:shadow-md',
    buttonActive: 'shadow-inner',
    header: 'shadow-md',
    footer: 'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]', // Sombra para cima
    dropdown: 'shadow-xl',
    tooltip: 'shadow-lg',
    floating: 'shadow-2xl',
  },
  
  /**
   * 🎨 Sombras coloridas (especiais)
   * Usado em: Efeitos especiais, hover states
   */
  colored: {
    primary: 'shadow-lg shadow-blue-500/20',
    success: 'shadow-lg shadow-green-500/20',
    warning: 'shadow-lg shadow-orange-500/20',
    error: 'shadow-lg shadow-red-500/20',
    pink: 'shadow-lg shadow-pink-500/20',
  },
  
  /**
   * 🔄 Transições de sombra
   * Usado em: Elementos interativos (hover, active)
   */
  transition: 'transition-shadow duration-200 ease-in-out',
} as const;

/**
 * 🎨 TypeScript types para autocomplete
 */
export type ShadowSize = 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
export type ComponentShadow = keyof typeof SHADOWS.component;
export type ColoredShadow = keyof typeof SHADOWS.colored;
