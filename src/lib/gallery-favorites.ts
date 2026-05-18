/** Published favorites first, preserving relative order within each group. */
export function artworksWithFavoritesFirst<
  T extends { favorite?: boolean },
>(items: T[]): T[] {
  const favorites = items.filter((a) => a.favorite);
  const rest = items.filter((a) => !a.favorite);
  return [...favorites, ...rest];
}
