import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GallerySortSelect } from "@/components/GallerySortSelect";
import { SoldStamp } from "@/components/SoldStamp";
import { localeAlternates } from "@/lib/seo-helpers";
import { sortPublishedArtworks, normalizeGallerySort } from "@/lib/gallery-sort";
import { absoluteUrl } from "@/lib/site-url";
import { readArtworks } from "@/lib/data";
import { resolvedArtworkPrice } from "@/lib/artwork-price";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const title = messages.nav.gallery as string;
  const description = messages.gallery.seoDescription as string;
  return {
    title,
    description,
    alternates: localeAlternates("/gallery", locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/gallery`),
      siteName: "Ferhat Çubukçu",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Ferhat Çubukçu`,
      description,
    },
  };
}

export default async function GalleryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { sort: sortRaw } = await searchParams;
  const sort = normalizeGallerySort(sortRaw);
  const t = await getTranslations({ locale, namespace: "gallery" });
  const list = sortPublishedArtworks(await readArtworks(), sort, locale);

  const sortOptions = [
    { id: "order" as const, label: t("sortOrder") },
    { id: "year-desc" as const, label: t("sortYearDesc") },
    { id: "year-asc" as const, label: t("sortYearAsc") },
    { id: "title-asc" as const, label: t("sortTitleAsc") },
    { id: "title-desc" as const, label: t("sortTitleDesc") },
    { id: "available-first" as const, label: t("sortAvailableFirst") },
    { id: "sold-first" as const, label: t("sortSoldFirst") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-14 md:py-20">
      <header className="mb-8 flex flex-col gap-6 border-b border-umber/10 pb-8 sm:mb-10 sm:gap-8 sm:pb-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="gold-rule mb-4" aria-hidden />
          <p className="editorial-eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight text-umber-deep sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
        </div>
        <Suspense
          fallback={
            <div
              className="h-10 w-full max-w-[14rem] shrink-0 animate-pulse rounded-md bg-umber/10 sm:ml-auto"
              aria-hidden
            />
          }
        >
          <GallerySortSelect label={t("sortLabel")} options={sortOptions} />
        </Suspense>
      </header>
      {list.length === 0 ? (
        <p className="text-umber/60">{t("empty")}</p>
      ) : (
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 md:gap-x-10 md:gap-y-14">
          {list.map((a) => {
            const price = resolvedArtworkPrice(a, locale);
            return (
            <li key={a.id}>
              <Link href={`/gallery/${a.slug}`} className="group block">
                <div className="gallery-image-frame gallery-image-frame-hover relative aspect-[4/5]">
                  <Image
                    src={a.image}
                    alt={locale === "tr" ? a.titleTr : a.titleEn}
                    fill
                    className="object-cover transition duration-[1100ms] ease-out-expo motion-safe:group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  {a.sold ? <SoldStamp label={t("sold")} /> : null}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/30 via-transparent to-transparent opacity-0 transition duration-500 ease-out-expo group-hover:opacity-100" />
                </div>
                <div className="mt-5 space-y-1">
                  <h2 className="font-serif text-xl font-medium text-umber-deep sm:text-2xl">
                    {locale === "tr" ? a.titleTr : a.titleEn}
                  </h2>
                  <p className="text-sm text-umber/55">
                    {[a.year, locale === "tr" ? a.mediumTr : a.mediumEn]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {price ? (
                    <p className="text-sm font-medium text-umber-deep/95">
                      {price}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
