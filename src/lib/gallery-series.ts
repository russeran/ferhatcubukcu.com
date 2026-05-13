import type { Artwork } from "@/lib/types";

export function uniqueSeriesFromArtworks(
  list: Artwork[]
): { slug: string; labelEn: string; labelTr: string }[] {
  const map = new Map<
    string,
    { slug: string; labelEn: string; labelTr: string }
  >();
  for (const a of list) {
    const slug = a.seriesSlug?.trim();
    if (!slug) continue;
    if (map.has(slug)) continue;
    const labelEn =
      a.seriesTitleEn?.trim() ||
      slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const labelTr =
      a.seriesTitleTr?.trim() ||
      a.seriesTitleEn?.trim() ||
      labelEn;
    map.set(slug, { slug, labelEn, labelTr });
  }
  return [...map.values()].sort((x, y) =>
    x.labelEn.localeCompare(y.labelEn, "en")
  );
}

export function filterBySeriesSlug(
  list: Artwork[],
  seriesSlug: string | undefined
): Artwork[] {
  const s = seriesSlug?.trim();
  if (!s) return list;
  return list.filter((a) => a.seriesSlug?.trim() === s);
}

/** Group by year (desc). Works without year go last under "—". */
export function groupArtworksByYear(list: Artwork[]): {
  yearLabel: string;
  items: Artwork[];
}[] {
  const parseY = (y: string | undefined): number | null => {
    if (!y?.trim()) return null;
    const n = parseInt(y.trim().slice(0, 4), 10);
    return Number.isFinite(n) ? n : null;
  };
  const buckets = new Map<string, Artwork[]>();
  for (const a of list) {
    const y = parseY(a.year);
    const key = y === null ? "—" : String(y);
    const arr = buckets.get(key) ?? [];
    arr.push(a);
    buckets.set(key, arr);
  }
  const keys = [...buckets.keys()].sort((a, b) => {
    if (a === "—") return 1;
    if (b === "—") return -1;
    return parseInt(b, 10) - parseInt(a, 10);
  });
  return keys.map((yearLabel) => ({
    yearLabel,
    items: (buckets.get(yearLabel) ?? []).sort(
      (x, y) => x.order - y.order
    ),
  }));
}
