/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['antd', '@ant-design/icons'],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    optimizePackageImports: ['antd', '@ant-design/icons', 'react-big-calendar'],
  },

  productionBrowserSourceMaps: false,
  poweredByHeader: false,
};

module.exports = nextConfig;
