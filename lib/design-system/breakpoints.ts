/**
 * 🎯 DESIGN SYSTEM - BREAKPOINTS (Responsividade)
 * 
 * Define todos os pontos de quebra para responsividade.
 * Garante comportamento consistente em diferentes tamanhos de tela.
 * 
 * 📦 ANALOGIA LEGO:
 * Como construções de LEGO que se adaptam - uma torre alta no
 * chão vira uma torre baixa na estante (diferentes espaços).
 */

export const BREAKPOINTS = {
  /**
   * 📏 Valores brutos em pixels
   * Usado em: JavaScript, Cálculos, Media Queries customizadas
   */
  values: {
    sm: 640,    // Phones large
    md: 768,    // Tablets
    lg: 1024,   // Desktop
    xl: 1280,   // Desktop large
    '2xl': 1536, // Desktop XL
  },
  
  /**
   * 🙈 Esconder elementos
   * Usado em: Elementos que devem sumir em mobile/desktop
   */
  hide: {
    onMobile: 'hidden md:block',      // Esconde no mobile, mostra no desktop
    onTablet: 'block md:hidden lg:block', // Esconde no tablet
    onDesktop: 'block md:hidden',     // Esconde no desktop, mostra no mobile
  },
  
  /**
   * 👁️ Mostrar elementos
   * Usado em: Elementos exclusivos de mobile/desktop
   */
  show: {
    onMobile: 'block md:hidden',      // Mostra só no mobile
    onTablet: 'hidden md:block lg:hidden', // Mostra só no tablet
    onDesktop: 'hidden md:block',     // Mostra só no desktop
  },
  
  /**
   * 📱 Classes de container por tamanho de tela
   * Usado em: Containers que mudam de tamanho
   */
  container: {
    responsive: 'w-full md:max-w-[420px]',
    full: 'w-full',
    wide: 'w-full lg:max-w-[1600px]',
  },
  
  /**
   * 🔤 Tamanhos de texto responsivos
   * Usado em: Títulos que mudam de tamanho
   */
  text: {
    h1: 'text-2xl md:text-3xl lg:text-4xl',
    h2: 'text-xl md:text-2xl lg:text-3xl',
    h3: 'text-lg md:text-xl lg:text-2xl',
    body: 'text-sm md:text-base',
    small: 'text-xs md:text-sm',
  },
  
  /**
   * 📏 Padding responsivo
   * Usado em: Containers que precisam de padding diferente
   */
  padding: {
    page: 'px-4 md:px-6 lg:px-8',
    section: 'py-4 md:py-6 lg:py-8',
    container: 'p-4 md:p-6',
  },
  
  /**
   * 🔲 Gap responsivo
   * Usado em: Flexbox/Grid com espaçamento diferente
   */
  gap: {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4',
    lg: 'gap-4 md:gap-6',
  },
} as const;

/**
 * 🎨 TypeScript types para autocomplete
 */
export type BreakpointValue = keyof typeof BREAKPOINTS.values;
export type ResponsiveText = keyof typeof BREAKPOINTS.text;
