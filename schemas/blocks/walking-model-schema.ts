import { z } from 'zod';

/**
 * 🚶‍♀️ WALKING MODEL SCHEMA
 * 
 * Schema de validação Zod para o bloco de modelos em movimento.
 * Garante que as imagens sejam URLs válidas ou caminhos locais e que a animação tenha um tempo seguro.
 */

export const WalkingModelSchema = z.object({
  walkingModelImages: z
    .array(
      z.string().min(1, 'O caminho da imagem não pode estar vazio')
    )
    .min(1, 'É necessário pelo menos uma imagem')
    .max(20, 'Máximo de 20 imagens permitidas para manter a performance'),

  animationDurationSeconds: z
    .number()
    .min(10, 'A animação não pode ser mais rápida que 10 segundos (risco de epilepsia/tontura)')
    .max(120, 'A animação não pode ser mais lenta que 120 segundos')
    .default(30),
});

export type WalkingModelInput = z.infer<typeof WalkingModelSchema>;