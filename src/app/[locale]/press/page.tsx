import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localeAlternates } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { getSessionFromCookies } from "@/lib/auth";
import { PublicListAdminToolbar } from "@/components/admin/PublicListAdminToolbar";
import { PublicResourceAdminActions } from "@/components/admin/PublicResourceAdminActions";
import { readNewsPosts } from "@/lib/data";
import {
  resolvedNewsExcerpt,
  resolvedNewsTitle,
} from "@/lib/news-display";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const title = messages.press.title as string;
  const description = messages.press.seoDescription as string;
  return {
    title,
    description,
    alternates: localeAlternates("/press", locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/press`),
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

export default async function PressIndexPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "press" });
  const isAdmin = Boolean(await getSessionFromCookies());
  const kindLabels = {
    news: t("kind_news"),
    social: t("kind_social"),
    press: t("kind_press"),
    studio: t("kind_studio"),
  } as const;
  const list = (await readNewsPosts())
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-14 md:py-20">
      <p className="font-serif text-[10px] uppercase tracking-[0.38em] text-patina sm:text-[11px]">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
        {t("title")}
      </h1>
      <p className="prose-atelier mt-4 text-sm text-umber/65 sm:mt-5 sm:text-base">
        {t("intro")}
      </p>

      {isAdmin ? <PublicListAdminToolbar locale={locale} variant="news" /> : null}

      {list.length === 0 ? (
        <p className="mt-12 text-umber/60">{t("empty")}</p>
      ) : (
        <ul className="mt-12 space-y-12 border-t border-umber/10 pt-12">
          {list.map((p) => {
            const title = resolvedNewsTitle(p, locale);
            const excerpt = resolvedNewsExcerpt(p, locale);
            return (
              <li key={p.id}>
                <article className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,12rem)] sm:items-start sm:gap-8">
                  <div className="order-2 min-w-0 sm:order-1">
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-umber/50">
                      {kindLabels[p.kind]}
                    </p>
                    <h2 className="mt-2 font-serif text-xl font-semibold text-ink sm:text-2xl">
                      <Link
                        href={`/press/${p.slug}`}
                        className="text-ink underline-offset-4 hover:text-oxide hover:underline"
                      >
                        {title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-umber/75 sm:text-base">
                      {excerpt}
                    </p>
                    <p className="mt-4">
                      <Link
                        href={`/press/${p.slug}`}
                        className="text-sm font-medium text-oxide underline-offset-4 hover:underline"
                      >
                        {t("readMore")}
                      </Link>
                      {p.externalUrl ? (
                        <>
                          <span className="mx-2 text-umber/35">·</span>
                          <a
                            href={p.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-patina underline-offset-4 hover:text-oxide hover:underline"
                          >
                            {t("openExternal")}
                          </a>
                        </>
                      ) : null}
                    </p>
                    {isAdmin ? (
                      <PublicResourceAdminActions
                        locale={locale}
                        kind="news"
                        id={p.id}
                        className="mt-3"
                      />
                    ) : null}
                  </div>
                  {p.image ? (
                    <Link
                      href={`/press/${p.slug}`}
                      className="relative order-1 aspect-[5/4] w-full overflow-hidden rounded-lg bg-parchment-dark shadow-sm ring-1 ring-umber/10 sm:order-2 sm:aspect-square sm:max-w-none"
                    >
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 168px"
                      />
                    </Link>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
