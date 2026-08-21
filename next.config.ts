import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["framer-motion", "recharts", "lucide-react"],
  typescript: {
    ignoreBuildErrors: true, // Prevents type errors from failing the build
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Secretly proxies all API calls to your Vercel backend, eliminating CORS!
        destination: "https://jan-adhikar-backend-o5xfbvm3m-anmol-s-project1.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
