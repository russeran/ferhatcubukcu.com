import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeHeroSection } from "@/components/HomeHeroSection";
import { HomeJsonLd } from "@/components/HomeJsonLd";
import { FavoriteStamp } from "@/components/FavoriteStamp";
import { SoldStamp } from "@/components/SoldStamp";
import { artworksWithFavoritesFirst } from "@/lib/gallery-favorites";
import { localeAlternates } from "@/lib/seo-helpers";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site-url";
import { readArtworks, readNewsPosts, readSettings } from "@/lib/data";
import { resolvedNewsExcerpt, resolvedNewsTitle } from "@/lib/news-display";
import { resolvedArtworkPrice } from "@/lib/artwork-price";

type Props = { params: Promise<{ locale: string }> };

/** Fresh artworks/settings after admin edits (avoid stale static cache). */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const settings = await readSettings();
  const title = messages.meta.title as string;
  const description = messages.meta.description as string;
  const hero = settings.heroImage || "/hero-placeholder.svg";
  const ogImage = hero.startsWith("http")
    ? hero
    : absoluteUrl(hero.startsWith("/") ? hero : `/${hero}`);
  return {
    title: { absolute: title },
    description,
    alternates: localeAlternates("", locale),
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/${locale}`),
      siteName: "Ferhat Çubukçu",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      type: "website",
      images: [{ url: ogImage, alt: messages.home.heroAlt as string }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tg = await getTranslations({ locale, namespace: "gallery" });
  const settings = await readSettings();
  const allPublished = (await readArtworks())
    .filter((a) => a.published)
    .sort((a, b) => a.order - b.order);
  const favoritesFirst = artworksWithFavoritesFirst(allPublished);
  const favoriteLabel = tg("artistFavorite");
  const heroSlides = favoritesFirst.slice(0, 10).map((a) => ({
    image: a.image,
    slug: a.slug,
    title: locale === "tr" ? a.titleTr : a.titleEn,
    favorite: Boolean(a.favorite),
  }));
  const artworks = favoritesFirst.slice(0, 6);

  const newsTeaser = (await readNewsPosts())
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  const pressTeaser = (settings.pressQuotes ?? []).filter((q) => {
    const txt = locale === "tr" ? q.quoteTr : q.quoteEn;
    return Boolean(txt?.trim());
  }).slice(0, 3);

  const tagline =
    locale === "tr" ? settings.taglineTr : settings.taglineEn;

  return (
    <>
      <HomeJsonLd locale={locale} settings={settings} />
      <HomeHeroSection
        locale={locale}
        settings={settings}
        heroSlides={heroSlides}
        tagline={tagline}
      />

      {newsTeaser.length > 0 ? (
        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="editorial-eyebrow">{t("newsTeaser")}</p>
                <h2 className="page-section-title mt-3 text-balance">
                  {t("newsTeaserSubtitle")}
                </h2>
              </div>
              <Link
                href="/press"
                className="link-cta sm:shrink-0"
              >
                {t("newsViewAll")}
              </Link>
            </div>
            <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {newsTeaser.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/press/${p.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-sm border border-umber/12 bg-gradient-to-br from-parchment/98 via-parchment-warm/90 to-parchment-dark/25 shadow-[inset_0_1px_0_rgba(255,252,245,0.55)] ring-1 ring-umber/8 backdrop-blur-sm transition duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-goldleaf/35 hover:shadow-gallery hover:ring-goldleaf/25"
                  >
                    {p.image ? (
                      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-parchment-dark">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          className="object-cover transition duration-700 ease-out-expo group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="page-card-title text-lg">
                        {resolvedNewsTitle(p, locale)}
                      </h3>
                      <p className="text-caption mt-2 line-clamp-3">
                        {resolvedNewsExcerpt(p, locale)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {pressTeaser.length > 0 ? (
        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-5">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="editorial-eyebrow">{t("pressTeaser")}</p>
                <h2 className="page-section-title mt-3 text-balance">
                  {t("pressTeaserSubtitle")}
                </h2>
              </div>
              <Link
                href="/press"
                className="link-cta sm:shrink-0"
              >
                {t("pressViewAll")}
              </Link>
            </div>
            <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
              {pressTeaser.map((q) => {
                const quote = locale === "tr" ? q.quoteTr : q.quoteEn;
                const attr = locale === "tr" ? q.attributionTr : q.attributionEn;
                return (
                  <li key={q.id}>
                    <blockquote className="font-serif text-xl font-medium leading-snug text-ink sm:text-2xl md:text-[1.65rem]">
                      “{quote}”
                    </blockquote>
                    <p className="text-caption mt-4 font-medium">{attr}</p>
                    {q.url?.trim() ? (
                      <a
                        href={q.url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-cta mt-2 inline-block text-xs uppercase tracking-editorial"
                      >
                        {locale === "tr" ? "Kaynak" : "Source"}
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="pb-12 pt-10 sm:pb-14 sm:pt-12 md:pb-16 md:pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="max-w-2xl">
            <h2 className="page-section-title text-balance md:text-4xl">
              {t("featuredTitle")}
            </h2>
            <p className="text-caption mt-3 max-w-xl text-pretty md:text-base">
              {t("featuredSubtitle")}
            </p>
          </div>
          <Link
            href="/gallery"
            className="link-cta shrink-0 sm:self-end md:inline md:self-auto"
          >
            {locale === "tr" ? "Tümü" : "View all"}
          </Link>
        </div>
        {artworks.length === 0 ? (
          <p className="text-empty">
            {locale === "tr"
              ? "Henüz yayınlanmış eser yok."
              : "No published paintings yet."}
          </p>
        ) : (
          <ul className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-14">
            {artworks.map((a, i) => {
              const price = resolvedArtworkPrice(a, locale);
              return (
              <li
                key={a.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <Link href={`/gallery/${a.slug}`} className="group block">
                  <div
                    className={cn(
                      "gallery-image-frame gallery-image-frame-hover relative aspect-[4/5]",
                      a.favorite && "gallery-image-frame-favorite"
                    )}
                  >
                    <Image
                      src={a.image}
                      alt={locale === "tr" ? a.titleTr : a.titleEn}
                      fill
                      className="object-cover transition duration-[1100ms] ease-out-expo motion-safe:group-hover:scale-[1.035]"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    {a.sold ? <SoldStamp label={tg("sold")} /> : null}
                    {a.favorite ? <FavoriteStamp label={favoriteLabel} /> : null}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/35 via-umber-deep/5 to-transparent opacity-0 transition duration-500 ease-out-expo group-hover:opacity-100" />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                      {a.favorite ? (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-goldleaf sm:text-xs">
                          {favoriteLabel}
                        </p>
                      ) : null}
                      <p
                        className={cn(
                          "page-card-title sm:text-xl",
                          a.favorite && "text-goldleaf/95"
                        )}
                      >
                        {locale === "tr" ? a.titleTr : a.titleEn}
                      </p>
                      {a.year ? (
                        <p className="text-meta font-mono">
                          {a.year}
                        </p>
                      ) : null}
                      {price ? (
                        <p className="mt-1 text-sm font-medium text-ink/90">
                          {price}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
              );
            })}
          </ul>
        )}
        </div>
      </section>
    </>
  );
}
