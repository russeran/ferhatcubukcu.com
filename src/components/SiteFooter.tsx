import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "curator" });
  const prefix = `/${locale}`;

  const navItems = [
    { href: `${prefix}/gallery`, label: tn("gallery") },
    { href: `${prefix}/studio`, label: tn("studio") },
    { href: `${prefix}/press`, label: tn("press") },
    { href: `${prefix}/social`, label: tn("social") },
    { href: `${prefix}/about`, label: tn("about") },
    { href: `${prefix}/contact`, label: tn("contact") },
  ] as const;

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-gradient-to-b from-anthracite-light/98 via-anthracite/95 to-anthracite-dark/92">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.48] hero-blueprint-grid"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-goldleaf/50 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 text-sm sm:px-5 md:flex-row md:items-start md:justify-between md:gap-10 md:py-14">
        <div className="space-y-5 md:max-w-lg">
          <p className="text-[13px] leading-relaxed text-ink-muted">{t("rights")}</p>
          <nav
            className="flex flex-wrap gap-x-2 gap-y-2"
            aria-label={t("footerNavAria")}
          >
            {navItems.map((item, i) => (
              <span key={item.href} className="inline-flex items-center gap-x-2">
                {i > 0 ? (
                  <span className="text-ink-faint/40 select-none" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={item.href}
                  className="rounded-sm px-1.5 py-0.5 text-[13px] font-medium tracking-wide text-ink-muted transition hover:bg-white/[0.06] hover:text-ink"
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
          <div>
            <Link
              href="/api/curator-pack"
              prefetch={false}
              className="inline-flex rounded-sm border border-white/15 bg-parchment/60 px-4 py-2.5 text-[13px] font-medium text-ink transition hover:border-goldleaf/45 hover:text-oxide"
            >
              {t("curatorPack")} — {tc("footerLabel")}
            </Link>
          </div>
        </div>
        <p className="max-w-xs font-serif text-sm italic leading-relaxed tracking-wide text-ink-faint md:text-right">
          {t("tagline")}
        </p>
      </div>
    </footer>
  );
}
