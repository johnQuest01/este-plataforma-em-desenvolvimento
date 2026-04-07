'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  VideoBackgroundSchema,
  VideoBackgroundType,
  SaveVideoReferencePayloadSchema,
  FORM_VIDEO_CONFIG_ROW_IDENTIFIER,
} from '@/schemas/video-bg-schema';

export async function saveVideoReferenceAction(
  videoUrl: string
): Promise<{ success: boolean; data?: null; error?: string }> {
  try {
    const validationResult = SaveVideoReferencePayloadSchema.safeParse({ videoUrl });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message ?? 'Validação da URL falhou.',
      };
    }

    const validatedVideoUrl = validationResult.data.videoUrl;

    await prisma.$transaction(async (transactionClient: Prisma.TransactionClient) => {
      await transactionClient.formVideoConfig.upsert({
        where: { id: FORM_VIDEO_CONFIG_ROW_IDENTIFIER },
        update: {
          videoUrl: validatedVideoUrl,
          isActive: true,
        },
        create: {
          id: FORM_VIDEO_CONFIG_ROW_IDENTIFIER,
          videoUrl: validatedVideoUrl,
          isActive: true,
        },
      });
    });

    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[saveVideoReferenceAction]', errorMessage);
    return { success: false, error: 'Erro interno ao guardar a referência do vídeo.' };
  }
}

export async function updateFormVideoAction(
  payload: VideoBackgroundType
): Promise<{ success: boolean; data?: null; error?: string }> {
  try {
    const validationResult = VideoBackgroundSchema.safeParse(payload);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message ?? 'Erro de validação na configuração do vídeo.',
      };
    }

    const validatedData = validationResult.data;

    await prisma.$transaction(async (transactionClient: Prisma.TransactionClient) => {
      await transactionClient.formVideoConfig.upsert({
        where: { id: FORM_VIDEO_CONFIG_ROW_IDENTIFIER },
        update: {
          videoUrl: validatedData.videoUrl,
          isActive: validatedData.isActive ?? true,
        },
        create: {
          id: FORM_VIDEO_CONFIG_ROW_IDENTIFIER,
          videoUrl: validatedData.videoUrl,
          isActive: validatedData.isActive ?? true,
        },
      });
    });

    revalidatePath('/login');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[updateFormVideoAction]', errorMessage);
    return { success: false, error: 'Erro interno ao atualizar as configurações do vídeo.' };
  }
}

export async function getFormVideoAction(): Promise<{
  success: boolean;
  data?: VideoBackgroundType;
  error?: string;
}> {
  try {
    const videoConfiguration = await prisma.formVideoConfig.findUnique({
      where: { id: FORM_VIDEO_CONFIG_ROW_IDENTIFIER },
    });

    if (!videoConfiguration) {
      return { success: true, data: { videoUrl: '', isActive: false } };
    }

    return {
      success: true,
      data: {
        videoUrl: videoConfiguration.videoUrl,
        isActive: videoConfiguration.isActive,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[getFormVideoAction]', errorMessage);
    return { success: false, error: 'Erro interno ao ler a configuração do vídeo.' };
  }
}

export async function getActiveVideoConfigAction(): Promise<{
  success: boolean;
  data?: VideoBackgroundType;
  error?: string;
}> {
  return getFormVideoAction();
}
