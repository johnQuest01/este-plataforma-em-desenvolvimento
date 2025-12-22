// data/templates/futuristic.ts
import { BlockConfig } from '@/types/builder';

const NEON_CYAN = "#00f3ff";
const NEON_PURPLE = "#bc13fe";
const DARK_BG = "#050505";
const GLASS_BG = "#1a1a1a";

export const FUTURISTIC_TEMPLATE: BlockConfig[] = [
  // ... Header e Banner mantidos ...
  {
    id: "cyber_header",
    type: "header",
    isVisible: true,
    data: { title: "NEO_STORE_v2", address: "SERVER: BR_SAO_PAULO_01" },
    style: { bgColor: DARK_BG, textColor: NEON_CYAN, padding: "20px 16px", borderBottom: `1px solid ${NEON_PURPLE}` }
  },
  {
    id: "cyber_banner",
    type: "banner",
    isVisible: true,
    data: { imageUrl: "https://placehold.co/600x350/000000/00f3ff?text=SYSTEM_UPDATE_READY" },
    style: { bgColor: "transparent", padding: "0 16px", borderRadius: "0px", border: `1px solid ${NEON_CYAN}`, boxShadow: `0 0 15px ${NEON_CYAN}40` }
  },
  
  // --- CATEGORIAS COM REELS TECH ---
  {
    id: "cyber_cats",
    type: "categories",
    isVisible: true,
    data: {
      items: [
        { 
          label: "HARDWARE", icon: "zap", link: "/cat/hw",
          // Vídeo de Placa de Circuito / Tech
          videoUrl: "https://videos.pexels.com/video-files/2516159/2516159-hd_1280_720_24fps.mp4",
          videoColor: NEON_CYAN
        },
        { 
          label: "SOFTWARE", icon: "star", link: "/cat/sw",
          // Vídeo de Código Matrix
          videoUrl: "https://videos.pexels.com/video-files/5473806/5473806-hd_1080_1920_30fps.mp4",
          videoColor: NEON_PURPLE
        },
        { 
          label: "NET_RUN", icon: "fire", link: "/cat/net",
          // Vídeo de Cidade Neon
          videoUrl: "https://videos.pexels.com/video-files/3121459/3121459-hd_1280_720_25fps.mp4",
          videoColor: "#ff003c" // Vermelho Cyber
        },
        { 
          label: "DATA", icon: "sun", link: "/cat/data",
          // Vídeo Abstrato Digital
          videoUrl: "https://videos.pexels.com/video-files/2759750/2759750-hd_1280_720_30fps.mp4",
          videoColor: "#ffffff"
        }
      ]
    },
    style: {
      bgColor: "transparent",
      textColor: "#ffffff",
      accentColor: NEON_PURPLE
    }
  },
  // ... Restante do arquivo (Product Grid, Status, Footer) ...
  {
    id: "cyber_grid",
    type: "product-grid",
    isVisible: true,
    data: {
      title: "UPGRADES DISPONÍVEIS",
      products: [
        { name: "Neural Link v4.0", tag: "BETA", imageColor: "000000", price: "Ξ 2.5 ETH", imageUrl: "https://placehold.co/400x500/111111/bc13fe?text=NEURAL+LINK" },
        { name: "Cyber Arm MK-II", tag: "MILITARY", imageColor: "000000", price: "Ξ 5.0 ETH", imageUrl: "https://placehold.co/400x500/111111/00f3ff?text=CYBER+ARM" },
        { name: "Optical Camo", tag: "STEALTH", imageColor: "000000", price: "Ξ 1.2 ETH", imageUrl: "https://placehold.co/400x500/111111/00ff00?text=OPTIC+CAMO" },
        { name: "Data Shard 500TB", tag: "STORAGE", imageColor: "000000", price: "Ξ 0.5 ETH", imageUrl: "https://placehold.co/400x500/111111/ffffff?text=DATA+SHARD" }
      ],
      gridColumns: 2
    },
    style: { bgColor: "transparent", textColor: NEON_CYAN }
  },
  {
    id: "cyber_status",
    type: "user-info",
    isVisible: true,
    data: { userName: "USER_ID_992", mainTitle: "INVENTÁRIO PESSOAL", bagPinkTitle: "LOOT", bagBlueTitle: "EQUIP" },
    style: { bgColor: GLASS_BG, textColor: "#ffffff" }
  },
  {
    id: "cyber_footer",
    type: "footer",
    isVisible: true,
    data: {
      footerItems: [
        { id: "f1", icon: "home", isVisible: true, route: "/" },
        { id: "f2", icon: "cart", isVisible: true, route: "/cart" },
        { id: "f3", icon: "sync", isVisible: true, route: "/sync", isHighlight: true },
        { id: "f4", icon: "verified", isVisible: true, route: "/verified" },
        { id: "f5", icon: "package-check", isVisible: true, route: "/inventory" }
      ]
    },
    style: { bgColor: NEON_PURPLE }
  }
];