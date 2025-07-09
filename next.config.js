/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // CSS Optimization for better performance
  experimental: {
    optimizeCss: true,
    cssChunking: 'strict'
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    // Define more granular image sizes for better optimization
    deviceSizes: [320, 420, 520, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      // Add cache headers for static images in public directory
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/placeholders/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Add specific cache rules for common image formats
      {
        source: '/:path*.(jpg|jpeg|png|webp|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

    ]
  },
  async redirects() {
    return [
      // Vitenskap category redirects - adding "fargelegg-" prefix to subcategories
      {
        source: '/vitenskap/stjernetegn/:path*',
        destination: '/vitenskap/fargelegg-stjernetegn/:path*',
        permanent: true,
      },
      {
        source: '/vitenskap/verdensrommet/:path*',
        destination: '/vitenskap/fargelegg-verdensrommet/:path*',
        permanent: true,
      },
      {
        source: '/vitenskap/solsystemet/:path*',
        destination: '/vitenskap/fargelegg-solsystemet/:path*',
        permanent: true,
      },
      // Individual page redirects
      {
        source: '/videospill/pokemon',
        destination: '/tegneserier/fargelegging-pokemon',
        permanent: true,
      },
      {
        source: '/mytiske-skapninger/enhjorninger',
        destination: '/tegneserier/fargelegg-enhjorninger',
        permanent: true,
      },
      {
        source: '/videospill/sonic',
        destination: '/superhelter/fargelegg-sonic',
        permanent: true,
      },
      {
        source: '/superhelter/spider-man',
        destination: '/superhelter/fargelegg-spiderman',
        permanent: true,
      },
      {
        source: '/tegneserier/ninjago',
        destination: '/tegneserier/fargelegg-ninjago',
        permanent: true,
      },
      {
        source: '/tegneserier/hello-kitty',
        destination: '/tegneserier/fargelegg-hello-kitty',
        permanent: true,
      },
      {
        source: '/categories',
        destination: '/hoved-kategori',
        permanent: true,
      },
    ];
  },
  // Disable linting during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build for now
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig); 