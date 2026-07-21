// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de imagens otimizadas
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
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Configurações de performance
  // (swcMinify removido: a minificação via SWC é o padrão desde o Next 13,
  // e a chave `swcMinify` foi descontinuada — mantê-la só gera warning de
  // config não reconhecida no build do Next 16.)
  reactStrictMode: true,
  compress: true,
  
  // Headers para SEO e performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/img/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Webpack: evita fs.readFileSync
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