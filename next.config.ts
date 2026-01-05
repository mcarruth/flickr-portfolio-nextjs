import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.staticflickr.com',
      },
    ],
  },
};

export default nextConfig;
