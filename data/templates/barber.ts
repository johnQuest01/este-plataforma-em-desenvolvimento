// data/templates/barber.ts
import { BlockConfig } from '@/types/builder';

export const BARBER_TEMPLATE: BlockConfig[] = [
  {
    id: "header-navalha",
    type: "header",
    isVisible: true,
    data: {
      title: "Navalha de Ouro",
      subtitle: "Estilo clássico, precisão moderna",
      address: "Rua Augusta, 1500 - SP"
    },
    style: {
      bgColor: "#8B4513",
      textColor: "#F5F5DC",
      padding: "16px",
      borderRadius: "0"
    }
  },
  {
    id: "banner-navalha",
    type: "banner",
    isVisible: true,
    data: {
      imageUrl: "https://placehold.co/600x300/8B4513/F5F5DC?text=Navalha+de+Ouro",
      title: "Bem-vindo à Navalha de Ouro",
      subtitle: "A barbearia onde tradição encontra estilo"
    },
    style: {
      bgColor: "#F5F5DC",
      textColor: "#8B4513",
      borderRadius: "12px",
      padding: "12px"
    }
  },
  {
    id: "categories-navalha",
    type: "categories",
    isVisible: true,
    data: {
      title: "Serviços",
      items: [
        { 
          label: "Corte", 
          icon: "star", 
          link: "/servicos/corte",
          // Vídeo de Corte de Cabelo
          videoUrl: "https://videos.pexels.com/video-files/3998394/3998394-hd_720_1280_25fps.mp4",
          videoColor: "#b45309" // Marrom Dourado
        },
        { 
          label: "Barba", 
          icon: "zap", 
          link: "/servicos/barba",
          // Vídeo de Barbearia / Toalha
          videoUrl: "https://videos.pexels.com/video-files/5724269/5724269-uhd_2160_4096_25fps.mp4",
          videoColor: "#78350f" // Marrom Escuro
        },
        { 
          label: "Bigode", 
          icon: "fire", 
          link: "/servicos/bigode",
          // Vídeo de Estilo
          videoUrl: "https://videos.pexels.com/video-files/4990992/4990992-hd_1080_1920_30fps.mp4",
          videoColor: "#fbbf24" // Dourado
        }
      ]
    },
    style: {
      bgColor: "#F5F5DC",
      textColor: "#8B4513",
      padding: "20px",
      borderRadius: "16px",
      accentColor: "#8B4513"
    }
  },
  // ... Resto dos blocos (product-grid, footer) mantidos iguais ...
  {
    id: "product-grid-navalha",
    type: "product-grid",
    isVisible: true,
    data: {
      title: "Nossos Serviços",
      products: [
        { name: "Corte Degradê", price: "R$ 45,00", tag: "Popular", imageUrl: "https://placehold.co/400x500/5c2e0b/F5F5DC?text=Corte" },
        { name: "Barba Lenhador", price: "R$ 40,00", tag: "Completa", imageUrl: "https://placehold.co/400x500/3E1F05/F5F5DC?text=Barba" },
        { name: "Acabamento Navalha", price: "R$ 30,00", tag: "Detalhe", imageUrl: "https://placehold.co/400x500/8B4513/F5F5DC?text=Navalha" }
      ],
      gridColumns: 3
    },
    style: { bgColor: "#F5F5DC", textColor: "#8B4513", padding: "16px", borderRadius: "16px" }
  },
  {
    id: "footer-navalha",
    type: "footer",
    isVisible: true,
    data: {
      footerItems: [
        { id: "home", icon: "home", isVisible: true, route: "/" },
        { id: "schedule", icon: "inventory", label: "Agendar", isVisible: true, route: "/agendar", isHighlight: true },
        { id: "profile", icon: "user", isVisible: true, route: "/perfil" }
      ]
    },
    style: { bgColor: "#8B4513" }
  }
];