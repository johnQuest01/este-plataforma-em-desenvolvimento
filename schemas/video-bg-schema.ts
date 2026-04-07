import { z } from 'zod';

const FORM_VIDEO_CONFIG_ROW_IDENTIFIER = 'global-video-config';

export { FORM_VIDEO_CONFIG_ROW_IDENTIFIER };

const videoUrlFieldSchema = z.union([
  z.literal(''),
  z.string().url({ message: 'A URL do vídeo deve ser válida (http ou https).' }),
]);

export const VideoBackgroundMetadataRecordSchema = z.record(z.string(), z.unknown());

/** Estado completo do vídeo de fundo do login (Neon / Prisma). */
export const VideoBackgroundSchema = z.object({
  videoUrl: videoUrlFieldSchema,
  cloudinaryPublicId: z.string(),
  isActive: z.boolean(),
  metadata: VideoBackgroundMetadataRecordSchema.optional(),
});

export type VideoBackgroundType = z.infer<typeof VideoBackgroundSchema>;

/** Payload após upload assinado no Cloudinary (URL já com f_auto,q_auto para entrega). */
export const SaveVideoReferencePayloadSchema = z.object({
  videoUrl: z.string().url({ message: 'A URL do vídeo enviada deve ser https válida.' }),
  cloudinaryPublicId: z.string().min(1, { message: 'public_id do Cloudinary em falta.' }),
  metadata: VideoBackgroundMetadataRecordSchema.optional(),
});

export type SaveVideoReferencePayloadType = z.infer<typeof SaveVideoReferencePayloadSchema>;

/** Validação no cliente antes de iniciar o upload (tamanho máximo 30MB). */
export const CLIENT_VIDEO_FILE_MAX_BYTES = 30 * 1024 * 1024;

export const ClientVideoFileSelectionSchema = z
  .instanceof(File, { message: 'Selecione um ficheiro de vídeo válido.' })
  .refine(
    (file) => file.size <= CLIENT_VIDEO_FILE_MAX_BYTES,
    { message: 'O vídeo não pode exceder 30MB.' }
  )
  .refine(
    (file) => {
      const mimeType = file.type;
      if (mimeType.length === 0) {
        return true;
      }
      return (
        mimeType === 'video/mp4' ||
        mimeType === 'video/webm' ||
        mimeType === 'video/quicktime'
      );
    },
    { message: 'Formato suportado: MP4, WebM ou MOV.' }
  );
