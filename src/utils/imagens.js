// src/utils/imagens.js
/**
 * Utilitários para gerenciamento de imagens no Tupã Áudio
 * Padrão: /img/{pastaImagens}/{numero}.{extensao}
 * Extensões: .png (fallback) e .webp (otimizado)
 */

/**
 * Gera o caminho para uma imagem do produto
 * @param {Object} produto - Objeto do produto
 * @param {number} numero - Número da imagem (1, 2, 3, ...)
 * @param {string} extensao - 'png' ou 'webp' (padrão: 'png')
 * @returns {string} Caminho completo da imagem
 */
export function getImagemProduto(produto, numero = 1, extensao = 'png') {
  if (!produto?.pastaImagens) {
    return `/img/placeholder-produto.${extensao}`;
  }
  return `/img/${produto.pastaImagens}/${numero}.${extensao}`;
}

/**
 * Gera os caminhos para múltiplas imagens de um produto
 * @param {Object} produto - Objeto do produto
 * @param {number} total - Número total de imagens (padrão: 6)
 * @param {string} extensao - 'png' ou 'webp' (padrão: 'png')
 * @returns {string[]} Array com os caminhos das imagens
 */
export function getImagensProduto(produto, total = 6, extensao = 'png') {
  if (!produto?.pastaImagens) {
    return Array(total).fill(`/img/placeholder-produto.${extensao}`);
  }
  return Array.from({ length: total }, (_, i) => 
    `/img/${produto.pastaImagens}/${i + 1}.${extensao}`
  );
}

/**
 * Verifica se uma imagem existe (usando HEAD request)
 * @param {string} src - Caminho da imagem
 * @returns {Promise<boolean>} True se a imagem existe
 */
export async function imagemExiste(src) {
  try {
    const res = await fetch(src, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Tenta carregar a imagem em ordem de prioridade: webp > png > placeholder
 * @param {Object} produto - Objeto do produto
 * @param {number} numero - Número da imagem
 * @returns {Promise<string>} Caminho da melhor imagem disponível
 */
export async function getMelhorImagem(produto, numero = 1) {
  const basePath = produto?.pastaImagens 
    ? `/img/${produto.pastaImagens}/${numero}`
    : '/img/placeholder-produto';

  // Tenta .webp primeiro (mais leve)
  const webpPath = `${basePath}.webp`;
  if (await imagemExiste(webpPath)) {
    return webpPath;
  }

  // Fallback para .png
  const pngPath = `${basePath}.png`;
  if (await imagemExiste(pngPath)) {
    return pngPath;
  }

  // Último recurso: placeholder
  return '/img/placeholder-produto.png';
}

/**
 * Gera URLs para Open Graph (redes sociais)
 * Sempre usa .png para máxima compatibilidade
 */
export function getOGImage(produto, numero = 1) {
  return getImagemProduto(produto, numero, 'png');
}

/**
 * Gera URLs para Next.js Image (usa .webp se disponível)
 */
export function getNextImage(produto, numero = 1) {
  // O Next.js Image otimiza automaticamente, então usamos .png
  // e ele converte para .webp se o navegador suportar
  return getImagemProduto(produto, numero, 'png');
}