// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = './public/img';
const OUTPUT_DIR = './public/img-optimized';

async function optimizeImages() {
  console.log('🔍 Iniciando otimização de imagens...');
  
  if (!fs.existsSync(IMG_DIR)) {
    console.log('⚠️ Pasta public/img não encontrada. Nenhuma imagem para otimizar.');
    return;
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const walk = (dir) => {
    const results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results.push(...walk(filePath));
      } else if (file.match(/\.(png|jpg|jpeg|gif)$/i)) {
        results.push(filePath);
      }
    });
    return results;
  };

  const images = walk(IMG_DIR);
  
  if (images.length === 0) {
    console.log('⚠️ Nenhuma imagem encontrada para otimizar.');
    return;
  }

  console.log(`📸 Encontradas ${images.length} imagens para otimizar`);

  let optimized = 0;
  let errors = 0;

  for (const imagePath of images) {
    const relativePath = path.relative(IMG_DIR, imagePath);
    const outputPath = path.join(OUTPUT_DIR, relativePath);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      const webpPath = outputPath.replace(/\.[^.]+$/, '.webp');
      
      await sharp(imagePath)
        .resize(1920, 1920, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 80, effort: 6 })
        .toFile(webpPath);
      
      optimized++;
      console.log(`✅ [${optimized}/${images.length}] ${relativePath} → webp`);
    } catch (error) {
      errors++;
      console.error(`❌ Erro ao otimizar ${relativePath}:`, error.message);
    }
  }

  console.log(`✨ Otimização concluída!`);
  console.log(`📊 ${optimized} imagens otimizadas, ${errors} erros`);
  console.log(`📁 Imagens otimizadas em: ${OUTPUT_DIR}`);
}

optimizeImages();