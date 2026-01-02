// app/actions/layout-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const FetchLayoutSchema = z.object({
  slug: z.string()
});

export async function getPageLayoutAction(slug: string) {
  // Validação Zod Obrigatória
  FetchLayoutSchema.parse({ slug });

  try {
    const config = await prisma.uIConfig.findUnique({
      where: { pageSlug: slug },
      select: { layout: true }
    });

    if (!config) return { success: false, blocks: [] };

    // No Prisma 6, o cast de Json para Array é mais seguro
    return { 
      success: true, 
      blocks: config.layout as unknown as any[] // O Guardian analisará isso!
    };
  } catch (error) {
    return { success: false, message: "Falha ao carregar layout do banco." };
  }
}