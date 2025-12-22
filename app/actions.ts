'use server';

// Variável Global na memória do seu PC para guardar a última foto recebida
// (Funciona como um banco de dados temporário enquanto o servidor roda)
let SERVER_MEMORY_IMAGE: string | null = null;

export async function registerProductAction(formData: FormData) {
  const name = formData.get('name');
  const price = formData.get('price');
  const photo = formData.get('photo') as File;

  // --- ISSO VAI APARECER NO SEU TERMINAL DO VS CODE ---
  console.log('\n---------------------------------------------');
  console.log('🚀 NOVO PRODUTO RECEBIDO VIA TUNNEL!');
  console.log(`👤 Nome do Produto: ${name}`);
  console.log(`💰 Preço Definido: ${price}`);

  if (photo && photo.size > 0) {
    console.log(`📸 Foto recebida: ${photo.name} (${photo.type})`);
    console.log(`📦 Tamanho: ${(photo.size / 1024).toFixed(2)} KB`);
    
    // Converte a foto para Base64 para exibir na sua tela sem banco de dados real
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${photo.type};base64,${buffer.toString('base64')}`;
    
    // Salva na memória
    SERVER_MEMORY_IMAGE = base64Image;
    console.log('✅ Foto salva na memória temporária do servidor!');
  } else {
    console.log('⚠️ O usuário salvou sem foto.');
  }
  console.log('---------------------------------------------\n');

  return { success: true };
}

// Função que sua tela de Inventário vai chamar a cada 2 segundos para ver se tem novidade
export async function checkForNewImage() {
  return SERVER_MEMORY_IMAGE;
}