// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilita a geração de fontes estáticas (problema no Cloudflare)
  optimizeFonts: false,
  
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    minimumCacheTTL: 60,
  },
  
  // Desabilita features que causam problemas no Workers
  experimental: {
    // Desabilita o cache de fontes
    fontLoaders: [],
  },
  
  // Webpack config para evitar fs.readFileSync
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Substitui require('fs') por um mock
      config.resolve.alias = {
        ...config.resolve.alias,
        'fs': false,
        'fs/promises': false,
      };
    }
    return config;
  },
};

export default nextConfig;