// Script para gerar ícones PWA em PNG
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [192, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Cria os diretórios necessários
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Cria um ícone SVG simples com fundo azul e "M" branco
const createIconSVG = (size) => {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#5874f6" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">M</text>
</svg>`);
};

async function generateIcons() {
  console.log('🎨 Gerando ícones PWA...\n');
  
  for (const size of iconSizes) {
    try {
      const svgBuffer = createIconSVG(size);
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Criado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erro ao criar icon-${size}x${size}.png:`, error.message);
    }
  }
  
  console.log('\n✨ Ícones PWA gerados com sucesso!');
}

generateIcons().catch(console.error);
