import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:path*", // Calls to /api/* in your frontend
        destination: "https://news-chatbot-jh7f.onrender.com/:path*", // Real backend URL
      },
    ];
  },
};

export default nextConfig;
