import { z } from 'zod';

/**
 * 🚶‍♀️ WALKING MODEL SCHEMA
 * * Schema de validação Zod para o bloco de modelos em movimento.
 */

export const WalkingModelSchema = z.object({
  walkingModelImages: z
    .array(
      z.string().min(1, 'O caminho da imagem não pode estar vazio')
    )
    .min(1, 'É necessário pelo menos uma imagem')
    .max(20, 'Máximo de 20 imagens permitidas')
    .default([
      '/models/modelo.1.png',
      '/models/modelo.2.png',
      '/models/modelo.3.png',
      '/models/modelo.4.png',
      '/models/modelo.5.png',
      '/models/modelo.6.png'
    ]),

  animationDurationSeconds: z
    .number()
    .min(10, 'Muito rápido')
    .max(120, 'Muito lento')
    .default(30), // 30 segundos é uma velocidade de caminhada suave para travessia de tela
});

export type WalkingModelInput = z.infer<typeof WalkingModelSchema>;