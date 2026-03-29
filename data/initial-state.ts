// data/initial-state.ts
import { BlockConfig } from '@/types/builder';

export const INITIAL_BLOCKS: BlockConfig[] = [
  {
    id: 'blk_header_main',
    type: 'header',
    isVisible: true,
    data: {
      address: 'Enviar para Bruno, Rua Antonio Trajano...',
    },
    style: {
      bgColor: '#5874f6',
      textColor: '#ffffff',
    }
  },
  {
    id: 'blk_banner_main',
    type: 'banner',
    isVisible: true,
    data: {},
    style: {
      bgColor: '#ffffff',
      textColor: '#000000',
      borderRadius: '1rem'
    }
  },
  {
    id: 'blk_categories_top',
    type: 'categories',
    isVisible: true,
    data: {
      items: [
        { 
          label: 'Praia', 
          icon: 'sun', 
          // Vídeo de Exemplo (Mar e Sol)
          videoUrl: 'https://videos.pexels.com/video-files/3209828/3209828-hd_720_1280_25fps.mp4',
          videoColor: '#fbbf24' // Amarelo Sol
        },
        { 
          label: 'Destaques', 
          icon: 'star',
          // Vídeo de Moda Urbana
          videoUrl: 'https://videos.pexels.com/video-files/5709923/5709923-uhd_2160_4096_25fps.mp4',
          videoColor: '#5874f6' // Azul Padrão
        },
        { 
          label: 'Relâmpago', 
          icon: 'zap',
          // Vídeo Dinâmico
          videoUrl: 'https://videos.pexels.com/video-files/6146649/6146649-hd_1080_1920_30fps.mp4',
          videoColor: '#ef4444' // Vermelho Alerta
        },
        { 
          label: 'Inverno', 
          icon: 'umbrella',
          // Vídeo Neve/Frio
          videoUrl: 'https://videos.pexels.com/video-files/855018/855018-hd_1280_720_30fps.mp4',
          videoColor: '#0ea5e9' // Azul Gelo
        }
      ]
    },
    style: {
      bgColor: 'transparent',
      textColor: '#111827',
      accentColor: '#111827'
    }
  },
  // 🧱 REMOVIDO: Seção "Lançamentos da Semana" - Produtos serão exibidos apenas por categoria
  {
    id: 'blk_footer_main',
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
    style: {
      bgColor: '#5874f6',
    }
  }
];