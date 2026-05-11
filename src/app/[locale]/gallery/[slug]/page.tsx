import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { localeAlternates, seoTruncate } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { readArtworks } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const list = await readArtworks();
  const artwork = list.find((a) => a.slug === slug && a.published);
  if (!artwork) {
    return { title: "Gallery" };
  }

  const title = locale === "tr" ? artwork.titleTr : artwork.titleEn;
  const rawDesc =
    locale === "tr" ? artwork.descriptionTr : artwork.descriptionEn;
  const description = seoTruncate(rawDesc || title);

  const imageUrl = artwork.image.startsWith("http")
    ? artwork.image
    : absoluteUrl(
        artwork.image.startsWith("/") ? artwork.image : `/${artwork.image}`
      );

  return {
    title,
    description,
    alternates: localeAlternates(`/gallery/${slug}`, locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/gallery/${slug}`),
      siteName: "Ferhat Çubukçu",
      type: "article",
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Ferhat Çubukçu`,
      description,
      images: [imageUrl],
    },
  };
}

export async function generateStaticParams() {
  const artworks = await readArtworks();
  const published = artworks.filter((a) => a.published);
  const locales = ["en", "tr"] as const;
  return locales.flatMap((locale) =>
    published.map((a) => ({ locale, slug: a.slug }))
  );
}

export default async function GalleryDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  const list = await readArtworks();
  const artwork = list.find((a) => a.slug === slug && a.published);
  if (!artwork) notFound();

  const title = locale === "tr" ? artwork.titleTr : artwork.titleEn;
  const description =
    locale === "tr" ? artwork.descriptionTr : artwork.descriptionEn;
  const medium =
    locale === "tr" ? artwork.mediumTr : artwork.mediumEn;

  return (
    <article className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <Link
        href="/gallery"
        className="text-sm font-medium text-oxide underline-offset-4 hover:underline"
      >
        ← {t("title")}
      </Link>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-umber/10 lg:aspect-[4/5]">
          <Image
            src={artwork.image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
          />
        </div>
        <div className="space-y-8">
          <header className="space-y-3 border-b border-umber/10 pb-8">
            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-umber-deep md:text-[2.75rem]">
              {title}
            </h1>
            <dl className="grid gap-3 text-sm text-umber/70">
              {artwork.year ? (
                <div className="flex gap-4">
                  <dt className="w-28 shrink-0 uppercase tracking-wider text-umber/45">
                    {t("year")}
                  </dt>
                  <dd>{artwork.year}</dd>
                </div>
              ) : null}
              {medium ? (
                <div className="flex gap-4">
                  <dt className="w-28 shrink-0 uppercase tracking-wider text-umber/45">
                    {t("medium")}
                  </dt>
                  <dd>{medium}</dd>
                </div>
              ) : null}
              {artwork.dimensions ? (
                <div className="flex gap-4">
                  <dt className="w-28 shrink-0 uppercase tracking-wider text-umber/45">
                    {t("dimensions")}
                  </dt>
                  <dd>{artwork.dimensions}</dd>
                </div>
              ) : null}
            </dl>
          </header>
          <div className="prose prose-neutral max-w-none prose-p:text-umber/80 prose-p:leading-relaxed">
            <p className="whitespace-pre-wrap">{description}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
