import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const title = messages.studioPage.title as string;
  const description = messages.studioPage.seoDescription as string;
  return {
    title,
    description,
    alternates: localeAlternates("/studio", locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/studio`),
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

const BLOCK_KEYS = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;

export default async function StudioPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "studioPage" });

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 py-14 sm:px-5 sm:py-16 md:py-24">
      <div className="gold-rule mb-6" aria-hidden />
      <p className="editorial-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl md:text-5xl">
        {t("title")}
      </h1>
      <p className="prose-atelier mt-6 text-lg text-umber/80">
        {t("intro")}
      </p>
      <div className="mt-14 space-y-12 border-t border-umber/10 pt-14">
        {BLOCK_KEYS.map((key) => (
          <section key={key}>
            <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">
              {t(`${key}Title` as "b1Title")}
            </h2>
            <p className="prose-atelier mt-3 whitespace-pre-wrap text-umber/75">
              {t(`${key}Body` as "b1Body")}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
