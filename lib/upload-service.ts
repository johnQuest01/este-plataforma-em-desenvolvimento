// lib/upload-service.ts

/**
 * Serviço de Upload de Imagens
 * ATUALIZAÇÃO: Agora aceita Base64 real para que a foto apareça na loja.
 * (Futuramente, aqui você conectará com AWS S3 ou R2)
 */
export async function uploadImageToCloud(base64Data: string, productName: string): Promise<string> {
  // 1. Simula delay de rede (para parecer um upload real e dar feedback visual)
  await new Promise(resolve => setTimeout(resolve, 800));

  // 2. LÓGICA DE CORREÇÃO:
  // Se recebermos um Base64 válido (que começa com 'data:image'), retornamos ele mesmo.
  // Isso permite salvar a imagem real no "banco de dados" em memória.
  if (base64Data && base64Data.startsWith('data:')) {
    console.log(`☁️ [Upload] Imagem recebida em Base64 (${base64Data.length} chars). Salvando...`);
    return base64Data;
  }

  // 3. Fallback (apenas se não tiver imagem)
  // Gera uma imagem com a inicial do produto se nada for enviado
  const sanitizedName = productName.replace(/\s+/g, '+').substring(0, 20);
  const randomColor = Math.floor(Math.random()*16777215).toString(16);
  
  return `https://placehold.co/600x800/${randomColor}/ffffff/png?text=${sanitizedName}`;
}