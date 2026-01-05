// path: src/schemas/guardian-runtime-schema.ts
import { z } from "zod";

export const RuntimeElementStateEnum = z.enum([
  "MOUNTED",
  "VISIBLE",
  "HIDDEN",
  "UNMOUNTED"
]);

export const UIMetricsSchema = z.object({
  width: z.number(),
  height: z.number(),
  aspectRatio: z.string(),
  isFlex: z.boolean(),
  flexDirection: z.string(),
  isGrid: z.boolean(),
  computedDisplay: z.string(),
  isResponsiveIssue: z.boolean(),
  elementCount: z.object({
    buttons: z.number(),
    inputs: z.number(),
    images: z.number(),
    textNodes: z.number(),
  }),
  contentMap: z.object({
    buttonLabels: z.array(z.string()),
    headings: z.array(z.string()),
    inputPlaceholders: z.array(z.string()),
  })
});

/**
 * ✅ NOVO: Schema de Inteligência Semântica
 * Permite ao desenvolvedor descrever o comportamento e conexões do componente.
 */
export const GuardianSmartMetadataSchema = z.object({
  label: z.string().optional().describe("Nome amigável para exibição no mapa"),
  description: z.string().optional().describe("O que este componente faz em 1 frase"),
  
  // Conexões Lógicas (Quem chama quem, ou quem depende de quem)
  connectsTo: z.array(z.object({
    target: z.string(), // Ex: "StockRegisterView", "ProductService"
    type: z.enum(["ROUTE", "COMPONENT", "DATABASE", "EXTERNAL", "HOOK"]),
    description: z.string().optional() // Ex: "Atualiza a lista após salvar"
  })).optional(),

  // Orientação para o time
  orientationNotes: z.string().optional().describe("Notas técnicas, alertas de z-index, regras de negócio"),
  
  // Tags para filtragem rápida
  tags: z.array(z.string()).optional() // Ex: ["Critical", "Inventory"]
});

export type GuardianSmartMetadata = z.infer<typeof GuardianSmartMetadataSchema>;

export const RuntimeTrackerSchema = z.object({
  elementId: z.string(),
  componentName: z.string(),
  responsibleFile: z.string(),
  isPopup: z.boolean(),
  zIndex: z.number(),
  state: RuntimeElementStateEnum,
  timestamp: z.string(),
  childComponents: z.array(z.string()),
  metrics: UIMetricsSchema.optional(),
  
  // ✅ Campo Novo: Metadados Semânticos injetados pelo HOC
  semanticMetadata: GuardianSmartMetadataSchema.optional(),
  
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Definição recursiva para ComponentNode (Árvore de Arquivos)
export const ComponentNodeSchema: z.ZodType<ComponentNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    file: z.string().optional(),
    children: z.array(ComponentNodeSchema),
  })
);

export type ComponentNode = {
  name: string;
  file?: string;
  children: ComponentNode[];
};

export type RuntimeElementState = z.infer<typeof RuntimeElementStateEnum>;
export type RuntimeTracker = z.infer<typeof RuntimeTrackerSchema>;
export type UIMetrics = z.infer<typeof UIMetricsSchema>;