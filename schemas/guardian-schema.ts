// path: src/schemas/guardian-schema.ts
import { z } from "zod";


export const DiagnosticLayerEnum = z.enum([
  "UI_PROPORTION",
  "UI_STYLING",
  "BACKEND_LOGIC",
  "INPUT_VALIDATION",
  "DISCOVERY",
  "ARCHITECTURE",
  "DATABASE",
  "SECURITY",
  "PERFORMANCE",
]);


export const FileTypeEnum = z.enum([
  "PAGE", "COMPONENT", "ACTION", "HOOK", "SCHEMA", "CONFIG",
  "PRISMA", "STYLE", "TYPE", "UTIL", "ASSET", "MARKDOWN", "OTHER"
]);


export const ProjectFileSchema = z.object({
  path: z.string(),
  name: z.string(),
  type: FileTypeEnum,
  size: z.number(),
  lastModified: z.string(),
  linesOfCode: z.number(),
});


export const DiagnosticIssueSchema = z.object({
  id: z.string(),
  layer: DiagnosticLayerEnum,
  file: z.string(),
  message: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  suggestion: z.string(),
  timestamp: z.string(),
  snippet: z.string().optional(),
});


export const ScreenMetadataSchema = z.object({
  pathname: z.string(),
  responsibleFile: z.string(),
  focusMode: z.boolean(),
  lastModified: z.string(),
  elements: z.object({
    buttons: z.number(),
    inputs: z.number(),
    logicHooks: z.number(),
    serverActions: z.number(),
  }),
  relatedFiles: z.object({
    ui: z.array(z.string()),
    logic: z.array(z.string()),
  }),
  potentialPopups: z.array(z.string()),
  // ✅ NOVO: Inteligência de Conectividade (Rex)
  connectivity: z.object({
    connected: z.array(z.string()),    // Arquivos com vínculo comprovado ao Backend
    disconnected: z.array(z.string()), // Arquivos puramente visuais (Risco se precisarem de dados)
  }),
  database: z.object({
    models: z.array(z.string()),
    connection: z.string().optional(),
  }),
  projectStructure: z.array(ProjectFileSchema).default([]),
});


export const GuardianAuditResponseSchema = z.object({
  issues: z.array(DiagnosticIssueSchema),
  categorizedFiles: z.object({
    ui: z.array(z.string()),
    logic: z.array(z.string()),
  }),
  screenMetadata: ScreenMetadataSchema,
});


export type DiagnosticIssue = z.infer<typeof DiagnosticIssueSchema>;
export type DiagnosticLayer = z.infer<typeof DiagnosticLayerEnum>;
export type ScreenMetadata = z.infer<typeof ScreenMetadataSchema>;
export type GuardianAuditResponse = z.infer<typeof GuardianAuditResponseSchema>;
export type ProjectFile = z.infer<typeof ProjectFileSchema>;
export type FileType = z.infer<typeof FileTypeEnum>;

