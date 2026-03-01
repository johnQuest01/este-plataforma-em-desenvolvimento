import { INVENTORY_BLOCKS } from '@/data/inventory-state';
import { BlockConfig } from '@/types/builder';

// 🛡️ TIPAGEM ESTRITA GLOBAL: Persistência em memória para o servidor de dev
declare global {
  // eslint-disable-next-line no-var
  var __inventory_store: BlockConfig[] | undefined;
}

if (!globalThis.__inventory_store) {
  globalThis.__inventory_store = [...INVENTORY_BLOCKS];
}

export const getBlocks = (): BlockConfig[] => {
  return globalThis.__inventory_store ??[];
};

export const updateBoxImage = (imageUrl: string): BlockConfig[] | undefined => {
  if (!globalThis.__inventory_store) return undefined;

  console.log("📦 [SERVER] Recebendo nova imagem no Box Maryland...");

  globalThis.__inventory_store = globalThis.__inventory_store.map((block) => {
    if (block.type === 'inventory-feature') {
      
      // 🛡️ TYPE GUARD: Garante que 'data' é um objeto válido antes do spread
      const currentData = typeof block.data === 'object' && block.data !== null && !Array.isArray(block.data)
        ? block.data
        : {};

      return {
        ...block,
        data: {
          ...currentData,
          boxImage: imageUrl // Atualiza a imagem na memória do servidor
        }
      };
    }
    return block;
  });
  
  return globalThis.__inventory_store;
};