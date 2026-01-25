/**
 * 🎯 DESIGN SYSTEM - Z-INDEX (Camadas)
 * 
 * Define todas as camadas de sobreposição do sistema.
 * Garante ordem correta de empilhamento (quem fica em cima de quem).
 * 
 * 📦 ANALOGIA LEGO:
 * Como empilhar peças de LEGO - a base é 0, cada camada sobe 1 nível.
 * Header sempre acima do conteúdo, Modal sempre acima do header, etc.
 */

export const Z_INDEX = {
  /**
   * 🏔️ Camadas base (valores numéricos)
   * Usado em: JavaScript, Cálculos
   */
  values: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    overlay: 40,
    header: 50,
    modalOverlay: 60,
    modal: 70,
    popup: 80,
    toast: 90,
    tooltip: 100,
  },
  
  /**
   * 🎨 Classes Tailwind (z-*)
   * Usado em: Componentes React, HTML
   */
  classes: {
    base: 'z-0',
    dropdown: 'z-10',
    sticky: 'z-20',
    fixed: 'z-30',
    overlay: 'z-40',
    header: 'z-50',
    modalOverlay: 'z-60',
    modal: 'z-70',
    popup: 'z-80',
    toast: 'z-90',
    tooltip: 'z-100',
  },
  
  /**
   * 🎯 Z-index por componente específico
   * Usado em: Componentes que precisam de z-index definido
   */
  component: {
    // Headers e Navegação
    header: 'z-50',
    headerFixed: 'z-50',
    navigation: 'z-10',
    
    // Overlays e Modals
    overlay: 'z-60',
    modal: 'z-70',
    modalHeader: 'z-71',
    modalFooter: 'z-71',
    
    // Popups e Dropdowns
    popup: 'z-80',
    dropdown: 'z-80',
    menuDropdown: 'z-80',
    
    // Footers
    footer: 'z-50',
    footerFixed: 'z-50',
    
    // Notificações
    toast: 'z-90',
    notification: 'z-90',
    
    // Tooltips e Hints
    tooltip: 'z-100',
    hint: 'z-100',
    
    // Elementos de UI
    backdrop: 'z-40',
    sidebar: 'z-30',
    sticky: 'z-20',
    card: 'z-0',
    content: 'z-0',
  },
  
  /**
   * 📚 Hierarquia visual (documentação)
   * Ordem de empilhamento (de baixo para cima):
   * 
   * 0. Base (z-0) - Conteúdo normal, cards
   * 10. Dropdown (z-10) - Menus dropdown, navegação interna
   * 20. Sticky (z-20) - Elementos sticky, headers de seção
   * 30. Fixed (z-30) - Sidebar, elementos fixos
   * 40. Overlay (z-40) - Backdrop de modals
   * 50. Header (z-50) - Header global, Footer global
   * 60. Modal Overlay (z-60) - Overlay de modals
   * 70. Modal (z-70) - Modals, Dialogs
   * 80. Popup (z-80) - Popups, Dropdowns contextuais
   * 90. Toast (z-90) - Notificações, Toasts
   * 100. Tooltip (z-100) - Tooltips, Hints (sempre no topo)
   */
} as const;

/**
 * 🎨 TypeScript types para autocomplete
 */
export type ZIndexValue = keyof typeof Z_INDEX.values;
export type ZIndexClass = keyof typeof Z_INDEX.classes;
export type ZIndexComponent = keyof typeof Z_INDEX.component;
