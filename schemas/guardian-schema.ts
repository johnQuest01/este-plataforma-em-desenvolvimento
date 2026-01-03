// path: src/schemas/guardian-schema.ts
import { z } from "zod";

/**
 * Camadas de Diagnóstico do Sistema Guardian.
 * Categoriza os problemas encontrados para filtragem na UI.
 */
export const DiagnosticLayerEnum = z.enum([
  "UI_PROPORTION",    // Layout quebra em mobile ou larguras fixas
  "UI_STYLING",       // Inconsistência visual (cores, fontes, formatação)
  "BACKEND_LOGIC",    // Riscos no servidor (falta de try/catch, mutações inseguras)
  "INPUT_VALIDATION", // Falta de Zod ou validação fraca
  "DISCOVERY",        // Novos arquivos detectados recentemente
  "ARCHITECTURE",     // Violação de estrutura de pastas (Lego Architecture)
  "DATABASE",         // Problemas no Schema Prisma ou conexões
  "SECURITY",         // Exposição de segredos ou rotas vulneráveis
  "PERFORMANCE",      // Re-renders excessivos ou bundles grandes
]);

/**
 * Classificação de Arquivos do Projeto (Omniscient Explorer).
 */
export const FileTypeEnum = z.enum([
  "PAGE",       // page.tsx, layout.tsx
  "COMPONENT",  // components/**/*.tsx
  "ACTION",     // actions.ts
  "HOOK",       // use-*.ts
  "SCHEMA",     // schemas/*.ts
  "CONFIG",     // next.config, tailwind.config
  "PRISMA",     // schema.prisma
  "STYLE",      // globals.css
  "TYPE",       // types/*.ts, interfaces/*.ts
  "UTIL",       // lib/*.ts, utils/*.ts
  "ASSET",      // .svg, .png
  "MARKDOWN",   // .md
  "OTHER"
]);

/**
 * Representa um arquivo mapeado pelo sistema.
 */
export const ProjectFileSchema = z.object({
  path: z.string(),
  name: z.string(),
  type: FileTypeEnum,
  size: z.number(), // em bytes
  lastModified: z.string(),
  linesOfCode: z.number(),
});

/**
 * Representa um problema único encontrado pelo scanner.
 */
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

/**
 * Metadados da tela ativa (Context Awareness).
 */
export const ScreenMetadataSchema = z.object({
  pathname: z.string(),
  responsibleFile: z.string(),
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
  database: z.object({
    models: z.array(z.string()),
    connection: z.string().optional(),
  }),
  projectStructure: z.array(ProjectFileSchema).default([]),
});

/**
 * Payload Completo da Server Action.
 */
export const GuardianAuditResponseSchema = z.object({
  issues: z.array(DiagnosticIssueSchema),
  categorizedFiles: z.object({
    ui: z.array(z.string()),
    logic: z.array(z.string()),
  }),
  screenMetadata: ScreenMetadataSchema,
});

// Inferência de Tipos TypeScript
export type DiagnosticIssue = z.infer<typeof DiagnosticIssueSchema>;
export type DiagnosticLayer = z.infer<typeof DiagnosticLayerEnum>;
export type ScreenMetadata = z.infer<typeof ScreenMetadataSchema>;
export type GuardianAuditResponse = z.infer<typeof GuardianAuditResponseSchema>;
export type ProjectFile = z.infer<typeof ProjectFileSchema>;
export type FileType = z.infer<typeof FileTypeEnum>;