// path: src/app/actions/guardian.ts
"use server";

import fs from "fs";
import path from "path";
import {
  DiagnosticIssue,
  ScreenMetadata,
  ProjectFile,
  CodeSnippet
} from "@/schemas/guardian-schema";

/**
 * Rex Intelligence: Deep Code Extractor (X-Ray Mode)
 * Captura a implementação real de elementos UI sem placeholders.
 */
function extractCodeSnippets(content: string): CodeSnippet[] {
  const snippets: CodeSnippet[] = [];

  // 1. Captura de Botões (Bloco Completo)
  const buttonRegex = /<(button|motion\.button)[\s\S]*?>([\s\S]*?)<\/\1>/g;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const innerText = match[2].replace(/<[^>]*>/g, "").trim().slice(0, 40);
    snippets.push({
      type: "BUTTON",
      content: fullTag.trim(),
      preview: innerText || "Botão de Ação",
    });
  }

  // 2. Captura de Layouts de Proporção (Containers principais com flex/grid)
  const proportionRegex = /<div[^>]*className="[^"]*?(flex flex-col h-full|fixed inset-0|absolute bottom-0)[^"]*?"[\s\S]*?>/g;
  while ((match = proportionRegex.exec(content)) !== null) {
    const fullTag = match[0];
    snippets.push({
      type: "LAYOUT_PROPORTION",
      content: fullTag.trim() + "\n  {...}\n</div>",
      preview: "Estrutura de Proporção de Tela",
    });
  }

  // 3. Captura de Cards Reais (Baseado em classes de design)
  const cardRegex = /<div[^>]*className="[^"]*?(bg-white rounded-2xl p-4 shadow-sm|border border-gray-200)[^"]*?"[\s\S]*?>([\s\S]*?)<\/div>/g;
  while ((match = cardRegex.exec(content)) !== null) {
    const fullTag = match[0];
    // Tenta extrair um título do card se houver um span ou h3 dentro
    const titleMatch = fullTag.match(/<span[^>]*>(.*?)<\/span>/);
    const cardTitle = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : "Container de UI";
    
    snippets.push({
      type: "LAYOUT_CARD",
      content: fullTag.trim(),
      preview: `Card: ${cardTitle}`,
    });
  }

  // 4. Captura de Inputs
  const inputRegex = /<(input|textarea|select)[\s\S]*?\/>/g;
  while ((match = inputRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const placeholder = fullTag.match(/placeholder="([^"]*)"/)?.[1] || "Campo de Entrada";
    snippets.push({
      type: "INPUT",
      content: fullTag.trim(),
      preview: placeholder,
    });
  }

  return snippets.slice(0, 30);
}

export async function runFullProjectAuditAction(
  currentPathname: string = "/",
  focusFile?: string
): Promise<{
  issues: DiagnosticIssue[];
  categorizedFiles: { ui: string[]; logic: string[] };
  screenMetadata: ScreenMetadata;
}> {
  const issues: DiagnosticIssue[] = [];
  const uiFiles: string[] = [];
  const logicFiles: string[] = [];
  const allProjectFiles: ProjectFile[] = [];
  const rootDirectory = process.cwd();

  const scanDirectory = (dir: string) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!["node_modules", ".next", ".git"].includes(entry.name)) scanDirectory(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          const relativePath = path.relative(rootDirectory, fullPath).split(path.sep).join("/");
          const stats = fs.statSync(fullPath);
          allProjectFiles.push({
            path: relativePath,
            name: entry.name,
            type: relativePath.includes("components") ? "COMPONENT" : "PAGE",
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            linesOfCode: 0,
          });
        }
      }
    } catch (e) {}
  };
  scanDirectory(rootDirectory);

  let activeFile = focusFile;
  if (!activeFile) {
    const normalizedPath = currentPathname === "/" ? "/page" : currentPathname;
    activeFile = allProjectFiles.find(f => f.path.includes(`app${normalizedPath}/page.tsx`))?.path || "app/page.tsx";
  }

  const codeMap: Record<string, CodeSnippet[]> = {};
  const uiScope = allProjectFiles.filter(f => f.type === "COMPONENT" || f.path === activeFile);
  
  uiScope.forEach(file => {
    const absPath = path.join(rootDirectory, file.path);
    if (fs.existsSync(absPath)) {
      const content = fs.readFileSync(absPath, "utf8");
      codeMap[file.path] = extractCodeSnippets(content);
    }
  });

  const screenMetadata: ScreenMetadata = {
    pathname: currentPathname,
    responsibleFile: activeFile,
    focusMode: !!focusFile,
    lastModified: new Date().toISOString(),
    elements: { buttons: 0, inputs: 0, logicHooks: 0, serverActions: 0 },
    relatedFiles: { ui: [], logic: [] },
    potentialPopups: [],
    connectivity: { connected: [], disconnected: [] },
    database: { models: [] },
    projectStructure: allProjectFiles,
    codeMap: codeMap
  };

  return { issues, categorizedFiles: { ui: uiFiles, logic: logicFiles }, screenMetadata };
}