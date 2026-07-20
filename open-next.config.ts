// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // DESABILITA A OTIMIZAÇÃO DE FONTES - isso resolve o erro
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
  
  // Remove a configuração experimental que estava causando warning
  // experimental: {
  //   fontLoaders: [],
  // },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
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