import type { NextConfig } from "next";

const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true, // IMPORTANT for VPS + LiteSpeed
  },
};

export default nextConfig;
