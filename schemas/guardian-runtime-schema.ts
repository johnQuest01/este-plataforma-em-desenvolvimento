// path: src/schemas/guardian-runtime-schema.ts
import { z } from "zod";

export const RuntimeElementStateEnum = z.enum(["MOUNTED", "VISIBLE", "HIDDEN", "UNMOUNTED"]);

// Estrutura de um nó da árvore de componentes
export const ComponentNodeSchema: z.ZodType<any> = z.lazy(() => z.object({
  name: z.string(),
  file: z.string().optional(),
  depth: z.number(),
  children: z.array(ComponentNodeSchema).default([]),
}));

export type ComponentNode = z.infer<typeof ComponentNodeSchema>;

export const RuntimeTrackerSchema = z.object({
  elementId: z.string(),
  componentName: z.string(),
  responsibleFile: z.string().optional(),
  isPopup: z.boolean(),
  zIndex: z.number().default(0),
  state: RuntimeElementStateEnum,
  timestamp: z.string(),
  childComponents: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type RuntimeTracker = z.infer<typeof RuntimeTrackerSchema>;
export type RuntimeElementState = z.infer<typeof RuntimeElementStateEnum>;

export const RuntimeSessionSchema = z.object({
  activeElements: z.array(RuntimeTrackerSchema),
  currentPopupId: z.string().nullable(),
});

export type RuntimeSession = z.infer<typeof RuntimeSessionSchema>;