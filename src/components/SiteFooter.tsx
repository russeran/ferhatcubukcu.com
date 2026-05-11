"use client";

import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto border-t border-umber/15 bg-parchment-dark/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-umber/55 md:flex-row md:items-center md:justify-between">
        <p>{t("rights")}</p>
        <p className="font-serif text-umber/40 text-xs tracking-wide">
          Oil · pigment · canvas
        </p>
      </div>
    </footer>
  );
}
