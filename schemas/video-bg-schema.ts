import { z } from 'zod';

const FORM_VIDEO_CONFIG_ROW_IDENTIFIER = 'global-video-config';

export { FORM_VIDEO_CONFIG_ROW_IDENTIFIER };

/** Estado completo do vídeo de fundo do login (Neon / Prisma). */
export const VideoBackgroundSchema = z.object({
  videoUrl: z.union([
    z.literal(''),
    z.string().url({ message: 'A URL do vídeo deve ser válida (http ou https).' }),
  ]),
  isActive: z.boolean().optional().default(true),
});

export type VideoBackgroundType = z.infer<typeof VideoBackgroundSchema>;

/** Persistência após upload client-side (Vercel Blob): apenas URL HTTPS. */
export const SaveVideoReferencePayloadSchema = z.object({
  videoUrl: z.string().url({ message: 'A URL do vídeo enviada deve ser https válida.' }),
});

export type SaveVideoReferencePayloadType = z.infer<typeof SaveVideoReferencePayloadSchema>;
