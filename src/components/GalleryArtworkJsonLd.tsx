import type { Artwork } from "@/lib/types";
import { absoluteUrl } from "@/lib/site-url";

type Props = {
  locale: string;
  artwork: Artwork;
};

/** Schema.org VisualArtwork for painting detail SEO. */
export function GalleryArtworkJsonLd({ locale, artwork }: Props) {
  const title = locale === "tr" ? artwork.titleTr : artwork.titleEn;
  const desc =
    locale === "tr" ? artwork.descriptionTr : artwork.descriptionEn;
  const imageUrl = artwork.image.startsWith("http")
    ? artwork.image
    : absoluteUrl(
        artwork.image.startsWith("/") ? artwork.image : `/${artwork.image}`
      );

  const json = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: title,
    description: desc?.slice(0, 5000) || title,
    image: imageUrl,
    artMedium:
      locale === "tr"
        ? artwork.mediumTr || artwork.mediumEn
        : artwork.mediumEn || artwork.mediumTr,
    ...(artwork.year ? { dateCreated: artwork.year } : {}),
    ...(artwork.dimensions ? { size: artwork.dimensions } : {}),
    creator: {
      "@type": "Person",
      name: "Ferhat Çubukçu",
    },
    url: absoluteUrl(`/${locale}/gallery/${artwork.slug}`),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
