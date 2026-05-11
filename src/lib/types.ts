export type Artwork = {
  id: string;
  slug: string;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  image: string;
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
  studioNoteEn?: string;
  studioNoteTr?: string;
};
