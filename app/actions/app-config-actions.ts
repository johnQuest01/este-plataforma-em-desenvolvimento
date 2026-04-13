'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { AppConfigSchema, AppConfigType, defaultAppConfig } from '@/schemas/app-config-schema';

const CONFIG_ID = 'global';

interface RawAppConfig {
  bannerAspectRatio:      string;
  bannerHeightPx:         number;
  bannerNoBorder:         boolean;
  bannerBorderRadius:     number;
  categoriesCircleSize:   number;
  categoriesShowLabel:    boolean;
  categoriesLabelSize:    number;
  productCardWidth:       number;
  productCardImageHeight: number;
  productCardInfoHeight:  number;
  adminNote:              string;
}

function rowToConfig(row: RawAppConfig): AppConfigType {
  return AppConfigSchema.parse({
    bannerAspectRatio:      row.bannerAspectRatio,
    bannerHeightPx:         row.bannerHeightPx,
    bannerNoBorder:         row.bannerNoBorder,
    bannerBorderRadius:     row.bannerBorderRadius,
    categoriesCircleSize:   row.categoriesCircleSize,
    categoriesShowLabel:    row.categoriesShowLabel,
    categoriesLabelSize:    row.categoriesLabelSize,
    productCardWidth:       row.productCardWidth,
    productCardImageHeight: row.productCardImageHeight,
    productCardInfoHeight:  row.productCardInfoHeight,
    adminNote:              row.adminNote,
  });
}

// ── Leitura ───────────────────────────────────────────────────────────────────

export async function getAppConfigAction(): Promise<AppConfigType> {
  try {
    const rows = await prisma.$queryRaw<RawAppConfig[]>(Prisma.sql`
      SELECT
        "bannerAspectRatio",
        "bannerHeightPx",
        "bannerNoBorder",
        "bannerBorderRadius",
        "categoriesCircleSize",
        "categoriesShowLabel",
        "categoriesLabelSize",
        "productCardWidth",
        "productCardImageHeight",
        "productCardInfoHeight",
        "adminNote"
      FROM "AppConfig"
      WHERE id = ${CONFIG_ID}
      LIMIT 1
    `);

    if (!rows.length) return defaultAppConfig;
    return rowToConfig(rows[0]);
  } catch {
    return defaultAppConfig;
  }
}

// ── Escrita ───────────────────────────────────────────────────────────────────

export async function saveAppConfigAction(
  input: Partial<AppConfigType>
): Promise<{ success: boolean; error?: string; data?: AppConfigType }> {
  try {
    const current = await getAppConfigAction();
    const merged = AppConfigSchema.parse({ ...current, ...input });

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "AppConfig" (
        id,
        "bannerAspectRatio",
        "bannerHeightPx",
        "bannerNoBorder",
        "bannerBorderRadius",
        "categoriesCircleSize",
        "categoriesShowLabel",
        "categoriesLabelSize",
        "productCardWidth",
        "productCardImageHeight",
        "productCardInfoHeight",
        "adminNote",
        "updatedAt",
        "createdAt"
      ) VALUES (
        ${CONFIG_ID},
        ${merged.bannerAspectRatio},
        ${merged.bannerHeightPx},
        ${merged.bannerNoBorder},
        ${merged.bannerBorderRadius},
        ${merged.categoriesCircleSize},
        ${merged.categoriesShowLabel},
        ${merged.categoriesLabelSize},
        ${merged.productCardWidth},
        ${merged.productCardImageHeight},
        ${merged.productCardInfoHeight},
        ${merged.adminNote},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        "bannerAspectRatio"      = EXCLUDED."bannerAspectRatio",
        "bannerHeightPx"         = EXCLUDED."bannerHeightPx",
        "bannerNoBorder"         = EXCLUDED."bannerNoBorder",
        "bannerBorderRadius"     = EXCLUDED."bannerBorderRadius",
        "categoriesCircleSize"   = EXCLUDED."categoriesCircleSize",
        "categoriesShowLabel"    = EXCLUDED."categoriesShowLabel",
        "categoriesLabelSize"    = EXCLUDED."categoriesLabelSize",
        "productCardWidth"       = EXCLUDED."productCardWidth",
        "productCardImageHeight" = EXCLUDED."productCardImageHeight",
        "productCardInfoHeight"  = EXCLUDED."productCardInfoHeight",
        "adminNote"              = EXCLUDED."adminNote",
        "updatedAt"              = NOW()
    `);

    revalidatePath('/dashboard');
    return { success: true, data: merged };
  } catch (err) {
    console.error('[saveAppConfigAction]', err);
    return { success: false, error: 'Erro ao salvar configurações.' };
  }
}
