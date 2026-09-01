import type { NextConfig } from "next";

const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
} as unknown as NextConfig;

export default nextConfig;
