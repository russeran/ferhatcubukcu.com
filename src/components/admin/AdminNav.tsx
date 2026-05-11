"use client";

import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";

const items = [
  { href: "/admin", key: "dashboard" as const },
  { href: "/admin/artworks", key: "artworks" as const },
  { href: "/admin/settings", key: "settings" as const },
];

export function AdminNav() {
  const t = useTranslations("admin");
  const locale = useLocale();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-6 text-sm">
      {items.map((item) => (
        <NextLink
          key={item.href}
          href={`/${locale}${item.href}`}
          prefetch={false}
          className="rounded-full border border-white/15 px-4 py-2 text-parchment/90 transition hover:border-goldleaf/50 hover:text-goldleaf"
        >
          {t(item.key)}
        </NextLink>
      ))}
    </nav>
  );
}
