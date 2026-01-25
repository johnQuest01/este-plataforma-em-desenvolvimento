/**
 * 🎯 DESIGN SYSTEM - TIPOGRAFIA
 * 
 * Define todos os estilos de texto do sistema.
 * Garante hierarquia e legibilidade consistentes.
 * 
 * 📦 ANALOGIA LEGO:
 * Como os tamanhos de letras em um cartaz - títulos grandes,
 * subtítulos médios, corpo pequeno. Tudo proporcional.
 */

export const TYPOGRAPHY = {
  /**
   * 📏 Tamanhos de texto base
   * Usado em: Qualquer elemento de texto
   */
  size: {
    xs: 'text-xs',       // 12px
    sm: 'text-sm',       // 14px
    base: 'text-base',   // 16px
    lg: 'text-lg',       // 18px
    xl: 'text-xl',       // 20px
    '2xl': 'text-2xl',   // 24px
    '3xl': 'text-3xl',   // 30px
    '4xl': 'text-4xl',   // 36px
  },
  
  /**
   * ⚖️ Pesos de fonte
   * Usado em: Títulos, Destaques, Corpo
   */
  weight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  },
  
  /**
   * 📐 Altura de linha (espaçamento vertical entre linhas)
   * Usado em: Parágrafos, Textos longos
   */
  leading: {
    tight: 'leading-tight',     // 1.25
    snug: 'leading-snug',       // 1.375
    normal: 'leading-normal',   // 1.5
    relaxed: 'leading-relaxed', // 1.625
    loose: 'leading-loose',     // 2
  },
  
  /**
   * 🎨 Títulos pré-configurados (size + weight + leading)
   * Usado em: H1, H2, H3, H4
   */
  heading: {
    h1: 'text-3xl font-black leading-tight',
    h2: 'text-2xl font-bold leading-tight',
    h3: 'text-xl font-bold leading-tight',
    h4: 'text-lg font-bold leading-tight',
    h5: 'text-base font-bold leading-tight',
  },
  
  /**
   * 📄 Corpo de texto (paragraphs, descriptions)
   * Usado em: Parágrafos, Descrições, Conteúdo
   */
  body: {
    xs: 'text-xs font-normal leading-normal',
    sm: 'text-sm font-normal leading-normal',
    base: 'text-base font-normal leading-normal',
    lg: 'text-lg font-normal leading-relaxed',
  },
  
  /**
   * 🏷️ Labels (etiquetas de campos)
   * Usado em: Labels de inputs, Títulos de seções pequenas
   */
  label: {
    sm: 'text-xs font-medium',
    base: 'text-sm font-medium',
    lg: 'text-base font-semibold',
  },
  
  /**
   * 🔘 Botões
   * Usado em: Texto de botões
   */
  button: {
    sm: 'text-xs font-semibold',
    base: 'text-sm font-semibold',
    lg: 'text-base font-bold',
  },
  
  /**
   * 💬 Captions (legendas, textos auxiliares)
   * Usado em: Legendas, Hints, Textos secundários
   */
  caption: {
    xs: 'text-xs font-normal text-gray-500',
    sm: 'text-sm font-normal text-gray-600',
  },
} as const;

/**
 * 🎨 TypeScript types para autocomplete
 */
export type TextSize = keyof typeof TYPOGRAPHY.size;
export type FontWeight = keyof typeof TYPOGRAPHY.weight;
export type HeadingVariant = keyof typeof TYPOGRAPHY.heading;
export type BodyVariant = keyof typeof TYPOGRAPHY.body;
