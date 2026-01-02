// schemas/guardian-schema.ts
import { z } from "zod";

export const DiagnosticIssueSchema = z.object({
  id: z.string(),
  layer: z.enum(["UI_STYLING", "BACKEND_LOGIC", "STRICT_TYPING", "ASSETS", "SCHEMA"]),
  file: z.string(),
  message: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  suggestion: z.string(),
  // O "GPS" do desenvolvedor:
  mapGuide: z.object({
    action: z.string(), // ex: "Alterar texto do botão"
    targetFile: z.string(),
    instruction: z.string()
  }).optional(),
  timestamp: z.string(),
});

export type DiagnosticIssue = z.infer<typeof DiagnosticIssueSchema>;