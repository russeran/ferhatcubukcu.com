"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const links = [
  { href: "/", key: "home" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-umber/10 bg-parchment/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:py-5">
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-umber-deep md:text-xl"
        >
          Ferhat Çubukçu
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm md:gap-8 md:text-[15px]">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="text-umber/80 transition-colors hover:text-oxide"
            >
              {t(l.key)}
            </Link>
          ))}
          <LanguageSwitcher />
          <Link
            href="/admin"
            className="text-xs font-medium uppercase tracking-[0.2em] text-patina hover:text-oxide md:text-[13px]"
          >
            {t("admin")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
