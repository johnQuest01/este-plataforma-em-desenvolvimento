import { BlockConfig } from '@/types/builder';

export const INITIAL_BLOCKS: BlockConfig[] =[
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
      items:[
        { 
          label: 'Praia', 
          icon: 'sun', 
          videoUrl: 'https://videos.pexels.com/video-files/3209828/3209828-hd_720_1280_25fps.mp4',
          videoColor: '#fbbf24' 
        },
        { 
          label: 'Destaques', 
          icon: 'star',
          videoUrl: 'https://videos.pexels.com/video-files/5709923/5709923-uhd_2160_4096_25fps.mp4',
          videoColor: '#5874f6' 
        },
        { 
          label: 'Relâmpago', 
          icon: 'zap',
          videoUrl: 'https://videos.pexels.com/video-files/6146649/6146649-hd_1080_1920_30fps.mp4',
          videoColor: '#ef4444' 
        },
        { 
          label: 'Inverno', 
          icon: 'umbrella',
          videoUrl: 'https://videos.pexels.com/video-files/855018/855018-hd_1280_720_30fps.mp4',
          videoColor: '#0ea5e9' 
        }
      ]
    },
    style: {
      bgColor: 'transparent',
      textColor: '#111827',
      accentColor: '#111827'
    }
  },
  // ✅ BLOCO WALKING MODEL COM OS CAMINHOS EXATOS DA PASTA PUBLIC
  {
    id: 'blk_walking_models_main',
    type: 'walking-model',
    isVisible: true,
    data: {
      walkingModelImages:[
        '/models/modelo.1.png',
        '/models/modelo.2.png',
        '/models/modelo.3.png',
        '/models/modelo.4.png',
        '/models/modelo.5.png',
        '/models/modelo.6.png'
      ],
      animationDurationSeconds: 25 
    },
    style: {
      bgColor: '#ffffff'
    }
  },
  {
    id: 'blk_footer_main',
    type: 'footer',
    isVisible: true,
    data: {
      footerItems:[
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