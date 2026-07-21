// src/app/robots.js
export default function robots() {
  const baseUrl = process.env.SITE_URL || 'https://www.tupaaudio.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/carrinho'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
