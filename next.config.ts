import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-2e173b57501f46d1b35ca8b2b67e30e6.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
