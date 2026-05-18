import { Link } from "@/i18n/navigation";
import { PageShell } from "@/components/PageShell";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "errors" });

  return (
    <PageShell>
      <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center sm:py-24">
        <p className="editorial-eyebrow">{t("notFoundCode")}</p>
        <h1 className="page-title mt-4">{t("notFoundTitle")}</h1>
        <p className="page-lead mt-6 text-center">{t("notFoundBody")}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link href="/" className="btn-primary">
            {t("notFoundHome")}
          </Link>
          <Link href="/gallery" className="btn-secondary">
            {t("notFoundGallery")}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
