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
  order: number;
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
