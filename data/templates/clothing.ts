import { BlockConfig } from '@/types/builder';

export const CLOTHING_TEMPLATE: BlockConfig[] = [
  {
    id: 'inv_header',
    type: 'header',
    isVisible: true,
    data: { address: '' },
    style: { bgColor: '#5874f6', textColor: '#ffffff' }
  },
  {
    id: 'inv_user_info',
    type: 'user-info',
    isVisible: true,
    data: {
      userName: 'Bruno',
      bagPinkTitle: 'BAG COMPRAS',
      bagBlueTitle: 'BAG MOCHILA',
      mainTitle: 'Meu Inventário Maryland'
    },
    style: { bgColor: '#eeeeee' }
  },
  {
    id: 'inv_grid_top',
    type: 'grid-buttons',
    isVisible: true,
    data: {
      buttons: [
        { id: 'btn_hist', label: 'Histórico de Compras' },
        { id: 'btn_stock', label: 'Estoque', action: 'openStockModal' },
        { id: 'btn_login', label: 'Login / Senha' },
        { id: 'btn_orders', label: 'Pedidos', action: 'openOrders' },
      ]
    },
    style: { bgColor: '#eeeeee' }
  },
  {
    id: 'inv_main_feature',
    type: 'inventory-feature',
    isVisible: true,
    data: {
      featureTitleLeft: 'Meu Inventario',
      featureTitleRight: 'Status do Pedido',
      boxLabel: 'Box Maryland',
      boxTitle: 'Box de Maryland',
    },
    style: { bgColor: '#eeeeee' }
  },
  {
    id: 'inv_actions_bottom',
    type: 'action-buttons',
    isVisible: true,
    data: {
      buttons: [
        { id: 'act_my_purchases', label: 'Minhas compras', bgColor: '#5874f6', textColor: '#fff' },
        {
          id: 'act_make_order',
          label: 'Fazer pedido',
          bgColor: '#5874f6',
          textColor: '#fff',
          action: 'openCatalog'
        },
        { id: 'act_box_received', label: 'Box Recebidas', bgColor: '#ff4d6d', textColor: '#fff', badge: '9' },
        { id: 'act_box_opened', label: 'Box Abertas', bgColor: '#5874f6', textColor: '#fff' },
      ]
    },
    style: { bgColor: '#eeeeee' }
  },
  {
    id: 'inv_footer',
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