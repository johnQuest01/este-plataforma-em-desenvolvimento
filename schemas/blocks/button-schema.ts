// @/schemas/blocks/button-schema.ts
import { z } from "zod";
import { GlobalActionTypeEnum } from "@/schemas/actions-schema";

/**
 * Contrato de dados para o componente StandardButton.
 * Atualizado para suportar ícones e estados de carregamento (Lego Architecture 2026).
 */
export const StandardButtonDataSchema = z.object({
  // Conteúdo
  label: z.string().min(1, "Texto do botão é obrigatório"),
  icon: z.string().optional().describe("Nome do ícone Lucide (ex: 'ShoppingCart', 'ArrowRight')"),
  
  // Estilo Visual
  variant: z.enum(["primary", "secondary", "outline", "ghost", "danger", "link"]).default("primary"),
  size: z.enum(["sm", "md", "lg", "icon"]).default("md"),
  fullWidthMobile: z.boolean().default(true),
  className: z.string().optional().describe("Classes utilitárias para ajustes finos de layout (margens)"),

  // Comportamento
  /**
   * ✅ CORREÇÃO: Usamos z.union para permitir que o botão não tenha ação ("NONE").
   * O GlobalActionTypeEnum original não contém "NONE", então precisamos adicioná-lo explicitamente aqui.
   */
  actionType: z.union([GlobalActionTypeEnum, z.literal("NONE")]).default("NONE"),
  
  disabled: z.boolean().default(false),
  loading: z.boolean().default(false).describe("Se true, exibe spinner e bloqueia cliques"),

  /**
   * Payload Tipado para Server Actions.
   * O Zod valida a estrutura do JSON que será enviado ao servidor.
   */
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type StandardButtonData = z.infer<typeof StandardButtonDataSchema>;