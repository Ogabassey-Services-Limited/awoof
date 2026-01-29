import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // Ensure axios is properly resolved
  serverExternalPackages: ['axios'],
};

export default nextConfig;
