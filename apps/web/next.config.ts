import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://pinuyumayan-api.onrender.com",
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
