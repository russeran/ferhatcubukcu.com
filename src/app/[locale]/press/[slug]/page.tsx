import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { localeAlternates, seoTruncate } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { getSessionFromCookies } from "@/lib/auth";
import { PublicResourceAdminActions } from "@/components/admin/PublicResourceAdminActions";
import { readNewsPosts } from "@/lib/data";
import {
  resolvedNewsBody,
  resolvedNewsTitle,
} from "@/lib/news-display";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const list = await readNewsPosts();
  const post = list.find((p) => p.slug === slug && p.published);
  if (!post) {
    return { title: "Press" };
  }
  const title = resolvedNewsTitle(post, locale);
  const body = resolvedNewsBody(post, locale);
  const description = seoTruncate(body || title);
  const imageUrl = post.image
    ? post.image.startsWith("http")
      ? post.image
      : absoluteUrl(
          post.image.startsWith("/") ? post.image : `/${post.image}`
        )
    : undefined;

  return {
    title,
    description,
    alternates: localeAlternates(`/press/${slug}`, locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/press/${slug}`),
      siteName: "Ferhat Çubukçu",
      type: "article",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Ferhat Çubukçu`,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function PressPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "press" });
  const kindLabels = {
    news: t("kind_news"),
    social: t("kind_social"),
    press: t("kind_press"),
    studio: t("kind_studio"),
  } as const;
  const list = await readNewsPosts();
  const post = list.find((p) => p.slug === slug && p.published);
  if (!post) notFound();
  const isAdmin = Boolean(await getSessionFromCookies());

  const title = resolvedNewsTitle(post, locale);
  const body = resolvedNewsBody(post, locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-14 md:py-20">
      <Link
        href="/press"
        className="accent-link-plain text-sm font-medium"
      >
        ← {t("title")}
      </Link>

      {isAdmin ? (
        <PublicResourceAdminActions
          locale={locale}
          kind="news"
          id={post.id}
          className="mt-4"
        />
      ) : null}

      <header className="mt-8 border-b border-umber/10 pb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-umber/50">
          {kindLabels[post.kind]}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-xs text-umber/50">
          {new Date(post.createdAt).toLocaleDateString(
            locale === "tr" ? "tr-TR" : "en-GB",
            { year: "numeric", month: "long", day: "numeric" }
          )}
        </p>
      </header>

      {post.image ? (
        <div className="relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-lg bg-parchment-dark shadow-sm ring-1 ring-umber/10">
          <Image
            src={post.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 42rem"
            priority
          />
        </div>
      ) : null}

      <div className="prose prose-neutral mx-auto mt-10 max-w-prose prose-p:text-umber/80 prose-p:leading-relaxed">
        <p className="whitespace-pre-wrap">{body}</p>
      </div>

      {post.externalUrl ? (
        <p className="mt-10">
          <a
            href={post.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-outline-btn px-6 py-3 text-sm"
          >
            {t("openExternal")}
          </a>
        </p>
      ) : null}
    </article>
  );
}
