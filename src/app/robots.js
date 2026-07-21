// src/app/robots.js
export default function robots() {
  const baseUrl = process.env.SITE_URL || 'https://www.tupaaudio.com.br';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',           // Rotas de API não devem ser indexadas
        '/carrinho/',      // Página de carrinho com noindex
        '/checkout/',      // Página de checkout
        '/sucesso/',       // Página de sucesso após compra
        '/falha/',         // Página de falha
        '/pendente/',      // Página de pendência
        '/admin/',         // Se existir área administrativa
        '/_next/',         // Arquivos do Next.js
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}