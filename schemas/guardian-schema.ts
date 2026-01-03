import { z } from "zod";

// Enumeração das camadas de arquitetura
export const DiagnosticLayerEnum = z.enum([
  "UI_STYLING",
  "BACKEND_LOGIC",
  "STRICT_TYPING",
  "ASSETS",
  "SCHEMA",
  "ARCHITECTURE",
  "NAMING_CONVENTION",
]);

export const DiagnosticIssueSchema = z.object({
  id: z.string(),
  layer: DiagnosticLayerEnum,
  file: z.string(),
  message: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  suggestion: z.string(),
  timestamp: z.string(),
});

export type DiagnosticIssue = z.infer<typeof DiagnosticIssueSchema>;
export type DiagnosticLayer = z.infer<typeof DiagnosticLayerEnum>;

// Schema para o Editor Visual (Mapa)
export const UIComponentConfigSchema = z.object({
  buttonStyle: z.enum(["rounded", "sharp", "pill"]),
  cardElevation: z.enum(["flat", "raised", "floating"]),
  primaryColor: z.string(),
  fontSize: z.enum(["compact", "standard", "comfortable"]),
});

export type UIComponentConfig = z.infer<typeof UIComponentConfigSchema>;