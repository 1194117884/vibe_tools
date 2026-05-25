const CopyPlugin = require('copy-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            { from: 'node_modules/jq-web/jq.wasm', to: 'static/chunks/jq.wasm' },
          ],
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;