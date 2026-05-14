import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  /** Many crawlers (including Google) request `/favicon.ico`; serve the PNG icon route. */
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  async redirects() {
    return [
      {
        source: "/:locale/news",
        destination: "/:locale/press",
        permanent: true,
      },
      {
        source: "/:locale/news/:slug",
        destination: "/:locale/press/:slug",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
