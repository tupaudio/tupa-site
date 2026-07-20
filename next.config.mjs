// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ CRUCIAL: Desabilita otimização de fontes para evitar fs.readFileSync
  optimizeFonts: false,
  
  // Configuração de imagens
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
  
  // Desabilita features que causam problemas no Cloudflare
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração do webpack para evitar fs no servidor
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mock do fs para evitar erros
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