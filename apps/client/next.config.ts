import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Login/register are modals (?auth=...), not routes; keep old links working.
  async redirects() {
    return [
      { source: "/login", destination: "/?auth=login", permanent: false },
      { source: "/register", destination: "/?auth=register", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
