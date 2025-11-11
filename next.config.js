/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // CSS Optimization for better performance
  experimental: {
    optimizeCss: true,
    cssChunking: 'strict',
    optimizeServerReact: true, // Enables CSS preloading
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
    // Reduced device sizes to minimize transformations and prevent 4XX errors
    deviceSizes: [640, 750, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Limit formats to reduce transformations
    formats: ['image/webp'],
    // Minimize caching time to reduce new transformations
    minimumCacheTTL: 31536000, // 1 year in seconds
    // Disable static imports optimization for SVGs
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },
  async headers() {
    return [
      // Add cache headers for Next.js optimized images
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
      // Videospill → Feiring category rename (301 permanent redirects)
      // Following Google best practices: direct redirects, no chains, kept for 1+ year
      {
        source: '/videospill/:path*',
        destination: '/feiring/:path*',
        permanent: true,
      },
      // Superhelter → Mandala category rename (301 permanent redirect)
      // Following Google best practices: direct redirect, kept for 1+ year
      {
        source: '/superhelter/:path*',
        destination: '/fargelegg-mandala/:path*',
        permanent: true,
      },
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
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/superhelter/spider-man',
        destination: '/api/410-gone',
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
      // 410 Gone redirects for copyrighted content
      {
        source: '/tegneserier/pokemon-figurer/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-paw-patrol/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-ole-brumm/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-ninjago/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-minions/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-my-little-pony/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-hello-kitty/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-harry-potter/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-elsa/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/disney-prinsesser/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-disney-figurer/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-barbie/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-spiderman/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/superhelter/fargelegg-sonic/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/tegneserier/fargelegg-mario/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/superhelter/fargelegg-deadpool/:path*',
        destination: '/api/410-gone',
        permanent: true,
      },
      {
        source: '/superhelter/fargelegg-captain-america/:path*',
        destination: '/api/410-gone',
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