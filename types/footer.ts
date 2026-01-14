// types/footer.ts
import { z } from 'zod';

/**
 * Schema Zod para validação de botões do InfiniteCircularFooter
 * Seguindo Zero-Any Policy e Tipagem Estrita
 */
export const CircularFooterButtonSchema = z.object({
  id: z.string().min(1, "ID do botão é obrigatório"),
  label: z.string().min(1, "Label do botão é obrigatório"),
  icon: z.string().min(1, "Nome do ícone é obrigatório"),
  route: z.string().optional().describe("Rota de navegação (ex: '/pos', '/cart')"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato hexadecimal (#RRGGBB)").optional(),
  isVisible: z.boolean().default(true),
  isHighlight: z.boolean().default(false)
});

export const InfiniteCircularFooterDataSchema = z.object({
  buttons: z.array(CircularFooterButtonSchema).min(1, "Pelo menos um botão é obrigatório"),
  enableLongPressNavigation: z.boolean().default(true),
  longPressThreshold: z.number().min(100).max(300).default(150).describe("Threshold em pixels para navegação via long press"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor de fundo deve estar no formato hexadecimal").optional(),
  centerScale: z.number().min(1).max(2).default(1.3).describe("Scale dos botões no centro"),
  edgeScale: z.number().min(0.3).max(1).default(0.7).describe("Scale dos botões nas extremidades"),
  centerOpacity: z.number().min(0).max(1).default(1).describe("Opacidade dos botões no centro"),
  edgeOpacity: z.number().min(0).max(1).default(0.4).describe("Opacidade dos botões nas extremidades")
});

/**
 * Types TypeScript derivados dos Schemas Zod
 */
export type CircularFooterButton = z.infer<typeof CircularFooterButtonSchema>;
export type InfiniteCircularFooterData = z.infer<typeof InfiniteCircularFooterDataSchema>;
