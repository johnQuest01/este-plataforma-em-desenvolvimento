import { z } from 'zod';

export const WalkingModelSchema = z.object({
  walkingModelImages: z
    .array(z.string().min(1, 'O caminho da imagem não pode estar vazio'))
    .min(1, 'É necessário pelo menos uma imagem')
    .max(20, 'Máximo de 20 imagens permitidas para manter a performance'),

  // ✅ NOVO: Validação do Banner
  walkingModelBanner: z
    .string()
    .optional(),

  animationDurationSeconds: z
    .number()
    .min(5, 'A animação não pode ser mais rápida que 5 segundos')
    .max(120, 'A animação não pode ser mais lenta que 120 segundos')
    .default(12),
});

export type WalkingModelInput = z.infer<typeof WalkingModelSchema>;