import { getTranslations } from "next-intl/server";
import { readSettings } from "@/lib/data";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const settings = await readSettings();
  const note =
    locale === "tr" ? settings.studioNoteTr : settings.studioNoteEn;

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 md:py-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-patina">
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
                className="text-lg text-patina hover:text-patina-light underline-offset-4 hover:underline"
              >
                {settings.instagram}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
