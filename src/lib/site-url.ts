/**
 * Canonical site origin for metadata, sitemaps, robots, and JSON-LD.
 *
 * On Vercel, if `NEXT_PUBLIC_SITE_URL` is unset, `VERCEL_URL` is often a
 * `*.vercel.app` host — then sitemap and Open Graph URLs do not match your
 * custom domain, which confuses search engines. Prefer setting
 * `NEXT_PUBLIC_SITE_URL=https://ferhatcubukcu.com` (or www) in production.
 *
 * In production we also try `VERCEL_PROJECT_PRODUCTION_URL` (primary domain
 * Vercel associates with the project) before falling back to `VERCEL_URL`.
 */
export function getSiteUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (fromEnv) {
    const raw = fromEnv.replace(/\/$/, "");
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return `https://${raw.replace(/^\/+/, "")}`;
  }

  const vercelEnv = process.env.VERCEL_ENV;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelEnv === "production" && productionHost) {
    const host = productionHost
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      ?.replace(/\/$/, "");
    if (host) return `https://${host}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const host = vercelUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  return "https://ferhatcubukcu.com";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
