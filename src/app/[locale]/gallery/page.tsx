import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localeAlternates } from "@/lib/seo-helpers";
import { absoluteUrl } from "@/lib/site-url";
import { readArtworks } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../../messages/${locale}.json`)).default;
  const title = messages.nav.gallery as string;
  const description = messages.gallery.seoDescription as string;
  return {
    title,
    description,
    alternates: localeAlternates("/gallery", locale),
    openGraph: {
      title: `${title} · Ferhat Çubukçu`,
      description,
      url: absoluteUrl(`/${locale}/gallery`),
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

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  const list = (await readArtworks())
    .filter((a) => a.published)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <header className="mb-12 max-w-2xl">
        <p className="font-serif text-[11px] uppercase tracking-[0.38em] text-patina">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-umber-deep md:text-5xl">
          {t("title")}
        </h1>
      </header>
      {list.length === 0 ? (
        <p className="text-umber/60">{t("empty")}</p>
      ) : (
        <ul className="grid gap-x-10 gap-y-14 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id}>
              <Link href={`/gallery/${a.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-parchment-dark shadow-sm ring-1 ring-umber/12">
                  <Image
                    src={a.image}
                    alt={locale === "tr" ? a.titleTr : a.titleEn}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="mt-5 space-y-1">
                  <h2 className="font-serif text-2xl font-medium text-umber-deep">
                    {locale === "tr" ? a.titleTr : a.titleEn}
                  </h2>
                  <p className="text-sm text-umber/55">
                    {[a.year, locale === "tr" ? a.mediumTr : a.mediumEn]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
