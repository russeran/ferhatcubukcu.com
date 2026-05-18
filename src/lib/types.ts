export type PressQuote = {
  id: string;
  quoteEn: string;
  quoteTr: string;
  attributionEn: string;
  attributionTr: string;
  url?: string;
  image?: string;
};

export type Artwork = {
  id: string;
  slug: string;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  /** Main image (hero for cards & detail page). */
  image: string;
  /** Extra photos (texture, frame, close-ups). Shown on the public detail page only. */
  detailImages?: string[];
  year?: string;
  mediumEn?: string;
  mediumTr?: string;
  dimensions?: string;
  /** Shown on gallery and detail (e.g. €4,500, On request). */
  priceEn?: string;
  priceTr?: string;
  /** Optional exhibition or venue line. */
  exhibitionEn?: string;
  exhibitionTr?: string;
  /** Optional series for filtering (slug, e.g. portraits-2024). */
  seriesSlug?: string;
  seriesTitleEn?: string;
  seriesTitleTr?: string;
  order: number;
  /** When true, visitors see a SOLD mark; work stays in the gallery. */
  sold?: boolean;
  published: boolean;
  createdAt: string;
};

export type SiteSettings = {
  artistName: string;
  taglineEn: string;
  taglineTr: string;
  bioEn: string;
  bioTr: string;
  heroImage?: string;
  contactEmail: string;
  instagram?: string;
  studioNoteEn?: string;
  studioNoteTr?: string;
  /** Short press quotes for home strip and /press (admin-managed). */
  pressQuotes?: PressQuote[];
  /** When true, gallery cards use object-contain so the full painting is visible. */
  galleryImageFit?: boolean;
};

/** News, social, press, or studio updates — admin-managed, public under /press. */
export type NewsKind = "news" | "social" | "press" | "studio";

export type NewsPost = {
  id: string;
  slug: string;
  kind: NewsKind;
  titleEn: string;
  titleTr: string;
  excerptEn?: string;
  excerptTr?: string;
  bodyEn: string;
  bodyTr: string;
  image?: string;
  /** Instagram post, article, press link, etc. */
  externalUrl?: string;
  order: number;
  published: boolean;
  createdAt: string;
};
