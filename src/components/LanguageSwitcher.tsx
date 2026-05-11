"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const next = locale === "en" ? "tr" : "en";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      className="rounded-full border border-umber/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-umber/70 hover:border-oxide/50 hover:text-oxide transition-colors"
      aria-label={next === "tr" ? "Türkçe" : "English"}
    >
      {locale === "en" ? "TR" : "EN"}
    </button>
  );
}
