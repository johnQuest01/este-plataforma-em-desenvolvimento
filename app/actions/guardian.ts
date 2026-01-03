"use server";

import fs from "fs";
import path from "path";
import { DiagnosticIssue } from "@/schemas/guardian-schema";

const TARGET_DIRECTORIES = ["app", "components", "schemas", "actions", "lib"];

/**
 * MASTER GUARDIAN MOTOR - v5.0 (Desktop Edition)
 */
export async function runFullProjectAuditAction(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  const rootDir = process.cwd();

  const walkSync = (dir: string, filelist: string[] = []) => {
    if (!fs.existsSync(dir)) return filelist;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filepath = path.join(dir, file);
      if (fs.statSync(filepath).isDirectory()) {
        if (!["node_modules", ".next", ".git"].includes(file)) {
          filelist = walkSync(filepath, filelist);
        }
      } else if (/\.(ts|tsx)$/.test(file)) {
        filelist.push(filepath);
      }
    });
    return filelist;
  };

  const allFiles: string[] = [];
  TARGET_DIRECTORIES.forEach(dir => walkSync(path.join(rootDir, dir), allFiles));

  // Padrões proibidos (Shadow-Proofing)
  const forbidden = {
    anyType: ":" + " any",
    anyCast: "as" + " any",
    naming: ["qt" + "y", "pro" + "d", "er" + "r", "cb"]
  };

  allFiles.forEach(fullPath => {
    // Caminho relativo para exibição, mas mantendo a estrutura completa
    const relativePath = path.relative(rootDir, fullPath);
    const isGuardianEngine = relativePath.includes("actions/guardian.ts");

    const content = fs.readFileSync(fullPath, "utf8");
    
    // Remove comentários para evitar falsos positivos
    const codeOnly = content
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*/g, "");

    if (!isGuardianEngine) {
      // 1. STRICT TYPING (Zero Any Policy)
      if (codeOnly.includes(forbidden.anyType) || codeOnly.includes(forbidden.anyCast)) {
        issues.push({
          id: `type-${relativePath}-${Math.random().toString(36).substr(2, 9)}`,
          layer: "STRICT_TYPING",
          file: relativePath,
          message: "Violação Crítica: Uso explícito de 'any' detectado.",
          severity: "CRITICAL",
          suggestion: "Substitua por uma interface, tipo genérico ou 'unknown' com type guarding.",
          timestamp: new Date().toISOString(),
        });
      }

      // 2. NAMING CONVENTION
      const namingRegex = new RegExp(`\\b(${forbidden.naming.join("|")})\\b`, "gi");
      if (namingRegex.test(codeOnly)) {
        issues.push({
          id: `naming-${relativePath}-${Math.random()}`,
          layer: "NAMING_CONVENTION",
          file: relativePath,
          message: "Abreviação não permitida encontrada.",
          severity: "MEDIUM",
          suggestion: "Use nomes semânticos completos (ex: quantity, product, callback).",
          timestamp: new Date().toISOString(),
        });
      }

      // 3. BACKEND LOGIC (Transações)
      if (relativePath.includes("actions") && codeOnly.includes("prisma.") && (codeOnly.includes(".create") || codeOnly.includes(".update"))) {
        if (!codeOnly.includes("$transaction")) {
          issues.push({
            id: `tx-${relativePath}`,
            layer: "BACKEND_LOGIC",
            file: relativePath,
            message: "Mutação de banco de dados fora de transação.",
            severity: "HIGH",
            suggestion: "Envolva operações de escrita em prisma.$transaction para garantir atomicidade.",
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  });

  return issues;
}