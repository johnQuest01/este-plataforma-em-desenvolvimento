import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * ESLint Configuration - Zero-Error Policy
 * Configuração estrita para o ecossistema SaaS POS.
 * Ignoramos a pasta public para evitar avisos em arquivos minificados de PWA/Workbox.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  
  // Configuração Global de Exclusão
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/**", // Adicionado: Ignora sw.js, workbox-*.js e outros ativos de PWA
    "node_modules/**"
  ]),
]);

export default eslintConfig;