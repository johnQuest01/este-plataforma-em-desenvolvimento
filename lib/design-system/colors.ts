/**
 * 🎯 DESIGN SYSTEM - CORES
 * 
 * Define todas as cores do sistema.
 * Garante identidade visual consistente.
 * 
 * 📦 ANALOGIA LEGO:
 * Como uma paleta de cores de LEGO - só existem certas cores
 * específicas para manter tudo harmonioso.
 */

export const COLORS = {
  /**
   * 🎨 Cores principais (HEX values)
   * Usado em: Referência, JS, Cálculos
   */
  values: {
    primary: '#5874f6',
    secondary: '#F5A5C2',
    success: '#50E3C2',
    warning: '#fb923c',
    error: '#ff4d6d',
    info: '#3b82f6',
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  
  /**
   * 🖌️ Classes de background (bg-*)
   * Usado em: Fundos de elementos
   */
  bg: {
    primary: 'bg-[#5874f6]',
    primaryLight: 'bg-[#5874f6]/10',
    secondary: 'bg-[#F5A5C2]',
    secondaryLight: 'bg-[#F5A5C2]/10',
    success: 'bg-[#50E3C2]',
    successLight: 'bg-[#50E3C2]/10',
    warning: 'bg-[#fb923c]',
    warningLight: 'bg-[#fb923c]/10',
    error: 'bg-[#ff4d6d]',
    errorLight: 'bg-[#ff4d6d]/10',
    white: 'bg-white',
    black: 'bg-black',
    gray: 'bg-gray-100',
    grayLight: 'bg-gray-50',
    grayDark: 'bg-gray-800',
    transparent: 'bg-transparent',
  },
  
  /**
   * 📝 Classes de texto (text-*)
   * Usado em: Cores de texto
   */
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
  
  /**
   * 🔲 Classes de borda (border-*)
   * Usado em: Bordas de elementos
   */
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
  
  /**
   * 🎨 Gradientes pré-configurados
   * Usado em: Backgrounds especiais, Headers
   */
  gradient: {
    primary: 'bg-gradient-to-r from-[#5874f6] to-[#6b8af7]',
    secondary: 'bg-gradient-to-r from-[#F5A5C2] to-[#f7b5ce]',
    success: 'bg-gradient-to-r from-[#50E3C2] to-[#6febd3]',
    sunset: 'bg-gradient-to-r from-[#fb923c] to-[#ff4d6d]',
    ocean: 'bg-gradient-to-r from-[#3b82f6] to-[#5874f6]',
    gray: 'bg-gradient-to-b from-gray-50 to-gray-100',
  },
} as const;

/**
 * 🎨 TypeScript types para autocomplete
 */
export type BgColor = keyof typeof COLORS.bg;
export type TextColor = keyof typeof COLORS.text;
export type BorderColor = keyof typeof COLORS.border;
export type GradientColor = keyof typeof COLORS.gradient;
