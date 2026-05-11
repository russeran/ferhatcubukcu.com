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
    <header className="border-b border-umber/15 bg-parchment/90 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:py-5">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-umber-deep md:text-2xl"
        >
          Ferhat Çubukçu
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm md:gap-8 md:text-[15px]">
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className="text-umber/85 hover:text-oxide transition-colors"
            >
              {t(l.key)}
            </Link>
          ))}
          <LanguageSwitcher />
          <Link
            href="/admin"
            className="text-patina hover:text-patina-light text-xs uppercase tracking-widest md:text-[13px]"
          >
            {t("admin")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
