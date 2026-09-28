import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sample catalogue photography (see src/data/catalog.ts). `search` is omitted
    // so Unsplash sizing params (w, fit, q) are allowed; the URL form would block them.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" },
    ],
  },
  async headers() {
    return [
      {
        // Never send a page's path or query string (e.g. an auth redirect's ?token= or
        // ?error=) to other sites such as the image CDN (CWE-598).
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Auth URLs can carry one-time tokens; send no Referer at all. Listed last so it
        // wins over the rule above.
        source: "/api/auth/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
