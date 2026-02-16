// schemas/blocks/banner-creator-schema.ts

import { z } from 'zod';

/**
 * 🎨 BANNER CREATOR SCHEMA
 * 
 * Schema de validação Zod para o criador de banners.
 * Garante proporções rígidas (Aspect Ratios) para evitar distorções no mobile.
 */

// Enums
export const MediaTypeEnum = z.enum(['image', 'video']);

export const AspectRatioEnum = z.enum(['16/9', '1/1', '4/5', '9/16']);

// Schema de criação de banner
export const BannerCreatorSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres')
    .trim(),

  mediaType: MediaTypeEnum,

  aspectRatio: AspectRatioEnum,

  file: z
    .instanceof(File, { message: 'Arquivo é obrigatório' })
    .refine((file) => file.size > 0, 'Selecione um arquivo válido')
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      'Arquivo deve ter no máximo 10MB'
    )
    .refine(
      (file) => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const validVideoTypes = ['video/mp4', 'video/webm'];
        return [...validImageTypes, ...validVideoTypes].includes(file.type);
      },
      'Formato inválido. Use JPEG, PNG, WebP, GIF para imagens ou MP4, WebM para vídeos'
    ),

  linkUrl: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),

  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

// Schema de atualização de banner (sem file obrigatório)
export const BannerUpdateSchema = BannerCreatorSchema.extend({
  id: z.string().cuid('ID inválido'),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Arquivo deve ter no máximo 10MB')
    .optional(),
});

// Schema de deleção
export const BannerDeleteSchema = z.object({
  id: z.string().cuid('ID de banner inválido'),
});

// Types exportados
export type BannerCreatorInput = z.infer<typeof BannerCreatorSchema>;
export type BannerUpdateInput = z.infer<typeof BannerUpdateSchema>;
export type BannerDeleteInput = z.infer<typeof BannerDeleteSchema>;

// Metadados de aspect ratios (para UI)
export const ASPECT_RATIO_METADATA = {
  '16/9': {
    label: 'Full Horizontal',
    description: 'Desktop / Topo',
    icon: '🖥️',
    tailwindClass: 'aspect-[16/9]',
    percentage: '56.25%', // (9/16) * 100
  },
  '1/1': {
    label: 'Quadrado',
    description: 'Feed / Stories',
    icon: '📱',
    tailwindClass: 'aspect-square',
    percentage: '100%',
  },
  '4/5': {
    label: 'Retrato',
    description: 'Vertical Médio (70% tela)',
    icon: '📲',
    tailwindClass: 'aspect-[4/5]',
    percentage: '125%', // (5/4) * 100
  },
  '9/16': {
    label: 'Full Stories',
    description: 'Tela Cheia Vertical',
    icon: '📱',
    tailwindClass: 'aspect-[9/16]',
    percentage: '177.78%', // (16/9) * 100
  },
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIO_METADATA;
