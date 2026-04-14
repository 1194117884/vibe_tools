/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: 'loose', // Needed for monorepo packages
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@vibe-tools/ui': path.resolve(__dirname, '../../packages/ui'),
      '@vibe-tools/utils': path.resolve(__dirname, '../../packages/utils'),
    };
    return config;
  },
}

module.exports = nextConfig