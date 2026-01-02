// app/actions/guardian.ts
"use server";

import fs from "fs";
import path from "path";
import { DiagnosticIssue } from "@/schemas/guardian-schema";

/**
 * Motor de Auditoria Onisciente
 * Varre o projeto em busca de falhas de tipagem, lógica de preço e UI Mobile.
 */
export async function runFullProjectAuditAction(): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];
  const rootDir = process.cwd();

  // Função recursiva para ler todos os arquivos ignorando pastas desnecessárias
  const walkSync = (dir: string, filelist: string[] = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filepath = path.join(dir, file);
      if (fs.statSync(filepath).isDirectory()) {
        if (!file.includes("node_modules") && !file.includes(".next") && !file.includes(".git")) {
          filelist = walkSync(filepath, filelist);
        }
      } else {
        filelist.push(filepath);
      }
    });
    return filelist;
  };

  const allFiles = walkSync(rootDir);

  allFiles.forEach(fullPath => {
    const relativePath = path.relative(rootDir, fullPath);
    // Só analisamos arquivos de código
    if (!relativePath.endsWith(".ts") && !relativePath.endsWith(".tsx")) return;

    const content = fs.readFileSync(fullPath, "utf8");

    // --- TESTE 1: VIOLAÇÃO DE TIPAGEM ESTRITA ---
    if (content.includes(": any") || content.includes("as any")) {
      issues.push({
        id: `type-any-${relativePath}-${Math.random()}`,
        layer: "STRICT_TYPING",
        file: relativePath,
        message: "Uso de 'any' detectado. Isso quebra a segurança do POS.",
        severity: "HIGH",
        suggestion: "Substitua 'any' por uma interface ou Type do Prisma.",
        timestamp: new Date().toISOString(),
      });
    }

    // --- TESTE 2: ERRO DE PREÇO (Lógica de Formatação Brasileira) ---
    if (relativePath.includes("actions") && content.includes("price") && !content.includes("Decimal")) {
      issues.push({
        id: `logic-price-${relativePath}`,
        layer: "BACKEND_LOGIC",
        file: relativePath,
        message: "Possível falha na formatação de moeda detectada.",
        severity: "CRITICAL",
        suggestion: "Use Mappers para Prisma.Decimal. O erro 19,999,00 ocorre por causa do locale na conversão de string para número.",
        mapGuide: {
          action: "Corrigir lógica de preço",
          targetFile: relativePath,
          instruction: "Procure pela função de parse de moeda e use 'Intl.NumberFormat' com unit: 'BRL'."
        },
        timestamp: new Date().toISOString(),
      });
    }

    // --- TESTE 3: RESPONSIVIDADE (Mobile Popup Bug) ---
    if (content.includes("fixed") || content.includes("absolute")) {
      if (!content.includes("max-w-[") && !content.includes("sm:") && (content.includes("width") || content.includes("w-"))) {
         issues.push({
          id: `ui-mobile-${relativePath}`,
          layer: "UI_STYLING",
          file: relativePath,
          message: "Menu/Popup pode estar 'estourando' no Mobile.",
          severity: "HIGH",
          suggestion: "Adicione 'max-w-[90vw]' e garanta que não há larguras fixas em pixels.",
          mapGuide: {
            action: "Ajustar tamanho do Menu",
            targetFile: relativePath,
            instruction: "Troque 'w-[500px]' por 'w-full max-w-md' para caber em qualquer celular."
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    // --- TESTE 4: MAPEAMENTO DE ELEMENTOS (Guia Prático) ---
    if (content.includes("<button")) {
      const buttonTextMatch = content.match(/>([^<]+)<\/button>/);
      issues.push({
        id: `map-btn-${relativePath}-${Math.random()}`,
        layer: "UI_STYLING",
        file: relativePath,
        message: `Mapeamento: Botão "${buttonTextMatch ? buttonTextMatch[1].trim() : 'sem texto'}" encontrado.`,
        severity: "LOW",
        suggestion: "Este é um mapeamento informativo para facilitar sua navegação.", // PROPRIEDADE ADICIONADA PARA CORRIGIR O ERRO
        mapGuide: {
          action: "Alterar texto ou ação deste botão",
          targetFile: relativePath,
          instruction: "Vá até a linha que contém <button> e altere o conteúdo entre as tags."
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  return issues;
}