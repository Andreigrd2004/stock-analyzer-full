import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker production image (copies minimal server bundle)
  output: 'standalone',
};

export default nextConfig;
