// path: src/schemas/guardian-runtime-schema.ts
import { z } from "zod";

export const RuntimeElementStateEnum = z.enum(["MOUNTED", "VISIBLE", "HIDDEN", "UNMOUNTED"]);

export const RuntimeTrackerSchema = z.object({
  elementId: z.string(),
  componentName: z.string(),
  // ✅ NEW: Stores the physical file path responsible for this element
  responsibleFile: z.string().optional(), 
  isPopup: z.boolean(),
  zIndex: z.number().default(0),
  state: RuntimeElementStateEnum,
  timestamp: z.string(),
  // ✅ CORREÇÃO: Definição explícita de chave (string) e valor (unknown)
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type RuntimeTracker = z.infer<typeof RuntimeTrackerSchema>;
export type RuntimeElementState = z.infer<typeof RuntimeElementStateEnum>;

export const RuntimeSessionSchema = z.object({
  activeElements: z.array(RuntimeTrackerSchema),
  currentPopupId: z.string().nullable(),
});

export type RuntimeSession = z.infer<typeof RuntimeSessionSchema>;