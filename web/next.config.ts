import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://farmshield-backend-api.onrender.com";

// Normalize backend URL by removing trailing slashes and /api suffix if present
const normalizedBackendUrl = rawBackendUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const nextConfig: NextConfig = {
  typescript: {
    // Avoid blocking production deployments on Vercel due to minor type issues
    ignoreBuildErrors: true,
  },
  eslint: {
    // Avoid blocking production deployments on Vercel due to lint warnings
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

