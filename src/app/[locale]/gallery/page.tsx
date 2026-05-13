import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArtworkInquiryLink } from "@/components/ArtworkInquiryLink";
import { GallerySortSelect } from "@/components/GallerySortSelect";
import { GalleryViewTabs } from "@/components/GalleryViewTabs";
import { SoldStamp } from "@/components/SoldStamp";
import { localeAlternates } from "@/lib/seo-helpers";
import { sortPublishedArtworks, normalizeGallerySort } from "@/lib/gallery-sort";
import { absoluteUrl } from "@/lib/site-url";
import { getSessionFromCookies } from "@/lib/auth";
import { PublicListAdminToolbar } from "@/components/admin/PublicListAdminToolbar";
import { PublicResourceAdminActions } from "@/components/admin/PublicResourceAdminActions";
import { readArtworks, readSettings } from "@/lib/data";
import { resolvedArtworkPrice } from "@/lib/artwork-price";
import {
  filterBySeriesSlug,
  groupArtworksByYear,
  pickSeriesSpotlight,
  uniqueSeriesFromArtworks,
} from "@/lib/gallery-series";
import { IMAGE_BLUR_PLACEHOLDER } from "@/lib/image-blur";
import { artworkInquiryHref } from "@/lib/artwork-inquiry";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sort?: string; series?: string; view?: string }>;
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
  const { sort: sortRaw, series: seriesRaw, view: viewRaw } =
    await searchParams;
  const sort = normalizeGallerySort(sortRaw);
  const seriesParam = seriesRaw?.trim() || undefined;
  const view = viewRaw === "chronology" ? "chronology" : "grid";

  const t = await getTranslations({ locale, namespace: "gallery" });
  const isAdmin = Boolean(await getSessionFromCookies());
  const settings = await readSettings();
  const all = await readArtworks();
  const publishedSorted = sortPublishedArtworks(
    all.filter((a) => a.published),
    sort,
    locale
  );
  const list = filterBySeriesSlug(publishedSorted, seriesParam);
  const seriesOptions = uniqueSeriesFromArtworks(
    sortPublishedArtworks(
      all.filter((a) => a.published),
      "order",
      locale
    )
  );

  function inquiryHref(artworkTitle: string, slug: string) {
    const url = absoluteUrl(`/${locale}/gallery/${slug}`);
    const subject = t("inquirySubject", { title: artworkTitle });
    const body = t("inquiryBody", { title: artworkTitle, url });
    return artworkInquiryHref(settings.contactEmail || "", subject, body);
  }

  const sortOptions = [
    { id: "order" as const, label: t("sortOrder") },
    { id: "year-desc" as const, label: t("sortYearDesc") },
    { id: "year-asc" as const, label: t("sortYearAsc") },
    { id: "title-asc" as const, label: t("sortTitleAsc") },
    { id: "title-desc" as const, label: t("sortTitleDesc") },
    { id: "available-first" as const, label: t("sortAvailableFirst") },
    { id: "sold-first" as const, label: t("sortSoldFirst") },
  ];

  const sortQuery = sort === "order" ? "" : sort;

  const deckLine =
    locale === "tr" ? settings.taglineTr : settings.taglineEn;
  const seriesSpotlight =
    view === "grid" && !seriesParam && seriesOptions.length > 0
      ? pickSeriesSpotlight(seriesOptions, publishedSorted)
      : null;

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-14 md:py-20">
      {isAdmin ? <PublicListAdminToolbar locale={locale} variant="gallery" /> : null}
      <header className="mb-8 flex flex-col gap-6 border-b border-umber/10 pb-8 sm:mb-10 sm:gap-8 sm:pb-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="gold-rule mb-4" aria-hidden />
          <p className="editorial-eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight text-umber-deep sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          {deckLine?.trim() ? (
            <div className="mt-6 max-w-2xl">
              <div className="gold-rule mb-4" aria-hidden />
              <p className="font-serif text-lg font-medium leading-snug text-umber-deep/90 sm:text-xl md:text-2xl">
                {deckLine.trim()}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 sm:items-end">
          <GalleryViewTabs
            view={view}
            sort={sortQuery}
            series={seriesParam}
            labelGrid={t("viewGrid")}
            labelChronology={t("viewChronology")}
            tabsAria={t("viewTabsAria")}
          />
          {view === "grid" ? (
            <Suspense
              fallback={
                <div
                  className="skeleton-parchment h-10 w-full max-w-[14rem] shrink-0 sm:ml-auto"
                  aria-hidden
                />
              }
            >
              <GallerySortSelect label={t("sortLabel")} options={sortOptions} />
            </Suspense>
          ) : (
            <p className="max-w-xs text-right text-xs text-umber/50">
              {t("chronologySortNote")}
            </p>
          )}
        </div>
      </header>

      {seriesOptions.length > 0 ? (
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-umber/10 pb-8">
          <span className="text-xs font-medium uppercase tracking-editorial text-umber/45">
            {t("seriesFilter")}
          </span>
          <Link
            href={
              view === "chronology"
                ? `/gallery?view=chronology${sortQuery ? `&sort=${sortQuery}` : ""}`
                : sortQuery
                  ? `/gallery?sort=${sortQuery}`
                  : "/gallery"
            }
            scroll={false}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !seriesParam
                ? "border-umber-deep bg-umber-deep text-parchment"
                : "border-umber/15 text-umber/70 hover:border-goldleaf/40"
            }`}
          >
            {t("seriesAll")}
          </Link>
          {seriesOptions.map((s) => {
            const label = locale === "tr" ? s.labelTr : s.labelEn;
            const sp = new URLSearchParams();
            sp.set("series", s.slug);
            if (view === "chronology") sp.set("view", "chronology");
            if (sortQuery) sp.set("sort", sortQuery);
            return (
              <Link
                key={s.slug}
                href={`/gallery?${sp.toString()}`}
                scroll={false}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  seriesParam === s.slug
                    ? "border-umber-deep bg-umber-deep text-parchment"
                    : "border-umber/15 text-umber/70 hover:border-goldleaf/40"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      ) : null}

      {seriesSpotlight ? (
        <section
          className="mb-10 border-b border-umber/10 pb-10"
          aria-label={t("seriesSpotlightTitle")}
        >
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="gold-rule mb-3" aria-hidden />
              <p className="editorial-eyebrow">{t("seriesSpotlightTitle")}</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-umber-deep sm:text-3xl">
                {locale === "tr"
                  ? seriesSpotlight.labelTr
                  : seriesSpotlight.labelEn}
              </h2>
            </div>
            <Link
              href={`/gallery?series=${encodeURIComponent(seriesSpotlight.slug)}${sortQuery ? `&sort=${sortQuery}` : ""}`}
              scroll={false}
              className="shrink-0 text-sm font-semibold tracking-wide text-oxide underline-offset-[6px] transition hover:text-umber-deep hover:underline"
            >
              {t("viewSeries")}
            </Link>
          </div>
          <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 pt-1 sm:gap-5">
            {seriesSpotlight.works.map((a) => {
              const title = locale === "tr" ? a.titleTr : a.titleEn;
              return (
                <li
                  key={a.id}
                  className="w-[46vw] max-w-[200px] shrink-0 sm:w-52 sm:max-w-none"
                >
                  <Link href={`/gallery/${a.slug}`} className="group block">
                    <div className="gallery-image-frame gallery-image-frame-hover relative aspect-[4/5]">
                      <Image
                        src={a.image}
                        alt={title}
                        fill
                        placeholder="blur"
                        blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                        className="object-cover transition duration-[1100ms] ease-out-expo motion-safe:group-hover:scale-[1.03]"
                        sizes="200px"
                      />
                      {a.sold ? <SoldStamp label={t("sold")} /> : null}
                    </div>
                    <p className="mt-3 line-clamp-2 font-serif text-sm font-medium text-umber-deep group-hover:text-oxide">
                      {title}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {list.length === 0 ? (
        <p className="text-umber/60">{t("empty")}</p>
      ) : view === "chronology" ? (
        <div className="space-y-14">
          {groupArtworksByYear(list).map(({ yearLabel, items }) => (
            <section key={yearLabel}>
              <div className="mb-4 flex items-baseline gap-4">
                <h2 className="font-serif text-2xl font-semibold text-umber-deep md:text-3xl">
                  {yearLabel}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-goldleaf/50 to-transparent" />
              </div>
              <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-1 sm:gap-6">
                {items.map((a) => {
                  const price = resolvedArtworkPrice(a, locale);
                  const title = locale === "tr" ? a.titleTr : a.titleEn;
                  return (
                    <li
                      key={a.id}
                      className="w-[72vw] max-w-[280px] shrink-0 sm:w-64 md:max-w-[300px]"
                    >
                      <Link href={`/gallery/${a.slug}`} className="group block">
                        <div className="gallery-image-frame gallery-image-frame-hover relative aspect-[4/5]">
                          <Image
                            src={a.image}
                            alt={title}
                            fill
                            placeholder="blur"
                            blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                            className="object-cover transition duration-[1100ms] ease-out-expo motion-safe:group-hover:scale-[1.03]"
                            sizes="280px"
                          />
                          {a.sold ? <SoldStamp label={t("sold")} /> : null}
                        </div>
                        <div className="mt-4 space-y-1">
                          <h3 className="font-serif text-lg font-medium text-umber-deep group-hover:text-oxide">
                            {title}
                          </h3>
                          {price ? (
                            <p className="text-sm font-medium text-umber-deep/95">
                              {price}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                      {isAdmin ? (
                        <PublicResourceAdminActions
                          locale={locale}
                          kind="artwork"
                          id={a.id}
                          className="mt-3"
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-14 lg:gap-x-10">
          {list.map((a) => {
            const price = resolvedArtworkPrice(a, locale);
            const title = locale === "tr" ? a.titleTr : a.titleEn;
            return (
              <li key={a.id}>
                <Link href={`/gallery/${a.slug}`} className="group block">
                  <div className="gallery-image-frame gallery-image-frame-hover relative aspect-[4/5]">
                    <Image
                      src={a.image}
                      alt={title}
                      fill
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                      className="object-cover transition duration-[1100ms] ease-out-expo motion-safe:group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {a.sold ? <SoldStamp label={t("sold")} /> : null}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/30 via-transparent to-transparent opacity-0 transition duration-500 ease-out-expo group-hover:opacity-100" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <h2 className="font-serif text-xl font-medium text-umber-deep sm:text-2xl">
                      {title}
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
                    {!a.sold ? (
                      <ArtworkInquiryLink
                        href={inquiryHref(title, a.slug)}
                        className="inline-block text-xs font-semibold uppercase tracking-editorial text-oxide underline-offset-4 hover:underline"
                      >
                        {t("inquiryCta")}
                      </ArtworkInquiryLink>
                    ) : null}
                  </div>
                </Link>
                {isAdmin ? (
                  <PublicResourceAdminActions
                    locale={locale}
                    kind="artwork"
                    id={a.id}
                    className="mt-3"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
