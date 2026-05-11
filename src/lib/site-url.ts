/**
 * Canonical site origin for metadata, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL (e.g. https://ferhatcubukcu.com) on Vercel so OG URLs match your custom domain.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  return "https://ferhatcubukcu.com";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
