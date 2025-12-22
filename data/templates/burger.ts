// data/templates/burger.ts
import { BlockConfig } from '@/types/builder';

export const BURGER_TEMPLATE: BlockConfig[] = [
  // Header
  {
    id: 'food_header',
    type: 'header',
    isVisible: true,
    data: { address: 'Rua da Fome, 123 - Centro', title: 'Burger King Demo' },
    style: { bgColor: '#d92323', textColor: '#ffffff' }
  },
  // Banner
  {
    id: 'food_banner',
    type: 'banner',
    isVisible: true,
    data: {},
    style: { bgColor: '#ffc107', borderRadius: '0' }
  },
  
  // --- CATEGORIAS FOOD COM REELS ---
  {
    id: 'food_cats',
    type: 'categories',
    isVisible: true,
    data: {
      items: [
        { 
          label: 'Combos', icon: 'star',
          // Vídeo de Hambúrguer na grelha ou montagem
          videoUrl: "https://videos.pexels.com/video-files/2996024/2996024-hd_1080_1920_24fps.mp4",
          videoColor: "#d92323" // Vermelho
        },
        { 
          label: 'Bebidas', icon: 'zap',
          // Vídeo de Refrigerante com gelo
          videoUrl: "https://videos.pexels.com/video-files/4252329/4252329-hd_1080_1920_30fps.mp4",
          videoColor: "#fb923c" // Laranja
        },
        { 
          label: 'Sobremesa', icon: 'sun',
          // Vídeo de Sorvete/Calda
          videoUrl: "https://videos.pexels.com/video-files/4706322/4706322-hd_1080_1920_25fps.mp4",
          videoColor: "#ec4899" // Rosa
        },
        { 
          label: 'Vegano', icon: 'heart',
          // Vídeo de Salada fresca
          videoUrl: "https://videos.pexels.com/video-files/3209663/3209663-hd_1080_1920_25fps.mp4",
          videoColor: "#16a34a" // Verde
        }
      ]
    },
    style: {
      bgColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#d92323'
    }
  },
  // ... Resto (Product Grid e Footer) ...
  {
    id: 'food_grid',
    type: 'product-grid',
    isVisible: true,
    data: {
      title: 'Mais Pedidos',
      products: [
        { name: 'X-Bacon Duplo', tag: '🔥 Hot', imageColor: '78350f', price: 'R$ 32,90' },
        { name: 'Smash Salad', tag: 'Leve', imageColor: '166534', price: 'R$ 24,50' },
        { name: 'Combo Família', tag: 'Oferta', imageColor: 'fbbf24', price: 'R$ 89,90' }
      ]
    },
    style: { bgColor: '#f9f9f9' }
  },
  {
    id: 'food_footer',
    type: 'footer',
    isVisible: true,
    data: {
      footerItems: [
        { id: 'f1', icon: 'home', isVisible: true, route: '/' },
        { id: 'f2', icon: 'cart', isVisible: true, route: '/cart' },
        { id: 'f3', icon: 'user', isVisible: true, route: '/account' }
      ]
    },
    style: { bgColor: '#1f2937' }
  }
];