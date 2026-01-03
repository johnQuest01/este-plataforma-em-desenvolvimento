// path: src/app/actions/guardian.ts
"use server";

import fs from "fs";
import path from "path";
import {
  DiagnosticIssue,
  ScreenMetadata,
  ProjectFile,
  FileType
} from "@/schemas/guardian-schema";

// Pastas ignoradas (Mantendo node_modules fora para performance)
const IGNORED_DIRS = new Set([
  "node_modules", ".next", ".git", ".vercel", "dist", "build", "coverage", ".vscode", ".idea"
]);

// Arquivos de sistema estritamente irrelevantes
const IGNORED_FILES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", ".DS_Store", ".eslintrc.json"
]);

export async function runFullProjectAuditAction(currentPathname: string = "/"): Promise<{
  issues: DiagnosticIssue[];
  categorizedFiles: { ui: string[]; logic: string[] };
  screenMetadata: ScreenMetadata;
}> {
  const issues: DiagnosticIssue[] = [];
  const uiFiles: string[] = [];
  const logicFiles: string[] = [];
  const allProjectFiles: ProjectFile[] = [];
  const rootDirectory = process.cwd();

  // --- 1. ROBUST RECURSIVE SCANNER ---
  const scanDirectory = (dir: string) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name)) {
            scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          if (IGNORED_FILES.has(entry.name)) continue;
          
          if (/\.(ts|tsx|js|jsx|mjs|cjs|prisma|css|json|svg|md|env.*)$/.test(entry.name)) {
            
            const relativePathRaw = path.relative(rootDirectory, fullPath);
            const relativePath = relativePathRaw.split(path.sep).join("/");
            const fileName = entry.name;
            const lowerPath = relativePath.toLowerCase();

            // --- CLASSIFICAÇÃO ONISCIENTE ---
            let fileType: FileType = "OTHER";

            if (lowerPath.startsWith("app/") && (fileName.includes("page") || fileName.includes("layout"))) {
              fileType = "PAGE";
            } else if (lowerPath.includes("/components/") || lowerPath.startsWith("components/")) {
              fileType = "COMPONENT";
            } else if (lowerPath.includes("/actions/") || lowerPath.startsWith("actions/")) {
              fileType = "ACTION";
            } else if (lowerPath.includes("/hooks/") || lowerPath.startsWith("hooks/") || fileName.startsWith("use-")) {
              fileType = "HOOK";
            } else if (lowerPath.includes("/schemas/") || lowerPath.startsWith("schemas/")) {
              fileType = "SCHEMA";
            } else if (lowerPath.includes("/types/") || lowerPath.startsWith("types/") || lowerPath.includes("/interfaces/") || fileName.endsWith(".d.ts")) {
              fileType = "TYPE";
            } else if (lowerPath.includes("/lib/") || lowerPath.startsWith("lib/") || lowerPath.includes("/utils/")) {
              fileType = "UTIL";
            } else if (fileName.includes("prisma")) {
              fileType = "PRISMA";
            } else if (fileName.endsWith(".css")) {
              fileType = "STYLE";
            } else if (fileName.endsWith(".svg") || fileName.endsWith(".png") || fileName.endsWith(".jpg")) {
              fileType = "ASSET";
            } else if (fileName.endsWith(".md")) {
              fileType = "MARKDOWN";
            } else if (fileName.includes("config") || fileName.includes(".env") || fileName.startsWith(".")) {
              fileType = "CONFIG";
            }

            const stats = fs.statSync(fullPath);

            allProjectFiles.push({
              path: relativePath,
              name: fileName,
              type: fileType,
              size: stats.size,
              lastModified: stats.mtime.toISOString(),
              linesOfCode: 0, 
            });

            if (["COMPONENT", "PAGE"].includes(fileType)) uiFiles.push(relativePath);
            if (["ACTION", "HOOK", "PRISMA", "UTIL", "SCHEMA"].includes(fileType)) logicFiles.push(relativePath);
          }
        }
      }
    } catch (error) {
      console.error(`Guardian Scan Error:`, error);
    }
  };

  scanDirectory(rootDirectory);

  // --- 2. PRISMA INTROSPECTOR ---
  const prismaPath = path.join(rootDirectory, "prisma", "schema.prisma");
  const dbModels: string[] = [];
  let dbProvider = "unknown";

  if (fs.existsSync(prismaPath)) {
    const prismaContent = fs.readFileSync(prismaPath, "utf8");
    const modelMatches = prismaContent.match(/model\s+(\w+)\s+{/g);
    if (modelMatches) modelMatches.forEach(m => dbModels.push(m.split(" ")[1]));
    const providerMatch = prismaContent.match(/provider\s+=\s+"([^"]+)"/);
    if (providerMatch) dbProvider = providerMatch[1];
  }

  // --- 3. CONTEXT AWARENESS (Active Screen) ---
  const normalizedPath = currentPathname === "/" ? "/page" : currentPathname;
  
  const activePageFileObj = allProjectFiles.find(f => {
    return f.path.includes(`app${normalizedPath}/page.tsx`) || f.path.includes(`app${normalizedPath}/layout.tsx`);
  });
  
  const activePagePath = activePageFileObj ? activePageFileObj.path : "app/page.tsx";
  const absoluteActivePath = path.join(rootDirectory, activePagePath);
  
  let activeContent = "";
  if (fs.existsSync(absoluteActivePath)) {
    activeContent = fs.readFileSync(absoluteActivePath, "utf8");
  }

  // Filtros
  const routeKeywords = currentPathname.split('/').filter(p => p.length > 2);
  const relatedUI = uiFiles.filter(f => routeKeywords.some(k => f.toLowerCase().includes(k)));
  const relatedLogic = logicFiles.filter(f => routeKeywords.some(k => f.toLowerCase().includes(k)));

  // Elementos
  const buttonMatches = activeContent.match(/<button|<StandardButton|<ActionButtonsBlock/g);
  const inputMatches = activeContent.match(/<input|<textarea|<AuthInputField|<DynamicInput/g);
  const logicMatches = activeContent.match(/useEffect\(|useCallback\(|useState\(/g);
  const serverActionMatches = activeContent.match(/Action\(/g);

  // --- 4. DIAGNÓSTICO DE PROPORÇÃO E LAYOUT (INTELIGÊNCIA) ---
  
  // [RULE 1] Largura Fixa Perigosa (ex: w-[500px]) sem breakpoint
  // Detecta w-[...px] que não seja precedido por md:, lg:, xl:
  const fixedWidthRegex = /(?<!(md|lg|xl|2xl):)w-\[\d{3,}px\]/g;
  if (fixedWidthRegex.test(activeContent)) {
      issues.push({
        id: `prop-fixed-width-${Date.now()}`,
        layer: "UI_PROPORTION",
        file: activePagePath,
        message: "Largura fixa rígida detectada (Risco Mobile).",
        severity: "HIGH",
        suggestion: "Use 'w-full max-w-md' ou adicione prefixos responsivos (md:w-[...]).",
        timestamp: new Date().toISOString(),
      });
  }

  // [RULE 2] Popups/Modais sem Scroll (Risco de corte em telas pequenas)
  // Se tem 'fixed' e 'z-50' (provável modal) mas não tem 'overflow-y-auto' ou 'max-h'
  if (activeContent.includes("fixed") && activeContent.includes("z-50")) {
      if (!activeContent.includes("overflow-y-auto") && !activeContent.includes("max-h-")) {
        issues.push({
            id: `prop-modal-overflow-${Date.now()}`,
            layer: "UI_PROPORTION",
            file: activePagePath,
            message: "Popup/Modal sem controle de rolagem.",
            severity: "CRITICAL",
            suggestion: "Adicione 'max-h-[85vh]' e 'overflow-y-auto' para evitar que o conteúdo seja cortado em celulares.",
            timestamp: new Date().toISOString(),
        });
      }
  }

  // [RULE 3] Inputs Fixos no Rodapé (Risco Teclado Virtual)
  // Se tem input dentro de um container fixed bottom-0
  if (activeContent.includes("fixed") && activeContent.includes("bottom-0") && (activeContent.includes("<input") || activeContent.includes("Input"))) {
      issues.push({
        id: `prop-keyboard-risk-${Date.now()}`,
        layer: "UI_PROPORTION",
        file: activePagePath,
        message: "Input fixo no rodapé (Conflito com Teclado).",
        severity: "MEDIUM",
        suggestion: "O teclado virtual pode cobrir este input. Use 'pb-safe' ou verifique o comportamento do viewport.",
        timestamp: new Date().toISOString(),
      });
  }

  const screenMetadata: ScreenMetadata = {
    pathname: currentPathname,
    responsibleFile: activePagePath,
    lastModified: new Date().toISOString(),
    elements: {
      buttons: buttonMatches ? buttonMatches.length : 0,
      inputs: inputMatches ? inputMatches.length : 0,
      logicHooks: logicMatches ? logicMatches.length : 0,
      serverActions: serverActionMatches ? serverActionMatches.length : 0,
    },
    relatedFiles: { ui: relatedUI, logic: relatedLogic },
    database: { models: dbModels, connection: dbProvider },
    projectStructure: allProjectFiles
  };

  return { issues, categorizedFiles: { ui: uiFiles, logic: logicFiles }, screenMetadata };
}