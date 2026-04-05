import { z } from 'zod';

/** Vídeo vazio, URL http(s) ou ficheiro servido em /uploads/login-video/ (upload local). */
export function isValidLoginVideoUrl(value: string): boolean {
  if (value === '') return true;
  if (value.startsWith('/uploads/login-video/') && value.length > 22) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export const VideoBackgroundSchema = z.object({
  videoUrl: z
    .string()
    .refine(isValidLoginVideoUrl, {
      message: 'Use URL https, caminho /uploads/login-video/... ou deixe vazio.',
    }),
  isActive: z.boolean().optional().default(true),
});

export type VideoBackgroundType = z.infer<typeof VideoBackgroundSchema>;
