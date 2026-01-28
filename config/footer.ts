// config/footer.ts
/**
 * 🎯 CONFIGURAÇÃO GLOBAL DO FOOTER
 * 
 * Arquivo único e centralizado para configuração dos botões do footer.
 * Seguindo protocolo @.cursorrules: Zero Placeholders, Exhaustive Typing, Decoupling.
 * 
 * Este footer é renderizado globalmente no RootLayoutShell.tsx e aparece em TODAS as telas.
 */

import { FooterItem, BlockStyle } from '@/types/builder';

/**
 * Lista global de botões do footer
 * 
 * IMPORTANTE: Esta é a ÚNICA fonte de verdade para os botões do footer.
 * Qualquer modificação aqui afeta TODAS as telas automaticamente.
 */
export const GLOBAL_FOOTER_ITEMS: FooterItem[] = [
  { 
    id: 'footer_cart', 
    icon: 'cart', 
    isVisible: true, 
    route: '/cart' 
  },
  { 
    id: 'footer_heart', 
    icon: 'heart', 
    isVisible: true, 
    route: '/favorites' 
  },
  { 
    id: 'footer_pos', 
    icon: 'sync', 
    isVisible: true, 
    isHighlight: true, 
    route: '/pos' 
  },
  { 
    id: 'footer_dashboard', 
    icon: 'verified', 
    isVisible: true, 
    route: '/dashboard' 
  },
  { 
    id: 'footer_inventory', 
    icon: 'package-check', 
    isVisible: true, 
    route: '/inventory' 
  },
  { 
    id: 'footer_production', 
    icon: 'inventory', 
    isVisible: true, 
    route: '/production' 
  },
];

/**
 * Estilo global do footer
 * 
 * Define a aparência visual do footer em todas as telas.
 */
export const GLOBAL_FOOTER_STYLE: BlockStyle = {
  bgColor: '#5874f6',
  textColor: '#ffffff',
};
