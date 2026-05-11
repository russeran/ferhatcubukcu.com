import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { readArtworks, readSettings } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const settings = await readSettings();
  const artworks = (await readArtworks())
    .filter((a) => a.published)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  const tagline =
    locale === "tr" ? settings.taglineTr : settings.taglineEn;

  return (
    <>
      <section className="relative overflow-hidden border-b border-umber/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 to-transparent" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-28">
          <div className="animate-fade-up space-y-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-patina">
              {t("studio")}
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-umber-deep md:text-5xl lg:text-[3.1rem]">
              {settings.artistName}
            </h1>
            <p className="max-w-md text-lg text-umber/90 md:text-xl">{tagline}</p>
            <p className="max-w-xl text-sm leading-relaxed text-umber/70 md:text-base">
              {t("statementLead")}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-md bg-umber-deep px-7 py-3 text-sm font-semibold text-parchment shadow-sm transition hover:bg-oxide"
              >
                {t("viewWork")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-umber/20 bg-white/60 px-7 py-3 text-sm font-medium text-umber-deep backdrop-blur-sm transition hover:border-oxide/40 hover:text-oxide"
              >
                {locale === "tr" ? "İletişim" : "Contact"}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full animate-fade-up overflow-hidden rounded-lg bg-white shadow-[0_32px_80px_-32px_rgba(15,23,42,0.35)] ring-1 ring-umber/10 md:aspect-[5/4]">
            <Image
              src={settings.heroImage || "/hero-placeholder.svg"}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.35),transparent_45%,transparent)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="mb-12 flex items-end justify-between gap-6 border-b border-umber/10 pb-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-umber-deep md:text-3xl">
              {locale === "tr" ? "Öne çıkanlar" : "Featured projects"}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-umber/60">
              {locale === "tr"
                ? "Tüm çalışmaları Work bölümünde listeleyebilirsiniz."
                : "Browse the full list on the Work page."}
            </p>
          </div>
          <Link
            href="/gallery"
            className="hidden text-sm font-medium text-oxide underline-offset-4 hover:underline md:inline"
          >
            {locale === "tr" ? "Tümü" : "View all"}
          </Link>
        </div>
        {artworks.length === 0 ? (
          <p className="text-umber/55">
            {locale === "tr"
              ? "Henüz yayınlanmış proje yok."
              : "No published projects yet."}
          </p>
        ) : (
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((a, i) => (
              <li
                key={a.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <Link href={`/gallery/${a.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-umber/10 transition-shadow group-hover:shadow-md">
                    <Image
                      src={a.image}
                      alt={locale === "tr" ? a.titleTr : a.titleEn}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg font-medium text-umber-deep">
                        {locale === "tr" ? a.titleTr : a.titleEn}
                      </p>
                      {a.year ? (
                        <p className="text-xs font-mono uppercase tracking-wider text-umber/45">
                          {a.year}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
