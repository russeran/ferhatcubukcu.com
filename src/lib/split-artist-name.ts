/** First token + remainder for display (e.g. hero + wordmark). */
export function splitArtistName(full: string): { first: string; rest: string } {
  const t = full.trim();
  const i = t.indexOf(" ");
  if (i === -1) return { first: t, rest: "" };
  return { first: t.slice(0, i), rest: t.slice(i + 1).trim() };
}
