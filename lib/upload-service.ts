import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

const ALLOWED_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

function getExtensionForMimeType(mimeType: string): string {
  if (mimeType === 'video/webm') return 'webm';
  if (mimeType === 'video/quicktime') return 'mov';
  return 'mp4';
}

/**
 * Serviço de Upload de Imagens (Placeholder/Base64)
 */
export async function uploadImageToCloud(base64Data: string, productName: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (base64Data && base64Data.startsWith('data:')) {
    return base64Data;
  }

  const sanitizedName = productName.replace(/\s+/g, '+').substring(0, 20);
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `https://placehold.co/600x800/${randomColor}/ffffff/png?text=${sanitizedName}`;
}

/**
 * Serviço de Upload de Vídeos para a Nuvem (Vercel Blob)
 * Substitui o sistema de ficheiros local (fs) que não funciona em Serverless.
 */
export async function uploadVideoToServer(file: File): Promise<string> {
  try {
    const nameExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const finalExtension = file.type && ALLOWED_VIDEO_MIME_TYPES.has(file.type) 
      ? getExtensionForMimeType(file.type) 
      : nameExtension || 'mp4';
      
    const uniqueFilename = `login-video/${randomUUID()}.${finalExtension}`;
    
    const blobResult = await put(uniqueFilename, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    
    return blobResult.url;
  } catch (error) {
    console.error("❌ [UploadService] Erro ao enviar para Vercel Blob:", error);
    throw new Error("Falha ao processar upload do vídeo para a nuvem.");
  }
}