import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Ensure pdfjs canvas binary and workers are handled gracefully
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
