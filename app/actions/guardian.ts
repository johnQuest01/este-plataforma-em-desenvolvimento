// path: src/app/actions/guardian.ts
"use server";

import fs from "fs";
import path from "path";
import { 
  DiagnosticIssue, 
  ScreenMetadata, 
  ProjectFile, 
  CodeSnippet,
  FileTypeEnum,
  FileType,
  DependencyLink
} from "@/schemas/guardian-schema";

/**
 * Rex Intelligence: Deep Code Extractor (X-Ray Mode)
 * Captura a implementação real de elementos UI sem placeholders.
 */
function extractCodeSnippets(content: string): CodeSnippet[] {
  const snippets: CodeSnippet[] = [];

  // 1. Captura de Botões
  const buttonRegex = /<([a-zA-Z0-9\.]*Button|button|motion\.button)[\s\S]*?>([\s\S]*?)<\/\1>|<([a-zA-Z0-9\.]*Button|button|motion\.button)[\s\S]*?\/>/g;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const innerTextMatch = match[2] ? match[2].replace(/<[^>]*>/g, "").trim() : "";
    const labelPropMatch = fullTag.match(/label="([^"]*)"/);
    const previewText = innerTextMatch || labelPropMatch?.[1] || "Botão Interativo";
    
    snippets.push({
      type: "BUTTON",
      content: fullTag.trim(),
      preview: previewText.slice(0, 40),
    });
  }

  // 2. Layouts
  const proportionRegex = /<div[^>]*className="[^"]*?(flex flex-col h-full|fixed inset-0|absolute bottom-0|absolute top-0|grid)[^"]*?"[\s\S]*?>/g;
  while ((match = proportionRegex.exec(content)) !== null) {
    snippets.push({
      type: "LAYOUT_PROPORTION",
      content: match[0].trim(),
      preview: "Estrutura de Layout",
    });
  }

  // 3. Cards
  const cardRegex = /<div[^>]*className="[^"]*?(bg-white|rounded-|border|shadow)[^"]*?"[\s\S]*?>/g;
  while ((match = cardRegex.exec(content)) !== null) {
    snippets.push({
      type: "LAYOUT_CARD",
      content: match[0].trim(),
      preview: "Container Visual",
    });
  }

  // 4. Inputs
  const inputRegex = /<(input|textarea|select|[A-Z]\w*Input)[\s\S]*?(\/>|<\/\1>)/g;
  while ((match = inputRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const placeholderMatch = fullTag.match(/placeholder="([^"]*)"/);
    const nameMatch = fullTag.match(/name="([^"]*)"/);
    const typeMatch = fullTag.match(/type="([^"]*)"/);
    
    let preview = "Campo de Entrada";
    if (placeholderMatch) preview = placeholderMatch[1];
    else if (nameMatch) preview = nameMatch[1];
    else if (typeMatch) preview = `Input (${typeMatch[1]})`;

    snippets.push({
      type: "INPUT",
      content: fullTag.trim(),
      preview: preview,
    });
  }

  // 5. Textos
  const textRegex = /<(h[1-6]|p|span)[^>]*className="[^"]*?"[\s\S]*?>([\s\S]*?)<\/\1>/g;
  while ((match = textRegex.exec(content)) !== null) {
    const textContent = match[2].replace(/<[^>]*>/g, "").trim();
    if (textContent.length > 0 && !textContent.includes("{")) {
        snippets.push({
            type: "TEXT",
            content: match[0].trim(),
            preview: textContent.slice(0, 30),
        });
    }
  }

  // 6. Popups
  const popupRegex = /<(div|motion\.div)[^>]*className="[^"]*?(fixed inset-0|z-\[.*?\]|z-50)[^"]*?"[\s\S]*?>/g;
  while ((match = popupRegex.exec(content)) !== null) {
    snippets.push({
      type: "POPUP_STRUCTURE",
      content: match[0].trim(),
      preview: "Overlay/Modal Root",
    });
  }

  return snippets.slice(0, 50);
}

/**
 * Classificador Inteligente de Arquivos
 */
function determineFileType(filename: string, relativePath: string): FileType {
  const lowerName = filename.toLowerCase();
  const lowerPath = relativePath.toLowerCase();

  if (lowerName.endsWith('.md') || lowerName.endsWith('.txt')) return "MARKDOWN";
  if (lowerName.endsWith('.css') || lowerName.endsWith('.scss') || lowerName.endsWith('.sass') || lowerName.endsWith('.less')) return "STYLE";
  if (lowerName.endsWith('.json') || lowerName.endsWith('.config.js') || lowerName.endsWith('.config.ts') || lowerName.startsWith('.env') || lowerName.endsWith('.yml') || lowerName.endsWith('.yaml') || lowerName.endsWith('.xml')) return "CONFIG";
  if (lowerName.includes('schema') || lowerName.includes('zod')) return "SCHEMA";
  if (lowerName.includes('action') || lowerPath.includes('actions')) return "ACTION";
  if (lowerName.startsWith('use') || lowerPath.includes('hooks')) return "HOOK";
  if (lowerName.includes('type') || lowerName.endsWith('.d.ts')) return "TYPE";
  if (lowerName.includes('prisma') || lowerPath.includes('prisma')) return "PRISMA";
  if (lowerName.includes('util') || lowerPath.includes('lib') || lowerPath.includes('utils')) return "UTIL";
  if (lowerName.includes('page') || lowerName.includes('layout')) return "PAGE";
  if (lowerPath.includes('components')) return "COMPONENT";
  if (lowerName.match(/\.(png|jpg|jpeg|svg|ico|gif|webp|avif|mp4|webm)$/)) return "ASSET";

  return "OTHER";
}

/**
 * ✅ NOVO: Analisador de Dependências (Imports)
 * Lê o conteúdo do arquivo e descobre o que ele importa.
 */
function extractDependencies(filePath: string, content: string, rootDir: string): string[] {
  const dependencies: string[] = [];
  // Regex para capturar imports: import ... from "..."
  const importRegex = /import\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Ignora bibliotecas externas (node_modules) que não começam com . ou @/
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }

    let resolvedPath = importPath;

    // Resolve Alias @/ para src/
    if (importPath.startsWith('@/')) {
      resolvedPath = importPath.replace('@/', 'src/');
    } else {
      // Resolve caminhos relativos
      const currentDir = path.dirname(filePath);
      resolvedPath = path.join(currentDir, importPath);
      // Normaliza para remover ../ e ./
      resolvedPath = path.relative(rootDir, path.resolve(rootDir, resolvedPath));
    }

    // Normaliza separadores de path para /
    resolvedPath = resolvedPath.split(path.sep).join('/');

    // Tenta adicionar extensões comuns se não houver
    if (!resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.tsx') && !resolvedPath.endsWith('.js')) {
       // Apenas uma heurística simples para exibição
       if (fs.existsSync(path.join(rootDir, resolvedPath + '.tsx'))) resolvedPath += '.tsx';
       else if (fs.existsSync(path.join(rootDir, resolvedPath + '.ts'))) resolvedPath += '.ts';
    }

    dependencies.push(resolvedPath);
  }

  return dependencies;
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

  // Scanner Recursivo
  const scanDirectory = (dir: string) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!["node_modules", ".next", ".git", ".vscode", "public", "build", "dist", "coverage"].includes(entry.name)) {
            scanDirectory(fullPath);
          }
        } 
        else if (entry.isFile()) {
          if (entry.name === '.DS_Store' || entry.name === 'Thumbs.db') continue;

          const relativePath = path.relative(rootDirectory, fullPath).split(path.sep).join("/");
          const stats = fs.statSync(fullPath);
          const fileType = determineFileType(entry.name, relativePath);

          allProjectFiles.push({
            path: relativePath,
            name: entry.name,
            type: fileType,
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
            linesOfCode: 0,
          });
        }
      }
    } catch (e) {
      console.error(`Erro ao escanear diretório ${dir}:`, e);
    }
  };
  
  scanDirectory(rootDirectory);

  // Lógica de Foco
  let activeFile = focusFile;
  if (!activeFile) {
    const normalizedPath = currentPathname === "/" ? "/page" : currentPathname;
    activeFile = allProjectFiles.find(f => f.path.includes(`app${normalizedPath}/page.tsx`))?.path;
    if (!activeFile) activeFile = "app/page.tsx";
  }

  const codeMap: Record<string, CodeSnippet[]> = {};
  const dependencyLinks: DependencyLink[] = [];
  const connectedFilesSet = new Set<string>();
  
  // Escopo de Análise Profunda
  const uiScope = allProjectFiles.filter(f => 
    (f.path === activeFile || 
    (focusFile && f.path === focusFile) || 
    (f.type === "COMPONENT" && f.path.endsWith('.tsx'))) &&
    !f.type.match(/ASSET|OTHER/)
  );
  
  uiScope.forEach(file => {
    const absPath = path.join(rootDirectory, file.path);
    if (fs.existsSync(absPath)) {
      try {
        const content = fs.readFileSync(absPath, "utf8");
        
        // 1. Extrair Snippets Visuais
        const snippets = extractCodeSnippets(content);
        if (snippets.length > 0) {
          codeMap[file.path] = snippets;
        }

        // 2. ✅ Extrair Dependências (Conexões)
        const imports = extractDependencies(file.path, content, rootDirectory);
        imports.forEach(importedPath => {
            dependencyLinks.push({
                source: file.path,
                target: importedPath,
                type: "IMPORT"
            });
            connectedFilesSet.add(file.path);
            connectedFilesSet.add(importedPath);
        });

      } catch (err) {
        console.warn(`Não foi possível ler o conteúdo de ${file.path}`, err);
      }
    }
  });

  // ✅ POPULAR LISTAS DE ARQUIVOS RELACIONADOS (UI vs LOGIC)
  // Baseado nas dependências encontradas para o arquivo ativo
  const activeFileDependencies = dependencyLinks
    .filter(link => link.source === activeFile)
    .map(link => link.target);

  activeFileDependencies.forEach(depPath => {
      const fileType = determineFileType(path.basename(depPath), depPath);
      if (fileType === "COMPONENT" || fileType === "PAGE") {
          uiFiles.push(depPath);
      } else {
          logicFiles.push(depPath);
      }
  });

  const screenMetadata: ScreenMetadata = {
    pathname: currentPathname,
    responsibleFile: activeFile || "Unknown",
    focusMode: !!focusFile,
    lastModified: new Date().toISOString(),
    elements: { buttons: 0, inputs: 0, logicHooks: 0, serverActions: 0 },
    relatedFiles: { ui: uiFiles, logic: logicFiles },
    potentialPopups: [],
    // ✅ Preenchemos as dependências reais
    dependencies: dependencyLinks,
    connectivity: {
        connected: Array.from(connectedFilesSet),
        disconnected: [] // Simplificado para este exemplo
    },
    database: { models: [] },
    projectStructure: allProjectFiles,
    codeMap: codeMap
  };

  return { issues, categorizedFiles: { ui: uiFiles, logic: logicFiles }, screenMetadata };
}