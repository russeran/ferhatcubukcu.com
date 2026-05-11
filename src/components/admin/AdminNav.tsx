"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const items = [
  { href: "/admin", key: "dashboard" as const },
  { href: "/admin/artworks", key: "artworks" as const },
  { href: "/admin/settings", key: "settings" as const },
];

export function AdminNav() {
  const t = useTranslations("admin");

  return (
    <nav className="flex flex-wrap gap-2 border-b border-white/10 pb-6 text-sm">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full border border-white/15 px-4 py-2 text-parchment/90 transition hover:border-goldleaf/50 hover:text-goldleaf"
        >
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );
}
