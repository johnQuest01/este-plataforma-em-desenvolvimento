// app/actions/layout-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { BlockConfig } from "@/types/builder";

// Schema de validação para o input da Action
const FetchLayoutSchema = z.object({
  slug: z.string().min(1, "O slug da página é obrigatório")
});

/**
 * Busca a configuração de layout Lego para uma página específica.
 * @param slug - Identificador único da página (ex: 'home').
 */
export async function getPageLayoutAction(slug: string) {
  // 1. Validação Zod Strict
  const validation = FetchLayoutSchema.safeParse({ slug });

  if (!validation.success) {
    return { success: false, message: "Slug inválido", blocks: [] as BlockConfig[] };
  }

  try {
    // 2. Busca no modelo UIConfig
    // Nota: O Prisma gera 'uIConfig' (camelCase) a partir de 'model UIConfig'
    const config = await prisma.uIConfig.findUnique({
      where: { pageSlug: slug },
      select: { layout: true }
    });

    if (!config || !config.layout) {
      return { 
        success: false, 
        message: "Layout não encontrado para este slug.", 
        blocks: [] as BlockConfig[] 
      };
    }

    // 3. Strict Typing: Asserção segura de JsonValue para BlockConfig[]
    // O Prisma retorna JsonValue, que é incompatível com tipos estritos sem cast.
    // Garantimos via arquitetura que o banco só guarda BlockConfig[].
    const blocks = config.layout as unknown as BlockConfig[];

    return { 
      success: true, 
      blocks 
    };

  } catch (error) {
    console.error(`[GUARDIAN_LAYOUT_FAILURE]:`, error);
    return { 
      success: false, 
      message: "Erro interno ao carregar a estrutura Lego.",
      blocks: [] as BlockConfig[]
    };
  }
}