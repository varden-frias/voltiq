import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/voltiq-web",
  assetPrefix: "/voltiq-web/",
};

export default nextConfig;