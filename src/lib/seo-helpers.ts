import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/site-url";

/**
 * hreflang alternates + self-referencing canonical for the active locale.
 * @param pathWithoutLocale e.g. `""` or `"/"` for home, `"/gallery"`, `"/gallery/slug"`
 */
export function localeAlternates(
  pathWithoutLocale: string,
  activeLocale: string
): Metadata["alternates"] {
  const normalized =
    !pathWithoutLocale || pathWithoutLocale === "/"
      ? ""
      : pathWithoutLocale.startsWith("/")
        ? pathWithoutLocale
        : `/${pathWithoutLocale}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrl(`/${loc}${normalized}`);
  }
  languages["x-default"] = absoluteUrl(`/en${normalized}`);

  return {
    canonical: absoluteUrl(`/${activeLocale}${normalized}`),
    languages,
  };
}

export function seoTruncate(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}
