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
  /** Full URL to Behance profile */
  behance?: string;
  studioNoteEn?: string;
  studioNoteTr?: string;
};

/** News, social, press, or studio updates — admin-managed, public under /news. */
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
  /** Instagram post, article, Behance update, etc. */
  externalUrl?: string;
  order: number;
  published: boolean;
  createdAt: string;
};
