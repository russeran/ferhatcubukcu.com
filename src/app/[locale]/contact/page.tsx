import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
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

  return (
    <PageShell>
      <PageHeader eyebrow={t("studio")} title={t("title")} lead={t("reachOut")} />
      {note ? <p className="text-caption mt-4 max-w-xl">{note}</p> : null}
      <dl className="divider-section mt-12 space-y-8">
        <div>
          <dt className="text-label">{t("email")}</dt>
          <dd className="mt-2">
            <TrackedOutboundLink
              event="contact_email_click"
              href={`mailto:${settings.contactEmail}`}
              className="link-inline-lg break-words"
            >
              {settings.contactEmail}
            </TrackedOutboundLink>
          </dd>
        </div>
        {settings.instagram ? (
          <div>
            <dt className="text-label">{t("instagram")}</dt>
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
                className="link-inline-lg break-words"
              >
                {settings.instagram}
              </TrackedOutboundLink>
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="prose-atelier divider-section mt-12 space-y-4 text-sm">
        <p>{t("trustShipping")}</p>
        <p>{t("trustOrdering")}</p>
      </div>
    </PageShell>
  );
}
