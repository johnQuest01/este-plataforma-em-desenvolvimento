// types/footer-blocks.ts
import { z } from 'zod';

/**
 * Schema Zod para validação de ícones do footer
 */
export const IconNameSchema = z.enum([
    'cart',
    'heart',
    'sync',
    'verified',
    'package-check',
    'inventory',
    'box',
    'check',
    'help-circle'
]);

/**
 * Schema Zod para validação de botão do LiquidDynamicFooter
 */
export const LiquidFooterButtonSchema = z.object({
    id: z.string().min(1, "ID do botão é obrigatório"),
    label: z.string().min(1, "Label do botão é obrigatório"),
    icon: IconNameSchema,
    route: z.string().optional().describe("Rota de navegação (ex: '/pos', '/cart')"),
    actionId: z.string().optional().describe("ID da ação customizada"),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve estar no formato hexadecimal (#RRGGBB)").optional(),
});

/**
 * Schema Zod para validação dos dados do LiquidDynamicFooter
 */
export const LiquidDynamicFooterDataSchema = z.object({
    buttons: z.array(LiquidFooterButtonSchema).min(1, "Pelo menos um botão é obrigatório"),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor de fundo deve estar no formato hexadecimal").optional(),
    repulsionRadius: z.number().min(50).max(200).default(84).describe("Raio de repulsão (buttonSize * 1.5)"),
    repulsionStrength: z.number().min(0.01).max(1.0).default(0.15).describe("Força de repulsão"),
    attractionStrength: z.number().min(0.001).max(0.1).default(0.02).describe("Força de atração"),
    dampingFactor: z.number().min(0.8).max(0.99).default(0.92).describe("Fator de amortecimento"),
    centerScale: z.number().min(1.0).max(3.0).default(1.8).describe("Escala no centro"),
    edgeScale: z.number().min(0.3).max(1.0).default(0.6).describe("Escala nas bordas"),
    centerOpacity: z.number().min(0.5).max(1.0).default(1.0).describe("Opacidade no centro"),
    edgeOpacity: z.number().min(0.1).max(0.8).default(0.5).describe("Opacidade nas bordas"),
});

/**
 * Types TypeScript derivados dos Schemas Zod
 */
export type IconName = z.infer<typeof IconNameSchema>;
export type LiquidFooterButton = z.infer<typeof LiquidFooterButtonSchema>;
export type LiquidDynamicFooterData = z.infer<typeof LiquidDynamicFooterDataSchema>;
