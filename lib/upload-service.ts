import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Serviço de Upload de Imagens
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
 * Serviço de Upload de Vídeos Locais
 */
const LOGIN_VIDEO_DIRECTORY = path.join(process.cwd(), 'public', 'uploads', 'login-video');
const ALLOWED_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

function getExtensionForMimeType(mimeType: string): string {
  if (mimeType === 'video/webm') return 'webm';
  if (mimeType === 'video/quicktime') return 'mov';
  return 'mp4';
}

export async function uploadVideoToServer(file: File): Promise<string> {
  await mkdir(LOGIN_VIDEO_DIRECTORY, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const nameExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const finalExtension = file.type && ALLOWED_VIDEO_MIME_TYPES.has(file.type) 
    ? getExtensionForMimeType(file.type) 
    : nameExtension || 'mp4';
    
  const uniqueFilename = `${randomUUID()}.${finalExtension}`;
  const absoluteFilepath = path.join(LOGIN_VIDEO_DIRECTORY, uniqueFilename);
  
  await writeFile(absoluteFilepath, buffer);

  return `/uploads/login-video/${uniqueFilename}`;
}