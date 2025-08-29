/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable service worker support
    serverComponentsExternalPackages: ['dexie'],
  },
  // PWA configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  // Enable strict mode
  reactStrictMode: true,
  // Optimize for production
  swcMinify: true,
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;