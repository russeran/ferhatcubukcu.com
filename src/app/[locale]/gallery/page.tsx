import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArtworkInquiryLink } from "@/components/ArtworkInquiryLink";
import { GallerySortSelect } from "@/components/GallerySortSelect";
import { GalleryViewTabs } from "@/components/GalleryViewTabs";
import { GalleryArtworkListingCard } from "@/components/GalleryArtworkListingCard";
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
import { artworkInquiryHref } from "@/lib/artwork-inquiry";
import { artworkCatalogMeta } from "@/lib/artwork-catalog-meta";
import { galleryListingImageClass } from "@/lib/gallery-listing-image";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";

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
  const galleryImageFit = settings.galleryImageFit === true;
  const listingImageClass = galleryListingImageClass(galleryImageFit);
  const viewPaintingLabel = t("viewPainting");
  const seriesSpotlight =
    view === "grid" && !seriesParam && seriesOptions.length > 0
      ? pickSeriesSpotlight(seriesOptions, publishedSorted)
      : null;
  const showBrowseHint =
    list.length > 0 || (seriesSpotlight?.works.length ?? 0) > 0;

  return (
    <PageShell wide>
      {isAdmin ? <PublicListAdminToolbar locale={locale} variant="gallery" /> : null}
      <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-8 sm:mb-10 sm:gap-8 sm:pb-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="gold-rule mb-4" aria-hidden />
          <p className="editorial-eyebrow">{t("eyebrow")}</p>
          <h1 className="page-title mt-4">{t("title")}</h1>
          {deckLine?.trim() ? (
            <div className="mt-6 max-w-2xl">
              <div className="gold-rule mb-4" aria-hidden />
              <p className="page-deck">{deckLine.trim()}</p>
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
            <p className="text-caption max-w-xs text-right">
              {t("chronologySortNote")}
            </p>
          )}
        </div>
      </header>

      {showBrowseHint ? (
        <p className="surface-caption mb-8 text-sm leading-relaxed text-ink-muted sm:mb-10">
          {t("browseHint")}
        </p>
      ) : null}

      {seriesOptions.length > 0 ? (
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-white/10 pb-8">
          <span className="text-meta">{t("seriesFilter")}</span>
          <Link
            href={
              view === "chronology"
                ? `/gallery?view=chronology${sortQuery ? `&sort=${sortQuery}` : ""}`
                : sortQuery
                  ? `/gallery?sort=${sortQuery}`
                  : "/gallery"
            }
            scroll={false}
            className={cn("chip", !seriesParam && "chip-active")}
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
                className={cn(
                  "chip",
                  seriesParam === s.slug && "chip-active"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      ) : null}

      {seriesSpotlight ? (
        <section
          className="mb-10 border-b border-white/10 pb-10"
          aria-label={t("seriesSpotlightTitle")}
        >
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="gold-rule mb-3" aria-hidden />
              <p className="editorial-eyebrow">{t("seriesSpotlightTitle")}</p>
              <h2 className="page-section-title mt-2">
                {locale === "tr"
                  ? seriesSpotlight.labelTr
                  : seriesSpotlight.labelEn}
              </h2>
            </div>
            <Link
              href={`/gallery?series=${encodeURIComponent(seriesSpotlight.slug)}${sortQuery ? `&sort=${sortQuery}` : ""}`}
              scroll={false}
              className="link-cta shrink-0"
            >
              {t("viewSeries")}
            </Link>
          </div>
          <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 pt-1 sm:gap-5">
            {seriesSpotlight.works.map((a) => {
              const title = locale === "tr" ? a.titleTr : a.titleEn;
              const meta = artworkCatalogMeta(a, locale);
              return (
                <li
                  key={a.id}
                  className="w-[46vw] max-w-[200px] shrink-0 sm:w-52 sm:max-w-none"
                >
                  <GalleryArtworkListingCard
                    href={`/gallery/${a.slug}`}
                    title={title}
                    image={a.image}
                    meta={meta}
                    listingImageClass={listingImageClass}
                    galleryImageFit={galleryImageFit}
                    sold={a.sold}
                    soldLabel={t("sold")}
                    viewLabel={viewPaintingLabel}
                    sizes="200px"
                    captionSpacing="compact"
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {list.length === 0 ? (
        <p className="text-empty">{t("empty")}</p>
      ) : view === "chronology" ? (
        <div className="space-y-14">
          {groupArtworksByYear(list).map(({ yearLabel, items }) => (
            <section key={yearLabel}>
              <div className="mb-4 flex items-baseline gap-4">
                <h2 className="page-section-title">
                  {yearLabel}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-goldleaf/50 to-transparent" />
              </div>
              <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 pt-1 sm:gap-6">
                {items.map((a) => {
                  const price = resolvedArtworkPrice(a, locale);
                  const title = locale === "tr" ? a.titleTr : a.titleEn;
                  const meta = artworkCatalogMeta(a, locale);
                  return (
                    <li
                      key={a.id}
                      className="w-[72vw] max-w-[280px] shrink-0 sm:w-64 md:max-w-[300px]"
                    >
                      <GalleryArtworkListingCard
                        href={`/gallery/${a.slug}`}
                        title={title}
                        image={a.image}
                        meta={meta}
                        price={price}
                        listingImageClass={listingImageClass}
                        galleryImageFit={galleryImageFit}
                        sold={a.sold}
                        soldLabel={t("sold")}
                        viewLabel={viewPaintingLabel}
                        sizes="280px"
                        titleAs="h3"
                      />
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
            const meta = artworkCatalogMeta(a, locale);
            return (
              <li key={a.id} className="flex flex-col">
                <GalleryArtworkListingCard
                  href={`/gallery/${a.slug}`}
                  title={title}
                  image={a.image}
                  meta={meta}
                  price={price}
                  listingImageClass={listingImageClass}
                  galleryImageFit={galleryImageFit}
                  sold={a.sold}
                  soldLabel={t("sold")}
                  viewLabel={viewPaintingLabel}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  titleAs="h2"
                />
                {!a.sold ? (
                  <ArtworkInquiryLink
                    href={inquiryHref(title, a.slug)}
                    className="link-cta mt-4 inline-block text-xs uppercase tracking-editorial"
                  >
                    {t("inquiryCta")}
                  </ArtworkInquiryLink>
                ) : null}
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
    </PageShell>
  );
}
