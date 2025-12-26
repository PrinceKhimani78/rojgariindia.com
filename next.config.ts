import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    unoptimized: true, // 🔥 THIS IS THE KEY FIX
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
