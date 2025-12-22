// utils/image-helper.ts

/**
 * Recebe um arquivo (File - JPG ou PNG), redimensiona para no máx 1024px,
 * e converte para WebP mantendo a transparência se houver.
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');

        // Lógica de Redimensionamento (Max 1024px)
        const MAX_WIDTH = 1024;
        const scaleSize = MAX_WIDTH / img.width;
        const finalScale = scaleSize < 1 ? scaleSize : 1;

        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject("Erro ao criar canvas");
          return;
        }

        // Desenha a imagem (se for PNG transparente, o canvas respeita)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Exporta como WebP.
        // WebP suporta transparência E compressão[cite: 4625].
        const webpBase64 = canvas.toDataURL('image/webp', 0.85);
        resolve(webpBase64);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

export const fileToBase64 = compressImage; // Alias para a função de compressão [cite: 4634]