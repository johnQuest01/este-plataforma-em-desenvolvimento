import { z } from 'zod';

export const AppConfigSchema = z.object({
  // Banner
  bannerAspectRatio:    z.string().default('16/7'),
  bannerHeightPx:       z.number().int().min(0).max(800).default(0),
  bannerNoBorder:       z.boolean().default(false),
  bannerBorderRadius:   z.number().int().min(0).max(32).default(0),

  // Categorias / Reels
  categoriesCircleSize: z.number().int().min(40).max(120).default(56),
  categoriesShowLabel:  z.boolean().default(true),
  categoriesLabelSize:  z.number().int().min(8).max(16).default(10),

  // Cards de produto
  productCardWidth:       z.number().int().min(80).max(300).default(120),
  productCardImageHeight: z.number().int().min(80).max(400).default(120),
  productCardInfoHeight:  z.number().int().min(50).max(200).default(80),

  // Notas do admin (JSON array de notas — sem limite de tamanho)
  adminNote: z.string().default(''),
});

export type AppConfigType = z.infer<typeof AppConfigSchema>;

export const defaultAppConfig: AppConfigType = AppConfigSchema.parse({});
