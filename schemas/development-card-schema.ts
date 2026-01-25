import { z } from 'zod';

export const DevelopmentCardPercentageSchema = z.object({
  percentage: z.number().int().min(0).max(100),
  isManual: z.boolean(),
  lastManualUpdate: z.date().nullable(),
  lastAutoUpdate: z.date(),
});

export const UpdateDevelopmentCardPercentageSchema = z.object({
  percentage: z.number().int().min(0).max(100),
});

export type DevelopmentCardPercentage = z.infer<typeof DevelopmentCardPercentageSchema>;
export type UpdateDevelopmentCardPercentage = z.infer<typeof UpdateDevelopmentCardPercentageSchema>;
