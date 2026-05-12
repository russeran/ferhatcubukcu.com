import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { readSettings } from "@/lib/data";
import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";

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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-5 sm:py-14 md:py-24">
      <p className="font-serif text-[10px] uppercase tracking-[0.38em] text-patina sm:text-[11px]">
        {t("studio")}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-umber-deep sm:mt-4 sm:text-4xl md:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-6 max-w-xl text-base text-umber/75 sm:mt-8 sm:text-lg">
        {t("reachOut")}
      </p>
      {note ? (
        <p className="mt-4 max-w-xl text-sm text-umber/60">{note}</p>
      ) : null}
      <dl className="mt-12 space-y-8 border-t border-umber/10 pt-12">
        <div>
          <dt className="text-xs uppercase tracking-[0.25em] text-umber/45">
            {t("email")}
          </dt>
          <dd className="mt-2">
            <TrackedOutboundLink
              event="contact_email_click"
              href={`mailto:${settings.contactEmail}`}
              className="break-words text-base text-oxide hover:text-umber-deep underline-offset-4 hover:underline sm:text-lg"
            >
              {settings.contactEmail}
            </TrackedOutboundLink>
          </dd>
        </div>
        {settings.instagram ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.25em] text-umber/45">
              {t("instagram")}
            </dt>
            <dd className="mt-2">
              <TrackedOutboundLink
                event="contact_instagram_click"
                href={
                  settings.instagram.startsWith("http")
                    ? settings.instagram
                    : `https://instagram.com/${settings.instagram.replace("@", "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="break-words text-base text-patina hover:text-oxide underline-offset-4 hover:underline sm:text-lg"
              >
                {settings.instagram}
              </TrackedOutboundLink>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs uppercase tracking-[0.25em] text-umber/45">
            {t("behance")}
          </dt>
          <dd className="mt-2">
            <TrackedOutboundLink
              event="contact_behance_click"
              href={behanceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words text-base font-medium text-oxide underline-offset-4 hover:underline sm:text-lg"
            >
              {t("behanceLink")}
            </TrackedOutboundLink>
          </dd>
        </div>
      </dl>
      <div className="mt-12 space-y-4 border-t border-umber/10 pt-10 text-sm leading-relaxed text-umber/65">
        <p>{t("trustShipping")}</p>
        <p>{t("trustOrdering")}</p>
      </div>
    </div>
  );
}
