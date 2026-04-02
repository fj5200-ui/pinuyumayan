import type { NextConfig } from "next";

const API_BACKEND = process.env.API_BACKEND_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
