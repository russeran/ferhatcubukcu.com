import { getTranslations } from "next-intl/server";
import { readSettings } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const settings = await readSettings();
  const bio = locale === "tr" ? settings.bioTr : settings.bioEn;

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 md:py-24">
      <p className="text-xs uppercase tracking-[0.35em] text-patina">
        {locale === "tr" ? "Biyografi" : "Biography"}
      </p>
      <h1 className="mt-4 font-serif text-4xl text-umber-deep md:text-5xl">
        {t("title")}
      </h1>
      <div className="mt-10 space-y-6 text-base leading-relaxed text-umber/80 md:text-lg">
        {bio.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
