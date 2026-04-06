import { z } from 'zod';

export const VideoBackgroundSchema = z.object({
  videoUrl: z.string().url("A URL do vídeo deve ser válida.").or(z.literal('')),
  isActive: z.boolean().default(true)
});

export type VideoBackgroundType = z.infer<typeof VideoBackgroundSchema>;