import { getTranslations } from "next-intl/server";
import { readSettings } from "@/lib/data";

const DEFAULT_BEHANCE = "https://www.behance.net/ferhat_cubukcu";

export async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const settings = await readSettings();
  const behance = settings.behance?.trim() || DEFAULT_BEHANCE;

  return (
    <footer className="mt-auto border-t border-umber/12 bg-parchment-dark/85">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-umber/60 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p>{t("rights")}</p>
          <a
            href={behance}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-medium text-oxide underline-offset-4 hover:underline"
          >
            {t("behanceCta")}
          </a>
        </div>
        <p className="font-serif text-umber/50 text-sm italic tracking-wide">
          {t("tagline")}
        </p>
      </div>
    </footer>
  );
}
