import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localeAlternates } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { getSessionFromCookies } from "@/lib/auth";
import { PublicListAdminToolbar } from "@/components/admin/PublicListAdminToolbar";
import { PublicResourceAdminActions } from "@/components/admin/PublicResourceAdminActions";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
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
    <PageShell className="md:py-20">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        lead={t("intro")}
        className="mb-6"
      />

      {isAdmin ? <PublicListAdminToolbar locale={locale} variant="news" /> : null}

      {list.length === 0 ? (
        <p className="text-empty mt-12">{t("empty")}</p>
      ) : (
        <ul className="divider-section mt-12 space-y-12">
          {list.map((p) => {
            const title = resolvedNewsTitle(p, locale);
            const excerpt = resolvedNewsExcerpt(p, locale);
            return (
              <li key={p.id}>
                <article className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,12rem)] sm:items-start sm:gap-8">
                  <div className="order-2 min-w-0 sm:order-1">
                    <p className="text-meta">{kindLabels[p.kind]}</p>
                    <h2 className="page-subsection-title mt-2">
                      <Link
                        href={`/press/${p.slug}`}
                        className="text-ink underline-offset-4 hover:text-goldleaf hover:underline"
                      >
                        {title}
                      </Link>
                    </h2>
                    <p className="text-caption mt-3 sm:text-base">{excerpt}</p>
                    <p className="mt-4">
                      <Link href={`/press/${p.slug}`} className="link-inline">
                        {t("readMore")}
                      </Link>
                      {p.externalUrl ? (
                        <>
                          <span className="mx-2 text-ink-faint/50">·</span>
                          <a
                            href={p.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-inline"
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
    </PageShell>
  );
}
