import { BlockConfig } from '@/types/builder';

export const GENERIC_TEMPLATE: BlockConfig[] = [
  {
    id: 'gen_header',
    type: 'header',
    isVisible: true,
    data: { address: 'Endereço da Loja' },
    style: { bgColor: '#111827', textColor: '#ffffff' } // Header Preto (Neutro)
  },
  {
    id: 'gen_banner',
    type: 'banner',
    isVisible: true,
    data: {},
    style: { bgColor: '#f3f4f6', borderRadius: '0' } // Banner Quadrado
  },
  {
    id: 'gen_grid',
    type: 'product-grid',
    isVisible: true,
    data: {
      title: 'Produtos em Destaque',
      products: [] // Produtos virão do banco
    },
    style: { bgColor: '#ffffff' }
  },
  {
    id: 'gen_footer',
    type: 'footer',
    isVisible: true,
    data: {
      footerItems: [
        { id: 'f1', icon: 'home', isVisible: true, route: '/' },
        { id: 'f2', icon: 'cart', isVisible: true, route: '/cart' },
        { id: 'f3', icon: 'user', isVisible: true, route: '/account' }
      ]
    },
    style: { bgColor: '#111827' }
  }
];