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

  const sanitizedProductName = productName.replace(/\s+/g, '+').substring(0, 20);
  const randomHexColor = Math.floor(Math.random() * 16777215).toString(16);
  return `https://placehold.co/600x800/${randomHexColor}/ffffff/png?text=${sanitizedProductName}`;
}

/**
 * Serviço de Upload de Vídeos para a Nuvem (Vercel Blob)
 * Totalmente compatível com Serverless. O token é injetado via variável de ambiente.
 */
export async function uploadVideoToServer(videoFile: File): Promise<string> {
  try {
    const nameExtension = videoFile.name.split('.').pop()?.toLowerCase() || '';
    const finalExtension = videoFile.type && ALLOWED_VIDEO_MIME_TYPES.has(videoFile.type) 
      ? getExtensionForMimeType(videoFile.type) 
      : nameExtension || 'mp4';
      
    // Adicionado Date.now() para garantir unicidade absoluta e evitar colisões de cache na CDN
    const uniqueFilename = `login-video/${Date.now()}-${randomUUID()}.${finalExtension}`;
    
    const blobUploadResult = await put(uniqueFilename, videoFile, {
      access: 'public',
      addRandomSuffix: false,
      multipart: true, // Essencial para vídeos pesados
    });
    
    // Retorna explicitamente a URL pública gerada pela Vercel
    return blobUploadResult.url;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido de rede';
    console.error("❌ [UploadService] Erro ao enviar para Vercel Blob:", errorMessage);
    throw new Error(`Falha ao processar upload do vídeo para a nuvem: ${errorMessage}`);
  }
}