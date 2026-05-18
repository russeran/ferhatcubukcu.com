"use client";

import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";

const items = [
  { href: "/admin", key: "dashboard" as const },
  { href: "/admin/artworks", key: "artworks" as const },
  { href: "/admin/news", key: "news" as const },
  { href: "/admin/settings", key: "settings" as const },
];

export function AdminNav() {
  const t = useTranslations("admin");
  const locale = useLocale();

  return (
    <nav className="admin-nav text-sm">
      {items.map((item) => (
        <NextLink
          key={item.href}
          href={`/${locale}${item.href}`}
          prefetch={false}
          className="btn-admin-nav"
        >
          {t(item.key)}
        </NextLink>
      ))}
    </nav>
  );
}
