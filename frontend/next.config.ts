import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mengabaikan error TypeScript saat build produksi di Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mengabaikan error ESLint saat build produksi di Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;