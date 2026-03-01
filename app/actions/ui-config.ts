'use server';

import { prisma } from '@/lib/prisma';
import { BlockConfig } from '@/types/builder';
import { INITIAL_BLOCKS } from '@/data/initial-state';

// 🛡️ TYPE GUARD 1: Validação estrita de Objetos
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// 🛡️ TYPE GUARD 2: Validação estrita do Array de BlockConfig (Substitui o "as unknown as BlockConfig[]")
const isBlockConfigArray = (data: unknown): data is BlockConfig[] => {
  if (!Array.isArray(data)) return false;
  return data.every(item => isRecord(item) && typeof item.id === 'string' && typeof item.type === 'string');
};

export async function getPageLayoutAction(pageSlug: string): Promise<BlockConfig[] | null> {
  try {
    const uiConfig = await prisma.uIConfig.findUnique({
      where: { pageSlug }
    });

    if (!uiConfig || !uiConfig.layout) {
      console.log(`ℹ️ [UI Config] Layout não encontrado para "${pageSlug}". Usando fallback.`);
      return null;
    }

    // 🛡️ Validação estrita em tempo de execução (Zero-Any)
    if (isBlockConfigArray(uiConfig.layout)) {
      console.log(`✅ [UI Config] Layout carregado para "${pageSlug}": ${uiConfig.layout.length} blocos`);
      return uiConfig.layout;
    }

    console.error(`❌ [UI Config] Formato de layout inválido no banco para "${pageSlug}".`);
    return null;
  } catch (error) {
    console.error(`❌ [UI Config] Erro ao buscar layout de "${pageSlug}":`, error);
    return null;
  }
}

export async function savePageLayoutAction(
  pageSlug: string, 
  layout: BlockConfig[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.uIConfig.upsert({
      where: { pageSlug },
      create: {
        pageSlug,
        layout: JSON.parse(JSON.stringify(layout)),
      },
      update: {
        layout: JSON.parse(JSON.stringify(layout)),
      },
    });

    console.log(`✅ [UI Config] Layout salvo para "${pageSlug}"`);
    return { success: true };
  } catch (error) {
    console.error(`❌[UI Config] Erro ao salvar layout de "${pageSlug}":`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function getHomeLayoutAction(): Promise<BlockConfig[]> {
  const layout = await getPageLayoutAction('home');
  return layout || INITIAL_BLOCKS;
}