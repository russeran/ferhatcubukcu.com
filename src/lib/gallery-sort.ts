import type { Artwork } from "@/lib/types";

export type GallerySortId =
  | "order"
  | "year-desc"
  | "year-asc"
  | "title-asc"
  | "title-desc"
  | "available-first"
  | "sold-first";

const SORT_IDS: GallerySortId[] = [
  "order",
  "year-desc",
  "year-asc",
  "title-asc",
  "title-desc",
  "available-first",
  "sold-first",
];

function parseYear(y: string | undefined): number {
  if (!y?.trim()) return NaN;
  const n = parseInt(y.trim().slice(0, 4), 10);
  return Number.isFinite(n) ? n : NaN;
}

export function normalizeGallerySort(raw: string | undefined): GallerySortId {
  if (raw && SORT_IDS.includes(raw as GallerySortId)) {
    return raw as GallerySortId;
  }
  return "order";
}

export function sortPublishedArtworks(
  list: Artwork[],
  sort: GallerySortId,
  locale: string
): Artwork[] {
  const published = list.filter((a) => a.published);
  const copy = [...published];
  const title = (a: Artwork) =>
    (locale === "tr" ? a.titleTr : a.titleEn).toLowerCase();
  const isSold = (a: Artwork) => Boolean(a.sold);

  const tieOrder = (a: Artwork, b: Artwork) => a.order - b.order;

  switch (sort) {
    case "order":
      return copy.sort(tieOrder);
    case "year-desc":
      return copy.sort((a, b) => {
        const ya = parseYear(a.year);
        const yb = parseYear(b.year);
        if (Number.isNaN(ya) && Number.isNaN(yb)) return tieOrder(a, b);
        if (Number.isNaN(ya)) return 1;
        if (Number.isNaN(yb)) return -1;
        if (yb !== ya) return yb - ya;
        return tieOrder(a, b);
      });
    case "year-asc":
      return copy.sort((a, b) => {
        const ya = parseYear(a.year);
        const yb = parseYear(b.year);
        if (Number.isNaN(ya) && Number.isNaN(yb)) return tieOrder(a, b);
        if (Number.isNaN(ya)) return 1;
        if (Number.isNaN(yb)) return -1;
        if (ya !== yb) return ya - yb;
        return tieOrder(a, b);
      });
    case "title-asc":
      return copy.sort((a, b) => {
        const c = title(a).localeCompare(title(b), locale === "tr" ? "tr" : "en");
        return c !== 0 ? c : tieOrder(a, b);
      });
    case "title-desc":
      return copy.sort((a, b) => {
        const c = title(b).localeCompare(title(a), locale === "tr" ? "tr" : "en");
        return c !== 0 ? c : tieOrder(a, b);
      });
    case "available-first":
      return copy.sort((a, b) => {
        const sa = isSold(a);
        const sb = isSold(b);
        if (sa !== sb) return sa ? 1 : -1;
        return tieOrder(a, b);
      });
    case "sold-first":
      return copy.sort((a, b) => {
        const sa = isSold(a);
        const sb = isSold(b);
        if (sa !== sb) return sa ? -1 : 1;
        return tieOrder(a, b);
      });
    default:
      return copy.sort(tieOrder);
  }
}
