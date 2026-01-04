// @/schemas/blocks/button-schema.ts
import { z } from "zod";

/**
 * Enumeração local de ações possíveis para um botão.
 * Substitui a dependência externa removida para manter o módulo autocontido.
 */
export const ButtonActionTypeEnum = z.enum([
  "NAVIGATION_PUSH",   // Redirecionar (Link)
  "FORM_SUBMIT",       // Submeter formulário nativo
  "MODAL_OPEN",        // Abrir um popup/modal via ID
  "SERVER_ACTION",     // Disparar uma Server Action customizada
  "NONE"               // Apenas visual ou controlado via onClick manual
]);

export type ButtonActionType = z.infer<typeof ButtonActionTypeEnum>;

/**
 * Contrato de dados para o componente StandardButton.
 * Atualizado para suportar ícones, estados de carregamento e ações autocontidas (Lego Architecture 2026).
 */
export const StandardButtonDataSchema = z.object({
  // --- Conteúdo ---
  label: z.string().min(1, "Texto do botão é obrigatório"),
  icon: z.string().optional().describe("Nome do ícone Lucide (ex: 'ShoppingCart', 'ArrowRight')"),
  
  // --- Estilo Visual ---
  variant: z.enum(["primary", "secondary", "outline", "ghost", "danger", "link"]).default("primary"),
  size: z.enum(["sm", "md", "lg", "icon"]).default("md"),
  fullWidthMobile: z.boolean().default(true),
  className: z.string().optional().describe("Classes utilitárias para ajustes finos de layout (margens)"),

  // --- Comportamento ---
  /**
   * Define o que o botão faz ao ser clicado.
   * Agora utiliza a definição local ButtonActionTypeEnum.
   */
  actionType: ButtonActionTypeEnum.default("NONE"),
  
  /**
   * Alvo da ação.
   * - Se NAVIGATION_PUSH: URL de destino.
   * - Se MODAL_OPEN: ID do Modal.
   * - Se SERVER_ACTION: Nome da Action.
   */
  actionTarget: z.string().optional(),

  disabled: z.boolean().default(false),
  loading: z.boolean().default(false).describe("Se true, exibe spinner e bloqueia cliques"),

  /**
   * Payload Tipado para Server Actions ou Contexto.
   * O Zod valida a estrutura do JSON que será enviado ao servidor ou evento.
   */
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type StandardButtonData = z.infer<typeof StandardButtonDataSchema>;