// types/builder/guardian.ts
import { z } from "zod";

/**
 * Schema de validação para o estado global do Guardian.
 * Define as abas permitidas e o estado de visibilidade.
 */
export const GuardianStateSchema = z.object({
  isOpen: z.boolean(),
  activeTab: z.enum(["logs", "config", "metrics", "database"]),
});

/**
 * ✅ CORREÇÃO: Alterado de 'z.z.infer' para 'z.infer'.
 * O TypeScript agora consegue resolver o tipo corretamente.
 */
export type GuardianState = z.infer<typeof GuardianStateSchema>;

/**
 * Configurações de interface do gatilho flutuante.
 */
export interface GuardianTriggerConfig {
  iconSize: number;
  position: "bottom-right" | "bottom-left";
}