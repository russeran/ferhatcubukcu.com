"use client";

import NextLink from "next/link";
import { useTranslations } from "next-intl";

type Variant = "gallery" | "news";

export function PublicListAdminToolbar({
  locale,
  variant,
}: {
  locale: string;
  variant: Variant;
}) {
  const t = useTranslations("publicAdmin");
  const base = `/${locale}`;
  const panelHref =
    variant === "gallery" ? `${base}/admin/artworks` : `${base}/admin/news`;
  const addHref =
    variant === "gallery"
      ? `${panelHref}#admin-add-artwork`
      : `${panelHref}#admin-add-news`;

  return (
    <aside
      className="accent-panel mb-8 flex flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
      aria-label={t("toolbarAria")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-oxide-deep">
        {t("signedIn")}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <NextLink
          href={panelHref}
          prefetch={false}
          className="btn-admin-secondary-sm"
        >
          {variant === "gallery" ? t("manageArtworks") : t("manageNews")}
        </NextLink>
        <NextLink
          href={addHref}
          prefetch={false}
          className="btn-admin-add"
        >
          {variant === "gallery" ? t("addArtwork") : t("addNews")}
        </NextLink>
      </div>
    </aside>
  );
}
