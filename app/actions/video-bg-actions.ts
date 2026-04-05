'use server';

import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { VideoBackgroundSchema, VideoBackgroundType } from '@/schemas/video-bg-schema';

const LOGIN_VIDEO_DIR = path.join(process.cwd(), 'public', 'uploads', 'login-video');
const MAX_VIDEO_BYTES = 48 * 1024 * 1024; // abaixo do limite típico de 50mb do Server Action

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

function extensionForMime(mime: string): string {
  if (mime === 'video/webm') return 'webm';
  if (mime === 'video/quicktime') return 'mov';
  return 'mp4';
}

/**
 * Recebe FormData com campo `video` (File). Grava em /public/uploads/login-video e persiste a URL em FormVideoConfig.
 * Adequado a Node/standalone; em deploy serverless sem disco persistente use armazenamento externo.
 */
export async function uploadLoginBackgroundVideoAction(
  formData: FormData
): Promise<{ success: boolean; videoUrl?: string; error?: string }> {
  try {
    const file = formData.get('video');
    if (!file || typeof file === 'string' || !('arrayBuffer' in file)) {
      return { success: false, error: 'Nenhum vídeo selecionado.' };
    }

    if (file.size <= 0) {
      return { success: false, error: 'Arquivo vazio.' };
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return { success: false, error: 'Vídeo muito grande (máx. ~48 MB).' };
    }
    const nameExt = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeOk = file.type && ALLOWED_VIDEO_TYPES.has(file.type);
    const extOk = ['mp4', 'webm', 'mov'].includes(nameExt);
    if (!mimeOk && !extOk) {
      return { success: false, error: 'Use MP4, WebM ou MOV (QuickTime).' };
    }

    await mkdir(LOGIN_VIDEO_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type && ALLOWED_VIDEO_TYPES.has(file.type) ? extensionForMime(file.type) : nameExt || 'mp4';
    const filename = `${randomUUID()}.${ext}`;
    const filepath = path.join(LOGIN_VIDEO_DIR, filename);
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/login-video/${filename}`;

    await prisma.formVideoConfig.upsert({
      where: { id: 'global-video-config' },
      update: { videoUrl: publicUrl, isActive: true },
      create: {
        id: 'global-video-config',
        videoUrl: publicUrl,
        isActive: true,
      },
    });

    revalidatePath('/login');
    return { success: true, videoUrl: publicUrl };
  } catch (error) {
    console.error('[uploadLoginBackgroundVideoAction]', error);
    return { success: false, error: 'Erro ao salvar o vídeo no servidor.' };
  }
}

export async function updateFormVideoAction(
  payload: VideoBackgroundType
): Promise<{ success: boolean; error?: string }> {
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

    return { success: true };
  } catch (error) {
    console.error(`[Video Action Error]:`, error);
    return { success: false, error: 'Erro interno ao atualizar o vídeo.' };
  }
}

export async function getFormVideoAction(): Promise<{ success: boolean; data?: VideoBackgroundType; error?: string }> {
  try {
    const videoConfig = await prisma.formVideoConfig.findUnique({
      where: { id: 'global-video-config' }
    });

    if (!videoConfig) {
      return { success: true, data: { videoUrl: '', isActive: false } };
    }

    return { 
      success: true, 
      data: { videoUrl: videoConfig.videoUrl, isActive: videoConfig.isActive } 
    };
  } catch (error) {
    console.error(`[Video Action Error]:`, error);
    return { success: false, error: 'Erro ao buscar o vídeo.' };
  }
}