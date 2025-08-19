/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router já é padrão no Next.js 13+
  images: {
    domains: [
      'ksskokjrdzqghhuahjpl.supabase.co', // Supabase storage
      'localhost'
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig
