import type { NewsPost } from "@/lib/types";

export function resolvedNewsTitle(p: NewsPost, locale: string): string {
  return locale === "tr" ? p.titleTr : p.titleEn;
}

export function resolvedNewsExcerpt(p: NewsPost, locale: string): string {
  const primary = locale === "tr" ? p.excerptTr : p.excerptEn;
  const fallback = locale === "tr" ? p.excerptEn : p.excerptTr;
  const fromExcerpt = (primary?.trim() || fallback?.trim()) ?? "";
  if (fromExcerpt) return fromExcerpt;
  const body = locale === "tr" ? p.bodyTr : p.bodyEn;
  const t = body.trim();
  if (t.length <= 180) return t;
  return `${t.slice(0, 177)}…`;
}

export function resolvedNewsBody(p: NewsPost, locale: string): string {
  return locale === "tr" ? p.bodyTr : p.bodyEn;
}
