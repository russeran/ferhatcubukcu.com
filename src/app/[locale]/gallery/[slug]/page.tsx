import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArtworkInquiryLink } from "@/components/ArtworkInquiryLink";
import { artworkInquiryHref } from "@/lib/artwork-inquiry";
import { ArtworkViewingRoom } from "@/components/ArtworkViewingRoom";
import { DetailImagesLightbox } from "@/components/DetailImagesLightbox";
import { SoldStamp } from "@/components/SoldStamp";
import { GalleryArtworkJsonLd } from "@/components/GalleryArtworkJsonLd";
import { localeAlternates, seoTruncate } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { getSessionFromCookies } from "@/lib/auth";
import { PublicResourceAdminActions } from "@/components/admin/PublicResourceAdminActions";
import { readArtworks, readSettings } from "@/lib/data";
import {
  resolvedArtworkPrice,
  resolvedArtworkExhibition,
} from "@/lib/artwork-price";
import { IMAGE_BLUR_PLACEHOLDER } from "@/lib/image-blur";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ room?: string }>;
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

export default async function GalleryDetailPage({
  params,
  searchParams,
}: Props) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const viewingRoomOpen = sp.room === "1";
  const t = await getTranslations({ locale, namespace: "gallery" });
  const settings = await readSettings();
  const list = await readArtworks();
  const artwork = list.find((a) => a.slug === slug && a.published);
  if (!artwork) notFound();
  const isAdmin = Boolean(await getSessionFromCookies());

  const ordered = list
    .filter((a) => a.published)
    .sort((a, b) => a.order - b.order);
  const idx = ordered.findIndex((a) => a.id === artwork.id);
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx < ordered.length - 1 && idx >= 0 ? ordered[idx + 1] : null;

  const title = locale === "tr" ? artwork.titleTr : artwork.titleEn;
  const description =
    locale === "tr" ? artwork.descriptionTr : artwork.descriptionEn;
  const medium =
    locale === "tr" ? artwork.mediumTr : artwork.mediumEn;
  const price = resolvedArtworkPrice(artwork, locale);
  const exhibition = resolvedArtworkExhibition(artwork, locale);

  const pageUrl = absoluteUrl(`/${locale}/gallery/${slug}`);
  const inquirySubject = t("inquirySubject", { title });
  const inquiryBody = t("inquiryBody", { title, url: pageUrl });
  const inquiryHrefStr = artworkInquiryHref(
    settings.contactEmail || "",
    inquirySubject,
    inquiryBody
  );

  const detailSlides =
    artwork.detailImages?.map((src, i) => ({
      src,
      alt: `${title} — ${t("detail")} ${i + 1}`,
    })) ?? [];

  return (
    <>
      <GalleryArtworkJsonLd locale={locale} artwork={artwork} />
      <article className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-14 md:py-20">
        <Link
          href="/gallery"
          className="text-sm font-medium text-oxide underline-offset-4 hover:underline"
        >
          ← {t("title")}
        </Link>

        {isAdmin ? (
          <PublicResourceAdminActions
            locale={locale}
            kind="artwork"
            id={artwork.id}
            className="mt-4"
          />
        ) : null}

        <ArtworkViewingRoom
          key={slug}
          title={title}
          mainSrc={artwork.image}
          prevSlug={prev?.slug ?? null}
          nextSlug={next?.slug ?? null}
          enterLabel={t("viewingRoomEnter")}
          prevLabel={t("viewingRoomPrev")}
          nextLabel={t("viewingRoomNext")}
          closeLabel={t("viewingRoomClose")}
          initialOpen={viewingRoomOpen}
        />

        <div className="mt-4 grid gap-8 sm:mt-6 sm:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-white shadow-gallery ring-1 ring-umber/10 lg:aspect-[4/5]">
            <Image
              src={artwork.image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_PLACEHOLDER}
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
              {!artwork.sold ? (
                <ArtworkInquiryLink
                  href={inquiryHrefStr}
                  className="inline-flex rounded-full border border-oxide/30 bg-oxide/5 px-5 py-2.5 text-sm font-semibold text-oxide transition hover:border-oxide hover:bg-oxide/10"
                >
                  {t("inquiryCta")}
                </ArtworkInquiryLink>
              ) : null}
            </header>
            <div className="prose prose-neutral max-w-none prose-p:text-umber/80 prose-p:leading-relaxed">
              <p className="whitespace-pre-wrap">{description}</p>
            </div>
          </div>
        </div>

        {detailSlides.length > 0 ? (
          <section className="mt-12 border-t border-umber/10 pt-10 sm:mt-16 sm:pt-12">
            <h2 className="mb-6 font-serif text-xl font-semibold text-umber-deep sm:mb-8 sm:text-2xl md:text-3xl">
              {t("detailViews")}
            </h2>
            <DetailImagesLightbox
              slides={detailSlides}
              title={title}
              closeLabel={t("lightboxClose")}
              prevLabel={t("lightboxPrev")}
              nextLabel={t("lightboxNext")}
              zoomLabel={t("lightboxZoom")}
              unzoomLabel={t("lightboxUnzoom")}
            />
          </section>
        ) : null}
      </article>
    </>
  );
}
