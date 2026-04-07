// lib/upload-service.ts

/**
 * Serviço de Upload de Imagens (Base64 / placeholder).
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
