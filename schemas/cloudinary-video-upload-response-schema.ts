import { z } from 'zod';

/** Resposta mínima do POST /video/upload do Cloudinary após sucesso. */
export const CloudinaryVideoUploadResponseSchema = z.object({
  secure_url: z.string().url(),
  public_id: z.string().min(1),
  bytes: z.number().optional(),
  format: z.string().optional(),
  duration: z.number().optional(),
});

export type CloudinaryVideoUploadResponseType = z.infer<
  typeof CloudinaryVideoUploadResponseSchema
>;
