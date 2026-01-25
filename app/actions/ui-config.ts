'use server';

/**
 * 🧱 BLOCO LEGO: Sistema de Configuração de UI (UI Config Management)
 * 
 * Server Actions para gerenciar layouts dinâmicos das páginas.
 * Integrado com o sistema CMS Dinâmico para buscar blocos do banco de dados.
 * 
 * 📦 CONTEXTO:
 * - Busca layouts salvos no banco (UIConfig)
 * - Fallback para templates iniciais se não houver layout
 * - Suporta múltiplas páginas (home, dashboard, inventory)
 */

import { prisma } from '@/lib/prisma';
import { BlockConfig } from '@/types/builder';
import { INITIAL_BLOCKS } from '@/data/initial-state';

/**
 * 🔍 Busca o layout de uma página específica
 * 
 * @param pageSlug - Identificador da página ('home', 'dashboard', 'inventory')
 * @returns Array de BlockConfig ou null se não encontrado
 */
export async function getPageLayoutAction(pageSlug: string): Promise<BlockConfig[] | null> {
  try {
    const uiConfig = await prisma.uIConfig.findUnique({
      where: { pageSlug }
    });

    if (!uiConfig) {
      console.log(`ℹ️ [UI Config] Layout não encontrado para "${pageSlug}". Usando fallback.`);
      return null;
    }

    // Parse do JSON para BlockConfig[]
    const layout = uiConfig.layout as unknown as BlockConfig[];
    console.log(`✅ [UI Config] Layout carregado para "${pageSlug}": ${layout.length} blocos`);
    
    return layout;
  } catch (error) {
    console.error(`❌ [UI Config] Erro ao buscar layout de "${pageSlug}":`, error);
    return null;
  }
}

/**
 * 💾 Salva o layout de uma página
 * 
 * @param pageSlug - Identificador da página
 * @param layout - Array de BlockConfig
 * @returns Success boolean
 */
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
    console.error(`❌ [UI Config] Erro ao salvar layout de "${pageSlug}":`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * 🏠 Busca o layout da Home (Dashboard)
 * Com fallback para INITIAL_BLOCKS
 */
export async function getHomeLayoutAction(): Promise<BlockConfig[]> {
  const layout = await getPageLayoutAction('home');
  return layout || INITIAL_BLOCKS;
}
