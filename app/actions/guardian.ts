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

const IGNORED_DIRS = new Set([
  "node_modules", ".next", ".git", ".vercel", "dist", "build", "coverage", ".vscode", ".idea"
]);

const IGNORED_FILES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", ".DS_Store", ".eslintrc.json"
]);

// Helper to resolve imports (kept from your original code)
function resolveImportPath(root: string, currentFile: string, importPath: string): string | null {
  let targetPath = "";
  if (importPath.startsWith("@/")) {
    targetPath = path.join(root, importPath.replace("@/", ""));
    if (!fs.existsSync(targetPath) && fs.existsSync(path.join(root, "src", importPath.replace("@/", "")))) {
        targetPath = path.join(root, "src", importPath.replace("@/", ""));
    }
  } else if (importPath.startsWith(".")) {
    targetPath = path.resolve(path.dirname(path.join(root, currentFile)), importPath);
  } else {
    return null;
  }
  const extensions = [".tsx", ".ts", ".jsx", ".js", "/index.tsx", "/index.ts"];
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) return targetPath;
  for (const ext of extensions) {
    if (fs.existsSync(targetPath + ext)) return targetPath + ext;
  }
  return null;
}

function extractImports(root: string, filePath: string): string[] {
  const absPath = path.join(root, filePath);
  if (!fs.existsSync(absPath)) return [];
  const content = fs.readFileSync(absPath, "utf8");
  const imports: string[] = [];
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const resolved = resolveImportPath(root, filePath, match[1]);
    if (resolved) {
      imports.push(path.relative(root, resolved).split(path.sep).join("/"));
    }
  }
  return imports;
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

  // 1. SCANNER GLOBAL
  const scanDirectory = (dir: string) => {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!IGNORED_DIRS.has(entry.name)) scanDirectory(fullPath);
        } else if (entry.isFile()) {
          if (IGNORED_FILES.has(entry.name)) continue;
          if (/\.(ts|tsx|js|jsx|mjs|cjs|prisma|css|json|svg|md|env.*)$/.test(entry.name)) {
            const relativePath = path.relative(rootDirectory, fullPath).split(path.sep).join("/");
            const fileName = entry.name;
            const lowerPath = relativePath.toLowerCase();
            let fileType: FileType = "OTHER";
           
            if (lowerPath.startsWith("app/") && (fileName.includes("page") || fileName.includes("layout"))) fileType = "PAGE";
            else if (lowerPath.includes("/components/")) fileType = "COMPONENT";
            else if (lowerPath.includes("/actions/")) fileType = "ACTION";
            else if (lowerPath.includes("/hooks/")) fileType = "HOOK";
            else if (lowerPath.includes("/schemas/")) fileType = "SCHEMA";
            else if (fileName.includes("prisma")) fileType = "PRISMA";
            else if (fileName.endsWith(".css")) fileType = "STYLE";
            else if (fileName.endsWith(".svg")) fileType = "ASSET";
            else if (fileName.endsWith(".md")) fileType = "MARKDOWN";

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
    } catch (error) { console.error(error); }
  };
  scanDirectory(rootDirectory);

  // 2. PRISMA
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

  // 3. CONTEXTO INTELIGENTE
  let activeFile = focusFile;
  if (!activeFile) {
    const normalizedPath = currentPathname === "/" ? "/page" : currentPathname;
    const activePageFileObj = allProjectFiles.find(f => {
      return f.path.includes(`app${normalizedPath}/page.tsx`) || f.path.includes(`app${normalizedPath}/layout.tsx`);
    });
    activeFile = activePageFileObj ? activePageFileObj.path : "app/page.tsx";
  }

  const directImports = extractImports(rootDirectory, activeFile);
  const relatedUIReal = directImports.filter(f => f.includes("components") || f.endsWith(".tsx") || f.endsWith(".jsx"));
  const relatedLogicReal = directImports.filter(f => !relatedUIReal.includes(f));

  // 4. ANÁLISE PROFUNDA & CONECTIVIDADE
  let totalButtons = 0;
  let totalInputs = 0;
  let totalLogic = 0;
  let totalActions = 0;
  const potentialPopups: string[] = [];
 
  // Listas de Conectividade
  const connectedFiles: string[] = [];
  const disconnectedFiles: string[] = [];

  const scopeFiles = [activeFile, ...relatedUIReal];
  const uniqueScopeFiles = Array.from(new Set(scopeFiles));

  uniqueScopeFiles.forEach(filePath => {
    const absPath = path.join(rootDirectory, filePath);
    if (fs.existsSync(absPath)) {
        const content = fs.readFileSync(absPath, "utf8");

        // Métricas
        const btnMatches = content.match(/<button|<motion\.button|<[A-Z]\w*Button|onClick=/g);
        if (btnMatches) totalButtons += btnMatches.length;
        const inpMatches = content.match(/<input|<textarea|<[A-Z]\w*Input|<[A-Z]\w*Field/g);
        if (inpMatches) totalInputs += inpMatches.length;
        const logMatches = content.match(/useEffect\(|useCallback\(|useState\(|useMemo\(/g);
        if (logMatches) totalLogic += logMatches.length;
        const actMatches = content.match(/Action\(/g);
        if (actMatches) totalActions += actMatches.length;

        // ✅ DETECÇÃO DE POPUPS (STATIC ANALYSIS)
        // Detecta componentes que parecem ser Modais baseados em nome ou CSS
        const isPopupByName = /Modal|Popup|Dialog|Overlay|Drawer|Sheet/.test(filePath);
        const isPopupByCode = (content.includes("fixed") || content.includes("absolute")) && 
                              (content.includes("z-50") || content.includes("z-[") || content.includes("inset-0"));
        
        if ((isPopupByName || isPopupByCode) && filePath !== activeFile) {
            potentialPopups.push(filePath);
        }

        // ✅ DETECÇÃO DE CONECTIVIDADE (REX INTELLIGENCE)
        const hasPrisma = content.includes("prisma.") || content.includes("db.");
        const hasServerAction = content.includes("use server") || content.includes("@/actions");
        const hasDataFetching = content.includes("useQuery") || content.includes("fetch(") || content.includes("useSWR");
       
        if (hasPrisma || hasServerAction || hasDataFetching) {
            connectedFiles.push(filePath);
        } else {
            disconnectedFiles.push(filePath);
        }

        // Diagnósticos
        if (content.includes("fixed") && !content.includes("overflow") && !content.includes("max-h")) {
             issues.push({
                id: `ovf-${filePath}`,
                layer: "UI_PROPORTION",
                file: filePath,
                message: "Container fixo sem controle de scroll explícito.",
                severity: "MEDIUM",
                suggestion: "Verifique se este modal tem 'overflow-y-auto' para telas pequenas.",
                timestamp: new Date().toISOString(),
            });
        }
    }
  });

  const screenMetadata: ScreenMetadata = {
    pathname: currentPathname,
    responsibleFile: activeFile,
    focusMode: !!focusFile,
    lastModified: new Date().toISOString(),
    elements: {
      buttons: totalButtons,
      inputs: totalInputs,
      logicHooks: totalLogic,
      serverActions: totalActions,
    },
    relatedFiles: {
      ui: relatedUIReal,
      logic: relatedLogicReal
    },
    potentialPopups: potentialPopups, // Populated by static analysis
    connectivity: {
        connected: connectedFiles,
        disconnected: disconnectedFiles
    },
    database: { models: dbModels, connection: dbProvider },
    projectStructure: allProjectFiles
  };

  return { issues, categorizedFiles: { ui: uiFiles, logic: logicFiles }, screenMetadata };
}