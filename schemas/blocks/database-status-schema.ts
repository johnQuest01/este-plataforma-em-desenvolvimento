import { z } from "zod";

export const DatabaseStatusSchema = z.object({
  provider: z.literal("neon"),
  region: z.string(),
  latencyMs: z.number().nonnegative(),
  isOnline: z.boolean(),
});

export type DatabaseStatus = z.infer<typeof DatabaseStatusSchema>;