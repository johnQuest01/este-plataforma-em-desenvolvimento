'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { VideoBackgroundSchema, VideoBackgroundType } from '@/schemas/video-bg-schema';
import { uploadVideoToServer } from '@/lib/upload-service';

const MAXIMUM_VIDEO_BYTES = 48 * 1024 * 1024; // ~48MB
const ALLOWED_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

export async function uploadLoginBackgroundVideoAction(
  formData: FormData
): Promise<{ success: boolean; data?: { videoUrl: string }; error?: string }> {
  try {
    const file = formData.get('video');
    
    if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
      return { success: false, error: 'Nenhum vídeo válido foi selecionado.' };
    }

    if (file.size <= 0) {
      return { success: false, error: 'O arquivo de vídeo está vazio.' };
    }
    
    if (file.size > MAXIMUM_VIDEO_BYTES) {
      return { success: false, error: 'O vídeo excede o limite máximo de 48 MB.' };
    }

    const nameExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const isMimeTypeValid = file.type && ALLOWED_VIDEO_MIME_TYPES.has(file.type);
    const isExtensionValid = ['mp4', 'webm', 'mov'].includes(nameExtension);
    
    if (!isMimeTypeValid && !isExtensionValid) {
      return { success: false, error: 'Formato inválido. Utilize MP4, WebM ou MOV.' };
    }

    // Agora retorna a URL absoluta do Vercel Blob
    const publicVideoUrl = await uploadVideoToServer(file);

    await prisma.$transaction(async (transaction) => {
      return await transaction.formVideoConfig.upsert({
        where: { id: 'global-video-config' },
        update: { videoUrl: publicVideoUrl, isActive: true },
        create: {
          id: 'global-video-config',
          videoUrl: publicVideoUrl,
          isActive: true,
        },
      });
    });

    revalidatePath('/login');
    revalidatePath('/');
    
    return { success: true, data: { videoUrl: publicVideoUrl } };
  } catch (error) {
    console.error('[uploadLoginBackgroundVideoAction] Error:', error);
    return { success: false, error: 'Ocorreu um erro interno ao salvar o vídeo no servidor.' };
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
        error: validationResult.error.issues[0]?.message || 'Erro de validação na URL do vídeo.'
      };
    }

    const validatedData = validationResult.data;

    await prisma.$transaction(async (transaction) => {
      return await transaction.formVideoConfig.upsert({
        where: { id: 'global-video-config' },
        update: {
          videoUrl: validatedData.videoUrl,
          isActive: validatedData.isActive ?? true
        },
        create: {
          id: 'global-video-config',
          videoUrl: validatedData.videoUrl,
          isActive: validatedData.isActive ?? true
        }
      });
    });

    revalidatePath('/login');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error(`[updateFormVideoAction] Error:`, error);
    return { success: false, error: 'Erro interno ao atualizar as configurações do vídeo.' };
  }
}

export async function getFormVideoAction(): Promise<{ success: boolean; data?: VideoBackgroundType; error?: string }> {
  try {
    const videoConfiguration = await prisma.formVideoConfig.findUnique({
      where: { id: 'global-video-config' }
    });

    if (!videoConfiguration) {
      return { success: true, data: { videoUrl: '', isActive: false } };
    }

    return { 
      success: true, 
      data: { 
        videoUrl: videoConfiguration.videoUrl, 
        isActive: videoConfiguration.isActive 
      } 
    };
  } catch (error) {
    console.error(`[getFormVideoAction] Error:`, error);
    return { success: false, error: 'Erro interno ao buscar as configurações do vídeo.' };
  }
}