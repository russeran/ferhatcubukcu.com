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
  const title = messages.contact.title as string;
  const description = messages.contact.seoDescription as string;
  return {
    title,
    description,
    alternates: localeAlternates("/contact", locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/contact`),
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

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const settings = await readSettings();
  const note =
    locale === "tr" ? settings.studioNoteTr : settings.studioNoteEn;
  const behanceUrl =
    settings.behance?.trim() || "https://www.behance.net/ferhat_cubukcu";

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 md:py-24">
      <p className="font-serif text-[11px] uppercase tracking-[0.38em] text-patina">
        {t("studio")}
      </p>
      <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-umber-deep md:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-8 max-w-xl text-lg text-umber/75">{t("reachOut")}</p>
      {note ? (
        <p className="mt-4 max-w-xl text-sm text-umber/60">{note}</p>
      ) : null}
      <dl className="mt-12 space-y-8 border-t border-umber/10 pt-12">
        <div>
          <dt className="text-xs uppercase tracking-[0.25em] text-umber/45">
            {t("email")}
          </dt>
          <dd className="mt-2">
            <a
              href={`mailto:${settings.contactEmail}`}
              className="text-lg text-oxide hover:text-umber-deep underline-offset-4 hover:underline"
            >
              {settings.contactEmail}
            </a>
          </dd>
        </div>
        {settings.instagram ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.25em] text-umber/45">
              {t("instagram")}
            </dt>
            <dd className="mt-2">
              <a
                href={
                  settings.instagram.startsWith("http")
                    ? settings.instagram
                    : `https://instagram.com/${settings.instagram.replace("@", "")}`
                }
                target="_blank"
                rel="noreferrer"
                className="text-lg text-patina hover:text-oxide underline-offset-4 hover:underline"
              >
                {settings.instagram}
              </a>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs uppercase tracking-[0.25em] text-umber/45">
            {t("behance")}
          </dt>
          <dd className="mt-2">
            <a
              href={behanceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-medium text-oxide underline-offset-4 hover:underline"
            >
              {t("behanceLink")}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
