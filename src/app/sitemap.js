// src/app/sitemap.js
import { produtos } from '@/data/produtos';

export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || 'https://www.tupaaudio.com.br';

  const rotas = [
    '',
    '/loja',
    '/bancada',
    '/projetos',
    '/personalizar',
    // '/carrinho' foi removido do sitemap de propósito: a página tem
    // `robots: 'noindex'` (src/app/carrinho/metadata.js), então listá-la
    // aqui só desperdiça crawl budget com uma URL que nunca será indexada.
    '/politicas/trocas',
    '/politicas/prazos',
    '/politicas/privacidade',
  ].map(rota => ({
    url: `${baseUrl}${rota}`,
    lastModified: new Date(),
    changeFrequency: rota === '' ? 'daily' : 'weekly',
    priority: rota === '' ? 1.0 : 0.8,
  }));

  const produtosRotas = produtos.map(produto => ({
    url: `${baseUrl}/loja/${produto.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...rotas, ...produtosRotas];
}