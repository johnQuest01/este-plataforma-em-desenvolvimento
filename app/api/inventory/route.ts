import { NextResponse } from 'next/server';

// --- BANCO DE DADOS EM MEMÓRIA (Global) ---
// Isso garante que a variável sobreviva mesmo se o arquivo recarregar
declare global {
  var __SERVER_IMAGE: string | null;
}

if (typeof global.__SERVER_IMAGE === 'undefined') {
  global.__SERVER_IMAGE = null;
}

// GET: O computador chama isso a cada 2 segundos para ver se tem foto
export async function GET() {
  return NextResponse.json({ 
    image: global.__SERVER_IMAGE 
  });
}

// POST: O celular manda a foto pra cá
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const price = formData.get('price');
    const photo = formData.get('photo') as File;

    // --- LOG NO TERMINAL DO SEU PC ---
    console.log('\n=======================================');
    console.log('📲 RECEBIDO DO CELULAR (VIA TUNNEL)');
    console.log(`📦 Produto: ${name}`);
    console.log(`💲 Preço: ${price}`);

    if (photo && photo.size > 0) {
      console.log(`📸 Foto detectada: ${photo.name} (${(photo.size/1024).toFixed(1)} KB)`);
      
      // Converte para Base64 para salvar na memória
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = `data:${photo.type};base64,${buffer.toString('base64')}`;
      
      // Salva na variável global
      global.__SERVER_IMAGE = base64;
      
      console.log('✅ IMAGEM SALVA NA MEMÓRIA DO SERVIDOR!');
    } else {
      console.log('⚠️ Sem foto anexada.');
    }
    console.log('=======================================\n');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}