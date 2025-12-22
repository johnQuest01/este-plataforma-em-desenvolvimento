// data/templates/christmas.ts
import { BlockConfig } from '@/types/builder';

export const CHRISTMAS_TEMPLATE: BlockConfig[] = [
  // Header
  {
    id: "xmas_header",
    type: "header",
    isVisible: true,
    data: { title: "Ofertas de Natal", subtitle: "Ho Ho Ho! Descontos Mágicos", address: "Pólo Norte, Logística Express" },
    style: { bgColor: "#D42426", textColor: "#ffffff", borderBottom: "4px solid #165B33" }
  },
  // Banner
  {
    id: "xmas_banner",
    type: "banner",
    isVisible: true,
    data: { imageUrl: "https://placehold.co/600x350/D42426/ffffff?text=FELIZ+NATAL+2025" },
    style: { bgColor: "#ffffff", padding: "12px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(212, 36, 38, 0.2)" }
  },
  
  // --- CATEGORIAS NATALINAS COM REELS ---
  {
    id: "xmas_cats",
    type: "categories",
    isVisible: true,
    data: {
      title: "Lista de Presentes",
      items: [
        { 
          label: "Para Ele", icon: "star", link: "/cat/him",
          // Vídeo abrindo presentes
          videoUrl: "https://videos.pexels.com/video-files/6102377/6102377-hd_1080_1920_25fps.mp4",
          videoColor: "#165B33" // Verde
        },
        { 
          label: "Para Ela", icon: "heart", link: "/cat/her",
          // Vídeo com luzes de natal
          videoUrl: "https://videos.pexels.com/video-files/3249917/3249917-hd_1080_1920_25fps.mp4",
          videoColor: "#D42426" // Vermelho
        },
        { 
          label: "Crianças", icon: "sun", link: "/cat/kids",
          // Vídeo de neve/brincadeira
          videoUrl: "https://videos.pexels.com/video-files/6102943/6102943-hd_1080_1920_25fps.mp4",
          videoColor: "#fbbf24" // Dourado
        },
        { 
          label: "Amigo Secreto", icon: "zap", link: "/cat/gift",
          // Vídeo de brinde/festa
          videoUrl: "https://videos.pexels.com/video-files/3206253/3206253-hd_1080_1920_25fps.mp4",
          videoColor: "#9ca3af" // Prata
        }
      ]
    },
    style: {
      bgColor: "#F0FDF4",
      textColor: "#165B33",
      accentColor: "#D42426"
    }
  },
  // ... Resto (Product Grid e Footer) ...
  {
    id: "xmas_grid",
    type: "product-grid",
    isVisible: true,
    data: {
      title: "Destaques do Noel",
      products: [
        { name: "Kit Perfume Premium", tag: "Presentão", price: "R$ 299,90", imageUrl: "https://placehold.co/400x500/165B33/ffffff?text=Presente+1" },
        { name: "Tênis Esportivo", tag: "50% OFF", price: "R$ 199,90", imageUrl: "https://placehold.co/400x500/D42426/ffffff?text=Presente+2" },
        { name: "Relógio Smart", tag: "Tech", price: "R$ 450,00", imageUrl: "https://placehold.co/400x500/BB2528/ffffff?text=Presente+3" },
        { name: "Vale Presente", tag: "Rápido", price: "R$ 100,00", imageUrl: "https://placehold.co/400x500/FFD700/000000?text=Vale+Presente" }
      ],
      gridColumns: 2
    },
    style: { bgColor: "#ffffff", textColor: "#D42426" }
  },
  {
    id: "xmas_footer",
    type: "footer",
    isVisible: true,
    data: {
      footerItems: [
        { id: "f1", icon: "home", isVisible: true, route: "/" },
        { id: "f2", icon: "cart", isVisible: true, route: "/cart" },
        { id: "f3", icon: "heart", isVisible: true, route: "/wishlist", isHighlight: true },
        { id: "f4", icon: "user", isVisible: true, route: "/account" }
      ]
    },
    style: { bgColor: "#165B33" }
  }
];