"use client";

import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto border-t border-umber/10 bg-parchment-dark/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-umber/55 md:flex-row md:items-center md:justify-between">
        <p>{t("rights")}</p>
        <p className="font-mono text-umber/45 text-[11px] uppercase tracking-[0.28em]">
          {t("tagline")}
        </p>
      </div>
    </footer>
  );
}
