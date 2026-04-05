import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

/**
 * Serviço de Upload de Imagens
 * Mantém a lógica de Base64 ou Placeholder para imagens de produtos.
 */
export async function uploadImageToCloud(base64Data: string, productName: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (base64Data && base64Data.startsWith('data:')) {
    console.log(`☁️ [Upload] Imagem recebida em Base64 (${base64Data.length} chars). Salvando...`);
    return base64Data;
  }

  const sanitizedName = productName.replace(/\s+/g, '+').substring(0, 20);
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  
  return `https://placehold.co/600x800/${randomColor}/ffffff/png?text=${sanitizedName}`;
}

/**
 * Serviço de Upload de Vídeos (Vercel Blob Storage)
 * Persistência real e definitiva para ambientes Serverless (Vercel).
 */
const ALLOWED_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

function getExtensionForMimeType(mimeType: string): string {
  if (mimeType === 'video/webm') return 'webm';
  if (mimeType === 'video/quicktime') return 'mov';
  return 'mp4';
}

export async function uploadVideoToServer(file: File): Promise<string> {
  try {
    const nameExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const finalExtension = file.type && ALLOWED_VIDEO_MIME_TYPES.has(file.type) 
      ? getExtensionForMimeType(file.type) 
      : nameExtension || 'mp4';
      
    const uniqueFilename = `login-videos/${randomUUID()}.${finalExtension}`;
    
    // 🚀 Upload direto para a CDN global da Vercel
    const blobResponse = await put(uniqueFilename, file, {
      access: 'public',
      addRandomSuffix: false, // O UUID já garante que o nome é único
    });

    console.log(`✅ [Upload] Vídeo salvo com sucesso no Vercel Blob: ${blobResponse.url}`);

    // Retorna a URL absoluta (https://...) gerada pela Vercel.
    // Esta URL nunca expira e é servida via CDN global (muito mais rápido que a pasta /public).
    return blobResponse.url;
    
  } catch (error) {
    console.error('❌ [Upload] Erro crítico ao enviar vídeo para o Vercel Blob:', error);
    throw new Error('Falha ao fazer upload do vídeo. Verifique se o BLOB_READ_WRITE_TOKEN está configurado corretamente.');
  }
}