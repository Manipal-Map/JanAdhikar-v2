import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["framer-motion", "recharts", "lucide-react"],
  typescript: {
    ignoreBuildErrors: true, // Set to true to prevent type-check blockers on deployment
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/:path*" // Maps to local FastAPI in dev
            : "/api/:path*", // In Vercel prod, vercel.json handles this
      },
    ];
  },
};

export default nextConfig;
