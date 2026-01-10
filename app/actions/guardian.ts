// path: src/app/actions/guardian.ts
"use server";

import fs from "fs";
import path from "path";
import {
  DiagnosticIssue,
  ScreenMetadata,
  ProjectFile,
  CodeSnippet,
  FileType,
  DependencyLink,
  AutoDoc
} from "@/schemas/guardian-schema";

/**
 * Rex Intelligence: Deep Code Extractor (X-Ray Mode - Enhanced)
 * Captura TUDO: Componentes, Textos, Blocos, Divs e Botões.
 */
function extractCodeSnippets(content: string): CodeSnippet[] {
  const snippets: CodeSnippet[] = [];

  // --- 1. COMPONENTES CUSTOMIZADOS (Lego Blocks) ---
  // Captura <JeansHeader />, <JeansResultCard ...>
  // Regex: Começa com Letra Maiúscula
  const componentRegex = /<([A-Z][a-zA-Z0-9\.]+)[\s\S]*?(\/>|>\s*<\/\1>)/g;
  let match;
  while ((match = componentRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const componentName = match[1];
    
    // Ignora componentes do próprio sistema para não poluir
    if (!["GuardianBeacon", "motion", "AnimatePresence", "React", "div", "span"].includes(componentName)) {
        snippets.push({
            type: "LAYOUT_CARD", // Mapeia como um Card Visual
            content: fullTag.trim(),
            preview: `Componente: <${componentName} />`,
        });
    }
  }

  // --- 2. BOTÕES E INTERAÇÃO ---
  // Captura button, motion.button, a, Link
  const buttonRegex = /<([a-zA-Z0-9\.]*([Bb]utton|[Ll]ink))[\s\S]*?>([\s\S]*?)<\/\1>|<([a-zA-Z0-9\.]*([Bb]utton|[Ll]ink))[\s\S]*?\/>/g;
  while ((match = buttonRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const innerText = match[3] ? match[3].replace(/<[^>]*>/g, "").trim() : "";
    const labelProp = fullTag.match(/label="([^"]*)"/)?.[1];
    
    snippets.push({
      type: "BUTTON",
      content: fullTag.trim(),
      preview: (innerText || labelProp || "Interação").slice(0, 40),
    });
  }

  // --- 3. INPUTS E FORMULÁRIOS ---
  const inputRegex = /<(input|textarea|select|[A-Z]\w*Input)[\s\S]*?(\/>|<\/\1>)/g;
  while ((match = inputRegex.exec(content)) !== null) {
    const fullTag = match[0];
    const placeholder = fullTag.match(/placeholder="([^"]*)"/)?.[1];
    
    snippets.push({
      type: "INPUT",
      content: fullTag.trim(),
      preview: placeholder || "Campo de Entrada",
    });
  }

  // --- 4. TEXTOS E CONTEÚDO (AGORA LÊ TUDO) ---
  // Captura qualquer tag que contenha texto direto, sem ser apenas espaço em branco.
  // Ex: <div>Texto</div>, <span>Valor</span>, <p>Desc</p>
  const textRegex = /<([a-zA-Z0-9\.]+)[^>]*?>([^<>{}\r\n]+?)<\/\1>/g;
  while ((match = textRegex.exec(content)) !== null) {
    const tagName = match[1];
    const textContent = match[2].trim();

    // Filtra ruídos
    if (textContent.length > 1 && !tagName.includes("script") && !tagName.includes("style")) {
        snippets.push({
            type: "TEXT",
            content: match[0].trim(),
            preview: textContent.slice(0, 40),
        });
    }
  }

  // --- 5. ESTRUTURAS DE LAYOUT (DIVS IMPORTANTES) ---
  // Captura divs que definem grid, flex ou posicionamento
  const layoutRegex = /<([a-zA-Z0-9\.]+)[\s\S]*?className="([^"]*?(grid|flex|fixed|absolute|relative|w-full)[^"]*?)"[\s\S]*?>/g;
  while ((match = layoutRegex.exec(content)) !== null) {
    const className = match[2];
    
    // Evita duplicar se já foi pego como texto ou componente
    const isAlreadyCaptured = snippets.some(s => s.content.includes(match![0]));
    
    if (!isAlreadyCaptured) {
        let typeLabel = "Container Genérico";
        if (className.includes("grid")) typeLabel = "Grid Layout";
        else if (className.includes("flex")) typeLabel = "Flex Layout";
        else if (className.includes("fixed")) typeLabel = "Overlay / Fixed";

        snippets.push({
            type: "LAYOUT_PROPORTION",
            content: match[0] + "...", // Apenas a abertura para não ficar gigante
            preview: typeLabel,
        });
    }
  }

  // --- 6. POPUPS E MODAIS ---
  const popupRegex = /className="[^"]*?(z-\[999\]|z-50|fixed inset-0)[^"]*?"/g;
  while ((match = popupRegex.exec(content)) !== null) {
     // Encontra a tag inteira ao redor desse className (aproximação)
     const index = match.index;
     const start = content.lastIndexOf("<", index);
     const end = content.indexOf(">", index) + 1;
     
     if (start > -1 && end > start) {
         snippets.push({
             type: "POPUP_STRUCTURE",
             content: content.substring(start, end),
             preview: "Estrutura de Modal/Popup",
         });
     }
  }

  // Remove duplicatas exatas e limita a 100 itens para performance
  const uniqueSnippets = Array.from(new Set(snippets.map(s => JSON.stringify(s))))
    .map(s => JSON.parse(s))
    .slice(0, 100);

  return uniqueSnippets;
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
 * Analisador de Dependências (Imports)
 */
function extractDependencies(filePath: string, content: string, rootDir: string): string[] {
  const dependencies: string[] = [];
  const importRegex = /import\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
 
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
   
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }

    let resolvedPath = importPath;

    if (importPath.startsWith('@/')) {
      resolvedPath = importPath.replace('@/', 'src/');
    } else {
      const currentDir = path.dirname(filePath);
      resolvedPath = path.join(currentDir, importPath);
      resolvedPath = path.relative(rootDir, path.resolve(rootDir, resolvedPath));
    }

    resolvedPath = resolvedPath.split(path.sep).join('/');

    if (!resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.tsx') && !resolvedPath.endsWith('.js')) {
       if (fs.existsSync(path.join(rootDir, resolvedPath + '.tsx'))) resolvedPath += '.tsx';
       else if (fs.existsSync(path.join(rootDir, resolvedPath + '.ts'))) resolvedPath += '.ts';
    }

    dependencies.push(resolvedPath);
  }

  return dependencies;
}

/**
 * ✅ ADICIONE ISTO: Simulação de Análise Automática (Stub)
 * Em produção, isso chamaria uma LLM ou analisador estático mais robusto.
 */
export async function generateAutoDocAction(filePath: string): Promise<AutoDoc | null> {
  // Simula um delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    summary: `Análise automática do arquivo ${filePath.split('/').pop()}. Este componente gerencia a interface visual e interações do usuário.`,
    stateVariables: ["isLoading", "data", "isVisible"],
    renderedComponents: ["div", "span", "button"],
    complexityLevel: "Média"
  };
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

  let activeFile = focusFile;
  if (!activeFile) {
    const normalizedPath = currentPathname === "/" ? "/page" : currentPathname;
    activeFile = allProjectFiles.find(f => f.path.includes(`app${normalizedPath}/page.tsx`))?.path;
    if (!activeFile) activeFile = "app/page.tsx";
  }

  const codeMap: Record<string, CodeSnippet[]> = {};
  const dependencyLinks: DependencyLink[] = [];
  const connectedFilesSet = new Set<string>();
 
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
       
        const snippets = extractCodeSnippets(content);
        if (snippets.length > 0) {
          codeMap[file.path] = snippets;
        }

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
    dependencies: dependencyLinks,
    connectivity: {
        connected: Array.from(connectedFilesSet),
        disconnected: []
    },
    database: { models: [] },
    projectStructure: allProjectFiles,
    codeMap: codeMap
  };

  return { issues, categorizedFiles: { ui: uiFiles, logic: logicFiles }, screenMetadata };
}