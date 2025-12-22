// app/actions/try-on.ts
'use server';

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface TryOnRequest {
  userImage: string;    // Foto da pessoa (Base64)
  garmentImage: string; // Foto da roupa (Base64 ou URL)
  category: 'upper_body' | 'lower_body' | 'dresses';
}

export async function generateVirtualTryOn(data: TryOnRequest) {
  try {
    console.log("🍌 Iniciando Provador (Modelo: Google Nano Banana)...");

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("Token da API não configurado no .env.local");
    }

    // --- MODELO: GOOGLE NANO BANANA ---
    const model = "google/nano-banana"; 

    // Montamos o input
    const input = {
      prompt: "Realistic photo. Put the clothing from the second image onto the person in the first image. High quality, natural lighting, perfect fit.",
      image_input: [
        data.userImage,    // Imagem 1: A Pessoa
        data.garmentImage  // Imagem 2: A Roupa
      ]
    };

    // --- CORREÇÃO DO ERRO 'ANY' ---
    // 1. Removemos o ': any' e o 'as any'.
    // 2. Usamos 'as unknown' para dizer ao TypeScript que trataremos o retorno depois.
    const output = await replicate.run(model, { input }) as unknown;

    console.log("✨ Sucesso Nano Banana:", output);
    
    // Tratamento do Output com Tipagem Segura:
    let imageUrl = "";
    
    if (typeof output === 'string') {
        // Se a IA devolver o link direto (String)
        imageUrl = output;
    } 
    else if (Array.isArray(output) && output.length > 0) {
        // Se a IA devolver uma lista de links (Array)
        imageUrl = output[0];
    } 
    else if (output && typeof output === 'object' && 'url' in output) {
        // Se a IA devolver um objeto de arquivo (File Output)
        // Forçamos a tipagem aqui apenas para acessar o método .url()
        imageUrl = (output as { url: () => string }).url();
    } 
    else {
        // Fallback: Tenta converter o que sobrou para texto
        imageUrl = String(output);
    }

    return { success: true, imageUrl: imageUrl };

  } catch (error) {
    // Removemos o ': any' aqui também, o TypeScript infere como 'unknown' automaticamente
    console.error("❌ ERRO NANO BANANA:", error);

    let userMessage = "Erro ao processar imagem.";
    const errorString = String(error);

    // --- TRATAMENTO DE ERROS ---
    if (errorString.includes("429") || errorString.includes("throttled")) {
      userMessage = "Muitas tentativas! O sistema está ocupado. Verifique seus créditos.";
    } 
    else if (errorString.includes("404") || errorString.includes("not found")) {
      userMessage = "O modelo 'google/nano-banana' não foi encontrado. Verifique o nome exato no Replicate.";
    }
    else if (errorString.includes("422") || errorString.includes("Unprocessable")) {
      userMessage = "A IA não conseguiu processar essas imagens. Tente fotos diferentes.";
    }
    else if (errorString.includes("payment")) {
      userMessage = "Conta do Replicate sem créditos. Adicione um método de pagamento.";
    }

    return { success: false, error: userMessage };
  }
}