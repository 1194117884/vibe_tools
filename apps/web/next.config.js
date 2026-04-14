/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose', // Needed for monorepo packages
  },
  webpack: (config, { isServer }) => {
    // Resolve monorepo packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@vibe-tools/ui': path.resolve(__dirname, '../../packages/ui/index.tsx'),
      '@vibe-tools/utils': path.resolve(__dirname, '../../packages/utils/index.ts'),
    };

    // Ensure server/client compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
}

module.exports = nextConfig