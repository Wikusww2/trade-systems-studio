import path from "path";
import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Keep the dev server's build cache out of the production output directory.
// Without this, `npm run build` wipes the running dev server's chunks and
// every page request 404s until the dev server restarts.
const distDir = process.env.NODE_ENV === "development" ? ".next-dev" : ".next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  outputFileTracingRoot: path.join(__dirname),
  basePath: basePath || undefined,
  trailingSlash: true,
  distDir,
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
