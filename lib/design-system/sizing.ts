/**
 * 🎯 DESIGN SYSTEM - TAMANHOS
 * 
 * Define todos os tamanhos (width, height) de componentes do sistema.
 * Garante proporções consistentes em toda aplicação.
 * 
 * 📦 ANALOGIA LEGO:
 * Como os tamanhos padrão das peças de LEGO - 1x1, 2x2, 4x2, etc.
 * Tudo tem um tamanho pré-definido para manter harmonia.
 */

export const SIZING = {
  /**
   * 📱 Containers principais (telas, wrappers)
   * Usado em: Pages, Layouts
   */
  container: {
    mobile: 'w-full',
    desktop: 'w-full max-w-[420px]',
    wide: 'w-full max-w-[1600px]',
    full: 'w-full h-full',
    fullScreen: 'w-full h-dvh-real',
  },
  
  /**
   * 🎯 Headers (cabeçalhos)
   * Usado em: Header global, Headers de seções
   */
  header: {
    mini: 'h-12',
    compact: 'h-14',
    standard: 'h-16',
    tall: 'h-20',
  },
  
  /**
   * 🪟 Modals (telas sobrepondo)
   * Usado em: Modals grandes, popups de confirmação
   */
  modal: {
    sm: 'w-[90%] max-w-[400px]',
    md: 'w-[90%] max-w-[600px]',
    lg: 'w-[90%] max-w-[900px]',
    xl: 'w-[90%] max-w-[1200px]',
    full: 'w-full h-dvh-real',
  },
  
  /**
   * 💬 Popups (pequenas janelas)
   * Usado em: Tooltips, Dropdowns, Menus
   */
  popup: {
    xs: 'w-[240px]',
    sm: 'w-[280px]',
    md: 'w-[360px]',
    lg: 'w-[480px]',
  },
  
  /**
   * 🔘 Botões
   * Usado em: Buttons, Actions, CTAs
   */
  button: {
    xs: 'h-8 min-w-[60px]',
    sm: 'h-9 min-w-[80px]',
    md: 'h-10 min-w-[100px]',
    lg: 'h-12 min-w-[120px]',
    xl: 'h-14 min-w-[140px]',
    icon: 'w-10 h-10',
    iconSm: 'w-8 h-8',
    iconLg: 'w-12 h-12',
  },
  
  /**
   * 📝 Inputs (campos de entrada)
   * Usado em: Text inputs, Selects, TextAreas
   */
  input: {
    sm: 'h-8',
    md: 'h-9',
    lg: 'h-10',
    xl: 'h-12',
  },
  
  /**
   * 👤 Avatares/Fotos de perfil
   * Usado em: User avatar, Profile pictures
   */
  avatar: {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  },
  
  /**
   * 🎨 Ícones
   * Usado em: Icons, Logos
   */
  icon: {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
    '2xl': 'w-12 h-12',
  },
  
  /**
   * 🏷️ Badges (etiquetas)
   * Usado em: Status badges, Tags, Labels
   */
  badge: {
    sm: 'h-5 px-2',
    md: 'h-6 px-3',
    lg: 'h-8 px-4',
  },
  
  /**
   * 🦶 Footers (rodapés)
   * Usado em: Footer global, Footers de seções
   */
  footer: {
    compact: 'h-16',
    standard: 'h-20',
    tall: 'h-24',
  },
} as const;

/**
 * 🎨 TypeScript types para autocomplete
 */
export type ContainerSize = keyof typeof SIZING.container;
export type HeaderSize = keyof typeof SIZING.header;
export type ModalSize = keyof typeof SIZING.modal;
export type ButtonSize = keyof typeof SIZING.button;
export type InputSize = keyof typeof SIZING.input;
