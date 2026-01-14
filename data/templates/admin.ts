// data/templates/admin.ts
import { BlockConfig } from '@/types/builder';

export const ADMIN_TEMPLATE: BlockConfig[] = [
  // 1. HEADER UNIVERSAL (Padronizado)
  {
    id: 'adm_header',
    type: 'header',
    isVisible: true,
    data: {
      title: 'Painel Admin', 
      address: 'Gerenciamento Geral' 
    },
    style: {
      bgColor: '#5874f6', // AZUL DA MARCA
      textColor: '#ffffff'
    }
  },

  // 2. CARD DE ADMIN (Mantido)
  {
    id: 'adm_user_card',
    type: 'admin-user-card',
    isVisible: true,
    data: {
      userName: 'Mayra', // Idealmente viria do contexto de usuário
      roleLabel: 'Master',
      userImage: 'https://placehold.co/200x200/5874f6/ffffff?text=MY'
    },
    style: {
      bgColor: '#eeeeee',
    }
  },

  // 3. SEÇÃO DE AÇÃO
  {
    id: 'adm_section_title',
    type: 'order-header',
    isVisible: true,
    data: { title: 'Acesso Rápido' },
    style: { bgColor: 'transparent', textColor: '#9ca3af', padding: '10px 0 0 0' }
  },

  // 4. GRID DE BOTÕES (Funcionalidades do Admin)
  {
    id: 'adm_grid_actions',
    type: 'grid-buttons',
    isVisible: true,
    data: {
      buttons: [
        { id: 'btn_lojas', label: 'Lojas', icon: 'store' },
        { id: 'btn_botoes', label: 'Botões' },
        { id: 'btn_vendedoras', label: 'Vendedoras' },
        { id: 'btn_usuarios', label: 'Usuários' },
        { id: 'btn_imgs', label: 'Imagens' },
        { id: 'btn_boxs', label: "Box's" },
        { id: 'btn_login', label: 'Acessos' },
        { id: 'btn_prods', label: 'Produtos' },
        { id: 'btn_estoque', label: 'Estoque' },
        { id: 'btn_modelos', label: 'Modelos' },
        { id: 'btn_telas', label: 'Config Telas' },
        { id: 'btn_config', label: 'Ajustes' },
      ]
    },
    style: {
      bgColor: 'transparent',
    }
  },

  // 5. FOOTER UNIVERSAL (CORRIGIDO)
  // Agora contém os mesmos 5 itens das outras páginas
  {
    id: 'adm_footer',
    type: 'footer',
    isVisible: true,
    data: {
      footerItems: [
        { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
        { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
        { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/dashboard' }, // Botão central Dashboard
        { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
        { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' }
      ]
    },
    style: {
      bgColor: '#5874f6' // AZUL DA MARCA
    }
  }
];