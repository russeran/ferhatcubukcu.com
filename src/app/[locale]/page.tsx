import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeHeroSection } from "@/components/HomeHeroSection";
import { HomeJsonLd } from "@/components/HomeJsonLd";
import { SoldStamp } from "@/components/SoldStamp";
import { localeAlternates } from "@/lib/seo-helpers";
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
  const heroSlides = allPublished.slice(0, 10).map((a) => ({
    image: a.image,
    slug: a.slug,
    title: locale === "tr" ? a.titleTr : a.titleEn,
  }));
  const artworks = allPublished.slice(0, 6);

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
        <section className="border-b border-umber/15 bg-[#ebe4d8]/92 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-5">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="gold-rule mb-4" aria-hidden />
                <p className="editorial-eyebrow">{t("newsTeaser")}</p>
                <h2 className="mt-3 text-balance font-serif text-2xl font-semibold text-umber-deep sm:text-3xl">
                  {t("newsTeaserSubtitle")}
                </h2>
              </div>
              <Link
                href="/news"
                className="text-sm font-semibold tracking-wide text-oxide underline-offset-[6px] transition hover:text-umber-deep hover:underline sm:shrink-0"
              >
                {t("newsViewAll")}
              </Link>
            </div>
            <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {newsTeaser.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/news/${p.slug}`}
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
                      <h3 className="font-serif text-lg font-medium text-umber-deep transition-colors duration-300 group-hover:text-oxide">
                        {resolvedNewsTitle(p, locale)}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-umber/70">
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
        <section className="border-b border-umber/15 bg-parchment/98 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-5">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="gold-rule mb-4" aria-hidden />
                <p className="editorial-eyebrow">{t("pressTeaser")}</p>
                <h2 className="mt-3 text-balance font-serif text-2xl font-semibold text-umber-deep sm:text-3xl">
                  {t("pressTeaserSubtitle")}
                </h2>
              </div>
              <Link
                href="/press"
                className="text-sm font-semibold tracking-wide text-oxide underline-offset-[6px] transition hover:text-umber-deep hover:underline sm:shrink-0"
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
                    <div className="gold-rule mb-4" aria-hidden />
                    <blockquote className="font-serif text-xl font-medium leading-snug text-umber-deep sm:text-2xl md:text-[1.65rem]">
                      “{quote}”
                    </blockquote>
                    <p className="mt-4 text-sm font-medium text-umber/55">{attr}</p>
                    {q.url?.trim() ? (
                      <a
                        href={q.url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs font-semibold uppercase tracking-editorial text-oxide hover:underline"
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

      <section className="border-b border-umber/10 bg-gradient-to-b from-parchment-dark/30 via-transparent to-transparent py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="mb-10 flex flex-col gap-6 border-b border-umber/10 pb-10 sm:mb-14 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pb-12">
          <div className="max-w-2xl">
            <div className="gold-rule mb-5" aria-hidden />
            <h2 className="text-balance font-serif text-2xl font-semibold text-umber-deep sm:text-3xl md:text-4xl">
              {t("featuredTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-umber/58 md:text-base">
              {t("featuredSubtitle")}
            </p>
          </div>
          <Link
            href="/gallery"
            className="shrink-0 text-sm font-semibold tracking-wide text-oxide underline-offset-[6px] transition hover:text-umber-deep hover:underline sm:self-end md:inline md:self-auto"
          >
            {locale === "tr" ? "Tümü" : "View all"}
          </Link>
        </div>
        {artworks.length === 0 ? (
          <p className="text-umber/55">
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
                  <div className="gallery-image-frame gallery-image-frame-hover relative aspect-[4/5]">
                    <Image
                      src={a.image}
                      alt={locale === "tr" ? a.titleTr : a.titleEn}
                      fill
                      className="object-cover transition duration-[1100ms] ease-out-expo motion-safe:group-hover:scale-[1.035]"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    {a.sold ? <SoldStamp label={tg("sold")} /> : null}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/35 via-umber-deep/5 to-transparent opacity-0 transition duration-500 ease-out-expo group-hover:opacity-100" />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg font-medium text-umber-deep transition-colors duration-300 group-hover:text-oxide sm:text-xl">
                        {locale === "tr" ? a.titleTr : a.titleEn}
                      </p>
                      {a.year ? (
                        <p className="text-xs font-mono uppercase tracking-wider text-umber/45">
                          {a.year}
                        </p>
                      ) : null}
                      {price ? (
                        <p className="mt-1 text-sm font-medium text-umber-deep/90">
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
