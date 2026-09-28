import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Don't advertise the framework in an X-Powered-By header (CWE-200).
  poweredByHeader: false,
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
        source: "/:path*",
        headers: [
          // Never send a page's path or query string (e.g. an auth redirect's ?token= or
          // ?error=) to other sites such as the image CDN (CWE-598).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No other site may frame these pages, so sign-in, account and admin controls
          // can't be overlaid and clicked unknowingly (CWE-1021). The CSP is kept narrow
          // (no script rules) so Next's inline scripts keep working.
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
          },
          // HTTPS only after the first visit (CWE-319). Production only, so browsers don't
          // pin HSTS to localhost during development.
          ...(isProduction
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
            : []),
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
