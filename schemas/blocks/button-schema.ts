// @/schemas/blocks/button-schema.ts
import { z } from "zod";
import { GlobalActionTypeEnum } from "@/schemas/actions-schema";

/**
 * Contrato de dados para o componente StandardButton.
 * Payload utiliza record explícito para compatibilidade com tipagem estrita 2026.
 */
export const StandardButtonDataSchema = z.object({
  label: z.string().min(1, "Texto obrigatório"),
  
  variant: z.enum(["primary", "secondary", "outline", "danger"]).default("primary"),
  
  size: z.enum(["sm", "md", "lg"]).default("md"),
  
  actionType: GlobalActionTypeEnum,
  
  /**
   * ✅ CORREÇÃO: Adicionado z.string() como primeiro argumento.
   * O Zod agora entende: Chave = string, Valor = unknown.
   */
  payload: z.record(z.string(), z.unknown()).optional(),
  
  fullWidthMobile: z.boolean().default(true),
});

export type StandardButtonData = z.infer<typeof StandardButtonDataSchema>;