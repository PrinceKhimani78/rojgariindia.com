import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },

  // 🔥 THIS IS THE CORRECT WAY (inside the config object)
  output: "standalone",
};

export default nextConfig;
