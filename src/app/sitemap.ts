import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { readArtworks } from "@/lib/data";
import { absoluteUrl } from "@/lib/site-url";

const staticPaths = ["", "/gallery", "/about", "/contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const p of staticPaths) {
      const path = `/${locale}${p}`;
      entries.push({
        url: absoluteUrl(path),
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority: p === "" ? 1 : 0.85,
      });
    }
  }

  try {
    const artworks = await readArtworks();
    for (const a of artworks.filter((x) => x.published)) {
      for (const locale of routing.locales) {
        entries.push({
          url: absoluteUrl(`/${locale}/gallery/${a.slug}`),
          changeFrequency: "monthly",
          priority: 0.65,
        });
      }
    }
  } catch {
    /* build without data */
  }

  return entries;
}
