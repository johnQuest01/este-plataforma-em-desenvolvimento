// data/inventory-state.ts
import { BlockConfig } from '@/types/builder';

export const INVENTORY_BLOCKS: BlockConfig[] = [
  // 1. HEADER
  {
    id: 'inv_header',
    type: 'header',
    isVisible: true,
    data: { address: '' },
    style: { bgColor: '#5874f6', textColor: '#ffffff' }
  },
  // 2. INFO USUÁRIO
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
  // 3. GRID BUTTONS (Botões do Topo - "Pedidos" abre Status)
  {
    id: 'inv_grid_top',
    type: 'grid-buttons',
    isVisible: true,
    data: {
      buttons: [
        { id: 'btn_hist', label: 'Histórico de Compras' },
        { id: 'btn_stock', label: 'Estoque', action: 'openStockModal' },
        { id: 'btn_login', label: 'Login / Senha' },
        { id: 'btn_orders', label: 'Pedidos', action: 'openOrders' }, // Ação para ver Status
      ]
    },
    style: { bgColor: '#eeeeee' }
  },
  // 4. FUNCIONALIDADE PRINCIPAL (BOX)
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
  // 5. BOTÕES DE AÇÃO INFERIORES (Botão "Fazer pedido" abre Catálogo)
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
          action: 'openCatalog' // <--- AÇÃO NOVA ADICIONADA AQUI
        },
        { id: 'act_box_received', label: 'Box Recebidas', bgColor: '#ff4d6d', textColor: '#fff', badge: '9' },
        { id: 'act_box_opened', label: 'Box Abertas', bgColor: '#5874f6', textColor: '#fff' },
      ]
    },
    style: { bgColor: '#eeeeee' }
  },
  // 6. FOOTER COM ROTAS
  {
    id: 'inv_footer',
    type: 'footer',
    isVisible: true,
    data: {
      footerItems: [
        { id: 'f1', icon: 'cart', isVisible: true, route: '/cart' },
        { id: 'f2', icon: 'heart', isVisible: true, route: '/favorites' },
        { id: 'f3', icon: 'sync', isVisible: true, isHighlight: true, route: '/' },
        { id: 'f4', icon: 'verified', isVisible: true, route: '/verified' },
        { id: 'f5', icon: 'package-check', isVisible: true, route: '/inventory' }
      ]
    },
    style: { bgColor: '#5874f6' }
  }
];

export const STOCK_BLOCKS: BlockConfig[] = [
  // 1. CABEÇALHO
  {
    id: 'stock_info',
    type: 'stock-header',
    isVisible: true,
    data: {
      title: 'Estoque de produtos da Loja 2: rua casemiro de abreu',
      subtitle: 'Todo o meu estoque Maryland',
      buttonLabel: 'Cadastrar produtos',
    },
    style: {
      bgColor: '#eeeeee',
      textColor: '#000000',
    }
  },
  // 2. BUSCA
  {
    id: 'stock_search',
    type: 'stock-search',
    isVisible: true,
    data: {
      placeholder: 'Nome do Produto ou SKU',
      buttonLabel: 'Buscar',
    },
    style: {
      bgColor: '#eeeeee',
      buttonColor: '#5874f6',
      buttonTextColor: '#ffffff'
    }
  },
  // 3. FILTROS
  {
    id: 'stock_actions_grid',
    type: 'stock-filter-buttons',
    isVisible: true,
    data: {
      buttons: [
        {
          id: 'btn_esgotar',
          label: 'Esgotar',
          bgColor: '#5874f6',
          textColor: '#ffffff',
          indicatorColor: '#ff4d6d'
        },
        {
          id: 'btn_regular',
          label: 'Regular',
          bgColor: '#ffffff',
          textColor: '#000000',
          indicatorColor: '#fb923c'
        },
        {
          id: 'btn_cheio',
          label: 'Cheio',
          bgColor: '#ffffff',
          textColor: '#000000',
          indicatorColor: '#22c55e'
        },
        {
          id: 'btn_defina',
          label: 'Defina',
          bgColor: '#ffffff',
          textColor: '#000000',
          action: 'openDefinePopup'
        }
      ]
    },
    style: { bgColor: '#eeeeee' }
  },
  // 4. GRID DE CATEGORIAS
  {
    id: 'stock_category_grid',
    type: 'stock-category-grid',
    isVisible: true,
    data: {
      categories: [
        { label: 'Calçados', status: 'high' },
        { label: 'Jeans com gliter', status: 'low' },
        { label: 'Moletom', status: 'low' },
        { label: 'LAGS', status: 'low' },
        { label: 'Saia longa', status: 'medium' },
        { label: 'Tênnis', status: 'medium' },
        { label: 'Calçados', status: 'medium' },
        { label: 'Calçados', status: 'high' },
        { label: 'Garrafas', status: 'high' },
        { label: 'Canecas', status: 'low' },
        { label: 'Sandalias', status: 'low' },
        { label: 'Agasalhos', status: 'low' },
        { label: 'Saia longa', status: 'medium' },
        { label: 'Tênnis', status: 'medium' },
        { label: 'Calçados', status: 'medium' },
        { label: 'Calçados', status: 'high' },
      ],
      gridColumns: 2,
    },
    style: {
      bgColor: '#eeeeee',
      textColor: '#000000',
      padding: 'pt-2 pb-24'
    }
  },
];