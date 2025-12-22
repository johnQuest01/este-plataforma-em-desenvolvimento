/**
 * Adiciona uma marca d'água simples à imagem gerada antes de compartilhar.
 */
export const addWatermarkToImage = async (imageUrl: string, text: string): Promise<Blob | null> => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
  
      await new Promise((resolve) => { img.onload = resolve; });
  
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
  
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
  
      // Desenha a imagem original
      ctx.drawImage(img, 0, 0);
  
      // Configura a marca d'água (Texto no canto inferior)
      const fontSize = Math.floor(img.width * 0.05); // 5% da largura
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.textAlign = "center";
      
      // Sombra do texto
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
  
      // Posiciona o texto
      ctx.fillText(text, img.width / 2, img.height - (fontSize));
  
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/jpeg", 0.95);
      });
    } catch (error) {
      console.error("Erro ao criar marca d'água", error);
      return null;
    }
  };