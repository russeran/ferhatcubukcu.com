import type { Artwork } from "@/lib/types";

/** Picks locale price, falls back to the other language if empty. */
export function resolvedArtworkPrice(
  a: Artwork,
  locale: string
): string | undefined {
  const primary = locale === "tr" ? a.priceTr : a.priceEn;
  const fallback = locale === "tr" ? a.priceEn : a.priceTr;
  const v = (primary?.trim() || fallback?.trim()) ?? "";
  return v || undefined;
}

export function resolvedArtworkExhibition(
  a: Artwork,
  locale: string
): string | undefined {
  const primary = locale === "tr" ? a.exhibitionTr : a.exhibitionEn;
  const fallback = locale === "tr" ? a.exhibitionEn : a.exhibitionTr;
  const v = (primary?.trim() || fallback?.trim()) ?? "";
  return v || undefined;
}
