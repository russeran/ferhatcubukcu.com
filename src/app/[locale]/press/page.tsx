import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { readSettings } from "@/lib/data";
import type { PressQuote } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const title = messages.pressPage.title as string;
  const description = messages.pressPage.seoDescription as string;
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

function hasQuote(q: PressQuote, locale: string) {
  const text = locale === "tr" ? q.quoteTr : q.quoteEn;
  return Boolean(text?.trim());
}

export default async function PressPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pressPage" });
  const settings = await readSettings();
  const quotes = (settings.pressQuotes ?? []).filter((q) =>
    hasQuote(q, locale)
  );

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 py-14 sm:px-5 sm:py-16 md:py-24">
      <div className="gold-rule mb-6" aria-hidden />
      <p className="editorial-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 text-balance font-serif text-3xl font-semibold tracking-tight text-umber-deep sm:text-4xl md:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-umber/75">
        {t("intro")}
      </p>

      {quotes.length === 0 ? (
        <p className="mt-12 text-umber/55">{t("empty")}</p>
      ) : (
        <ul className="mt-14 space-y-10 border-t border-umber/10 pt-14">
          {quotes.map((q) => {
            const quote = locale === "tr" ? q.quoteTr : q.quoteEn;
            const attr = locale === "tr" ? q.attributionTr : q.attributionEn;
            return (
              <li
                key={q.id}
                className="rounded-md border border-umber/10 bg-parchment/90 p-6 shadow-sm sm:p-8"
              >
                <blockquote className="font-serif text-lg leading-snug text-umber-deep sm:text-xl">
                  “{quote}”
                </blockquote>
                <p className="mt-4 text-sm font-medium text-umber/60">{attr}</p>
                {q.image ? (
                  <div className="relative mt-6 h-16 w-auto max-w-[200px]">
                    <Image
                      src={q.image}
                      alt=""
                      width={200}
                      height={64}
                      className="object-contain object-left"
                      unoptimized
                    />
                  </div>
                ) : null}
                {q.url?.trim() ? (
                  <a
                    href={q.url.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-semibold text-oxide underline-offset-4 hover:underline"
                  >
                    {t("readSource")}
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
