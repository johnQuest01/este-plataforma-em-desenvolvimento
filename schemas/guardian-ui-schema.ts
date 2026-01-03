// schemas/guardian-ui-schema.ts
import { z } from "zod";

export const GuardianUIStateSchema = z.object({
  isOpen: z.boolean(),
  lastScan: z.date().optional(),
});

export type GuardianUIState = z.infer<typeof GuardianUIStateSchema>;