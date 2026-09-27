import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sample catalogue photography (see src/data/catalog.ts). `search` is omitted
    // so Unsplash sizing params (w, fit, q) are allowed; the URL form would block them.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" },
    ],
  },
};

export default nextConfig;
