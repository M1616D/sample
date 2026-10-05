/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Administrators may reference photography hosted anywhere (CDN, Supabase
    // storage, their own server). Restrict this to your own hosts in production
    // if you prefer a tighter allow-list.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Placeholder artwork and client logos may be SVG. Next serves SVG as-is
    // (no rasterisation); the CSP below neutralises script execution inside a
    // malicious SVG that is ever referenced from a remote URL.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
