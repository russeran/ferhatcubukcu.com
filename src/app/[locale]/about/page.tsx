import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { readSettings } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const title = messages.about.title as string;
  const description = messages.about.seoDescription as string;
  return {
    title,
    description,
    alternates: localeAlternates("/about", locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/about`),
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

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const settings = await readSettings();
  const bio = locale === "tr" ? settings.bioTr : settings.bioEn;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-14 md:py-24">
      <p className="font-serif text-[10px] uppercase tracking-[0.38em] text-patina sm:text-[11px]">
        {locale === "tr" ? "Biyografi" : "Biography"}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-umber-deep sm:mt-4 sm:text-4xl md:text-5xl">
        {t("title")}
      </h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-umber/80 sm:mt-10 sm:space-y-6 sm:text-lg">
        {bio.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
