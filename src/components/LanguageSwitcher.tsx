"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark" | "drawer";
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const next = locale === "en" ? "tr" : "en";

  const variantClass =
    variant === "dark"
      ? "min-h-10 rounded-full border border-parchment/30 bg-parchment/[0.06] px-4 py-2 text-xs uppercase tracking-[0.2em] text-parchment/85 transition-colors hover:border-goldleaf/50 hover:text-goldleaf"
      : variant === "drawer"
        ? "min-h-10 w-full rounded-sm border border-umber/25 bg-umber/[0.06] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-umber-deep transition-colors hover:border-goldleaf/45 hover:bg-umber/[0.1] hover:text-oxide"
        : "min-h-10 rounded-full border border-umber/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-umber/70 transition-colors hover:border-oxide/50 hover:text-oxide";

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: next })}
      className={variantClass}
      aria-label={next === "tr" ? "Türkçe" : "English"}
    >
      {locale === "en" ? "TR" : "EN"}
    </button>
  );
}
