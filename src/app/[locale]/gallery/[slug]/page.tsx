import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SoldStamp } from "@/components/SoldStamp";
import { GalleryArtworkJsonLd } from "@/components/GalleryArtworkJsonLd";
import { localeAlternates, seoTruncate } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { readArtworks } from "@/lib/data";
import { resolvedArtworkPrice, resolvedArtworkExhibition } from "@/lib/artwork-price";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

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
  const price = resolvedArtworkPrice(artwork, locale);
  const exhibition = resolvedArtworkExhibition(artwork, locale);

  return (
    <>
      <GalleryArtworkJsonLd locale={locale} artwork={artwork} />
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-14 md:py-20">
      <Link
        href="/gallery"
        className="text-sm font-medium text-oxide underline-offset-4 hover:underline"
      >
        ← {t("title")}
      </Link>
      <div className="mt-8 grid gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-umber/10 lg:aspect-[4/5]">
          <Image
            src={artwork.image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
          />
          {artwork.sold ? <SoldStamp label={t("sold")} /> : null}
        </div>
        <div className="space-y-8">
          <header className="space-y-3 border-b border-umber/10 pb-8">
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-umber-deep sm:text-4xl md:text-[2.75rem]">
              {title}
            </h1>
            <dl className="grid gap-4 text-sm text-umber/70 sm:gap-3">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <dt className="shrink-0 text-xs uppercase tracking-wider text-umber/45 sm:w-28 sm:text-sm">
                  {t("availability")}
                </dt>
                <dd
                  className={`min-w-0 sm:flex-1 ${artwork.sold ? "font-medium text-umber-deep" : ""}`}
                >
                  {artwork.sold ? t("sold") : t("available")}
                </dd>
              </div>
              {artwork.year ? (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-xs uppercase tracking-wider text-umber/45 sm:w-28 sm:text-sm">
                    {t("year")}
                  </dt>
                  <dd className="min-w-0 sm:flex-1">{artwork.year}</dd>
                </div>
              ) : null}
              {medium ? (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-xs uppercase tracking-wider text-umber/45 sm:w-28 sm:text-sm">
                    {t("medium")}
                  </dt>
                  <dd className="min-w-0 sm:flex-1">{medium}</dd>
                </div>
              ) : null}
              {artwork.dimensions ? (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-xs uppercase tracking-wider text-umber/45 sm:w-28 sm:text-sm">
                    {t("dimensions")}
                  </dt>
                  <dd className="min-w-0 sm:flex-1">{artwork.dimensions}</dd>
                </div>
              ) : null}
              {exhibition ? (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-xs uppercase tracking-wider text-umber/45 sm:w-28 sm:text-sm">
                    {t("exhibition")}
                  </dt>
                  <dd className="min-w-0 sm:flex-1">{exhibition}</dd>
                </div>
              ) : null}
              {price ? (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-xs uppercase tracking-wider text-umber/45 sm:w-28 sm:text-sm">
                    {t("price")}
                  </dt>
                  <dd className="min-w-0 font-medium text-umber-deep sm:flex-1">
                    {price}
                  </dd>
                </div>
              ) : null}
            </dl>
          </header>
          <div className="prose prose-neutral max-w-none prose-p:text-umber/80 prose-p:leading-relaxed">
            <p className="whitespace-pre-wrap">{description}</p>
          </div>
        </div>
      </div>

      {artwork.detailImages && artwork.detailImages.length > 0 ? (
        <section className="mt-12 border-t border-umber/10 pt-10 sm:mt-16 sm:pt-12">
          <h2 className="mb-6 font-serif text-xl font-semibold text-umber-deep sm:mb-8 sm:text-2xl md:text-3xl">
            {t("detailViews")}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {artwork.detailImages.map((src, i) => (
              <li
                key={`${src}-${i}`}
                className="relative aspect-square overflow-hidden rounded-lg bg-parchment-dark shadow-sm ring-1 ring-umber/10"
              >
                <Image
                  src={src}
                  alt={`${title} — ${t("detail")} ${i + 1}`}
                  fill
                  className="object-cover transition hover:opacity-95"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
    </>
  );
}
