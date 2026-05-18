import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
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
    <PageShell>
      <PageHeader
        eyebrow={locale === "tr" ? "Biyografi" : "Biography"}
        title={t("title")}
      />
      <div className="prose-atelier mx-auto space-y-5 text-base sm:space-y-6 sm:text-lg">
        {bio.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </PageShell>
  );
}
