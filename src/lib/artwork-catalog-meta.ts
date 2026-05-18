import type { Artwork } from "@/lib/types";

/** Year · medium · dimensions for gallery cards (locale-aware medium). */
export function artworkCatalogMeta(artwork: Artwork, locale: string): string {
  const medium =
    (locale === "tr" ? artwork.mediumTr : artwork.mediumEn)?.trim() || "";
  return [artwork.year?.trim(), medium || null, artwork.dimensions?.trim()]
    .filter(Boolean)
    .join(" · ");
}
