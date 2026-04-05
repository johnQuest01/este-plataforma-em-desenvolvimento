import { BlockConfig } from '@/types/builder';

export const ADMIN_TEMPLATE: BlockConfig[] = [
  {
    id: 'adm_header',
    type: 'header',
    isVisible: true,
    data: { title: 'Painel Admin', address: 'Gerenciamento Geral' },
    style: { bgColor: '#5874f6', textColor: '#ffffff' }
  },
  {
    id: 'adm_user_card',
    type: 'admin-user-card',
    isVisible: true,
    data: { userName: 'Mayra', roleLabel: 'Master', userImage: 'https://placehold.co/200x200/5874f6/ffffff?text=MY' },
    style: { bgColor: '#eeeeee' }
  },
  {
    id: 'adm_video_manager',
    type: 'video-background-manager',
    isVisible: true,
    data: {},
    style: { padding: '16px' }
  },
  {
    id: 'adm_section_title',
    type: 'order-header',
    isVisible: true,
    data: { title: 'Acesso Rápido' },
    style: { bgColor: 'transparent', textColor: '#9ca3af', padding: '10px 0 0 0' }
  },
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
    style: { bgColor: 'transparent' }
  },
  {
    id: 'adm_footer',
    type: 'footer',
    isVisible: true,
    data: {
      footerItems: [
        { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
        { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
        { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/dashboard' },
        { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
        { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' }
      ]
    },
    style: { bgColor: '#5874f6' }
  }
];