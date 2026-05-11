import type { SiteSettings } from "@/lib/types";
import { absoluteUrl } from "@/lib/site-url";

type Props = {
  locale: string;
  settings: SiteSettings;
};

export function HomeJsonLd({ locale, settings }: Props) {
  const behance =
    settings.behance?.trim() || "https://www.behance.net/ferhat_cubukcu";
  const sameAs: string[] = [behance];
  if (settings.instagram?.trim()) {
    const raw = settings.instagram.trim();
    sameAs.push(
      raw.startsWith("http")
        ? raw
        : `https://instagram.com/${raw.replace("@", "")}`
    );
  }

  const hero = settings.heroImage || "/hero-placeholder.svg";
  const imageUrl = hero.startsWith("http")
    ? hero
    : absoluteUrl(hero.startsWith("/") ? hero : `/${hero}`);

  const json = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.artistName,
    url: absoluteUrl(`/${locale}`),
    image: imageUrl,
    jobTitle: locale === "tr" ? "Ressam" : "Painter",
    sameAs,
    homeLocation: {
      "@type": "Place",
      name: "İstanbul, Türkiye",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
