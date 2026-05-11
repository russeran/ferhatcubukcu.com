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
        <div className="absolute inset-0 bg-gradient-to-br from-parchment via-parchment-dark to-parchment opacity-90" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="animate-fade-up space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-patina">
              {t("studio")}
            </p>
            <h1 className="font-serif text-4xl leading-tight text-umber-deep md:text-5xl lg:text-[3.25rem]">
              {settings.artistName}
            </h1>
            <p className="max-w-md text-lg text-umber/85 md:text-xl">{tagline}</p>
            <p className="max-w-xl text-sm leading-relaxed text-umber/65 md:text-base">
              {t("statementLead")}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/gallery"
                className="inline-flex items-center justify-center rounded-full bg-umber-deep px-7 py-3 text-sm font-medium text-parchment shadow-sm transition hover:bg-oxide"
              >
                {t("viewWork")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-umber/25 px-7 py-3 text-sm font-medium text-umber-deep transition hover:border-oxide/50 hover:text-oxide"
              >
                {locale === "tr" ? "İletişim" : "Contact"}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full animate-fade-up overflow-hidden rounded-sm shadow-[0_24px_80px_-24px_rgba(60,40,30,0.35)] ring-1 ring-umber/10 md:aspect-[5/4]">
            <Image
              src={settings.heroImage || "/hero-placeholder.svg"}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(242,235,227,0.15),transparent_40%,transparent)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="mb-10 flex items-end justify-between gap-6 border-b border-umber/10 pb-6">
          <div>
            <h2 className="font-serif text-2xl text-umber-deep md:text-3xl">
              {locale === "tr" ? "Seçili çalışmalar" : "Selected works"}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-umber/60">
              {locale === "tr"
                ? "Galeride tam koleksiyonu görebilirsiniz."
                : "See the full collection in the gallery."}
            </p>
          </div>
          <Link
            href="/gallery"
            className="hidden text-sm text-patina underline-offset-4 hover:underline md:inline"
          >
            {locale === "tr" ? "Tümü" : "View all"}
          </Link>
        </div>
        {artworks.length === 0 ? (
          <p className="text-umber/55">
            {locale === "tr"
              ? "Henüz yayınlanmış eser yok."
              : "No published works yet."}
          </p>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((a, i) => (
              <li
                key={a.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <Link href={`/gallery/${a.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-parchment-dark ring-1 ring-umber/10">
                    <Image
                      src={a.image}
                      alt={locale === "tr" ? a.titleTr : a.titleEn}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg text-umber-deep">
                        {locale === "tr" ? a.titleTr : a.titleEn}
                      </p>
                      {a.year ? (
                        <p className="text-xs uppercase tracking-wider text-umber/45">
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
