import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { InstagramFeedGrid } from "@/components/InstagramFeedGrid";
import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";
import { fetchInstagramFeed } from "@/lib/instagram-feed";
import { readSettings } from "@/lib/data";
import { localeAlternates } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import type { SiteSettings } from "@/lib/types";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

function instagramProfileHref(settings: SiteSettings): string {
  const ig = settings.instagram?.trim();
  if (!ig) return "https://www.instagram.com/";
  if (ig.startsWith("http")) return ig;
  return `https://instagram.com/${ig.replace("@", "")}`;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const title = messages.socialPage.title as string;
  const description = messages.socialPage.seoDescription as string;
  return {
    title,
    description,
    alternates: localeAlternates("/social", locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/social`),
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

export default async function SocialMediaPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "socialPage" });
  const settings = await readSettings();
  const profileUrl = instagramProfileHref(settings);
  const feed = await fetchInstagramFeed();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-14 md:py-24">
      <div className="flex flex-col gap-4 border-b border-umber/10 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-[10px] uppercase tracking-[0.38em] text-patina sm:text-[11px]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:mt-4 sm:text-4xl md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-umber/75 sm:text-lg">
            {t("intro")}
          </p>
        </div>
        <TrackedOutboundLink
          event="instagram_profile_click"
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 self-start rounded-sm border border-umber/20 bg-parchment/90 px-5 py-2.5 text-sm font-medium text-ink underline-offset-4 transition hover:border-goldleaf/50 hover:text-oxide md:self-auto"
        >
          {t("profileCta")}
        </TrackedOutboundLink>
      </div>

      <div className="mt-10">
        {feed.status === "ok" && feed.items.length > 0 ? (
          <InstagramFeedGrid items={feed.items} videoLabel={t("videoBadge")} />
        ) : null}

        {feed.status === "ok" && feed.items.length === 0 ? (
          <p className="max-w-xl text-umber/70">{t("emptyPosts")}</p>
        ) : null}

        {feed.status === "missing_env" ? (
          <div className="max-w-2xl space-y-4 rounded-sm border border-umber/12 bg-parchment/80 p-6 text-sm leading-relaxed text-umber/80 sm:p-8 sm:text-base">
            <p className="font-medium text-ink">{t("configureTitle")}</p>
            <p>{t("configureP1")}</p>
            <p>{t("configureP2")}</p>
            <p className="text-umber/65">{t("configureP3")}</p>
          </div>
        ) : null}

        {feed.status === "error" ? (
          <div className="max-w-2xl space-y-4 rounded-sm border border-oxide/25 bg-oxide/5 p-6 text-sm leading-relaxed text-umber/85 sm:p-8 sm:text-base">
            <p className="font-medium text-ink">{t("loadErrorTitle")}</p>
            <p>{t("loadErrorHint")}</p>
            <p className="font-mono text-xs text-umber/60">{feed.message}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
