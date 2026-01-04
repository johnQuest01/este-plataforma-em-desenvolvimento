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
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type RuntimeElementState = z.infer<typeof RuntimeElementStateEnum>;
export type RuntimeTracker = z.infer<typeof RuntimeTrackerSchema>;
export type UIMetrics = z.infer<typeof UIMetricsSchema>;