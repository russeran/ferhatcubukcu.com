import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { readArtworks, readNewsPosts } from "@/lib/data";
import { absoluteUrl } from "@/lib/site-url";

const staticPaths = [
  "",
  "/gallery",
  "/studio",
  "/press",
  "/news",
  "/instagram",
  "/about",
  "/contact",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const locale of routing.locales) {
    for (const p of staticPaths) {
      const path = `/${locale}${p}`;
      entries.push({
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority:
          p === ""
            ? 1
            : p === "/news"
              ? 0.8
              : p === "/instagram"
                ? 0.78
                : 0.85,
      });
    }
  }

  try {
    const artworks = await readArtworks();
    for (const a of artworks.filter((x) => x.published)) {
      for (const locale of routing.locales) {
        entries.push({
          url: absoluteUrl(`/${locale}/gallery/${a.slug}`),
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.65,
        });
      }
    }
  } catch {
    /* build without data */
  }

  try {
    const posts = await readNewsPosts();
    for (const post of posts.filter((x) => x.published)) {
      for (const locale of routing.locales) {
        entries.push({
          url: absoluteUrl(`/${locale}/news/${post.slug}`),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.55,
        });
      }
    }
  } catch {
    /* build without data */
  }

  return entries;
}
