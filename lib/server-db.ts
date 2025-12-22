// lib/server-db.ts
import { INVENTORY_BLOCKS } from '@/data/inventory-state';
import { BlockConfig } from '@/types/builder';

// Usamos uma variável global para persistir os dados enquanto o servidor roda
// (Isso evita que os dados sumam em hot-reloads simples em desenvolvimento)
declare global {
  var __inventory_store: BlockConfig[] | undefined;
}

if (!global.__inventory_store) {
  global.__inventory_store = [...INVENTORY_BLOCKS];
}

export const getBlocks = () => {
  return global.__inventory_store || [];
};

export const updateBoxImage = (imageUrl: string) => {
  if (!global.__inventory_store) return;

  console.log(" [SERVER] Recebendo nova imagem no Box Maryland...");

  global.__inventory_store = global.__inventory_store.map(block => {
    if (block.type === 'inventory-feature') {
      return {
        ...block,
        data: {
          ...block.data,
          boxImage: imageUrl // Atualiza a imagem na memória do servidor
        }
      };
    }
    return block;
  });
  
  return global.__inventory_store;
};