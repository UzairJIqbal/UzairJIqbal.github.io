import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export, served by GitHub Pages (see .github/workflows/deploy.yml).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
