"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", key: "home" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/studio", key: "studio" as const },
  { href: "/press", key: "press" as const },
  { href: "/instagram", key: "instagram" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

function pathMatchesNav(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname === "";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ authenticated: false })))
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled) setIsAdmin(Boolean(data.authenticated));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const drawer = document.getElementById("mobile-drawer");
    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const getEls = () =>
      drawer
        ? Array.from(drawer.querySelectorAll<HTMLElement>(selector)).filter(
            (el) => !el.hasAttribute("disabled")
          )
        : [];
    const els = getEls();
    const first = els[0];
    const last = els[els.length - 1];
    const focusTimer = window.setTimeout(() => first?.focus(), 10);
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || els.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    drawer?.addEventListener("keydown", onTab);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(focusTimer);
      drawer?.removeEventListener("keydown", onTab);
    };
  }, [menuOpen]);

  return (
    <header className="relative sticky top-0 z-[100] border-b border-goldleaf/35 bg-gradient-to-b from-[#241e19] via-umber-deep to-[#151210] shadow-[0_18px_48px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl supports-[padding:max(0px)]:pt-[env(safe-area-inset-top,0px)]">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-goldleaf/90 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 md:py-5">
        <Link
          href="/"
          className="inline-block min-h-11 min-w-0 shrink bg-gradient-to-r from-parchment via-parchment-warm to-goldleaf bg-clip-text font-serif text-base font-semibold leading-tight tracking-[0.04em] text-transparent transition-opacity hover:opacity-90 sm:text-lg md:text-xl"
        >
          Ferhat Çubukçu
        </Link>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-parchment outline-none ring-offset-2 ring-offset-umber-deep transition hover:text-goldleaf focus-visible:ring-2 focus-visible:ring-goldleaf/50 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">
            {menuOpen ? t("closeMenu") : t("openMenu")}
          </span>
          <MenuIcon open={menuOpen} />
        </button>

        <nav
          className="hidden items-center gap-2 text-sm md:flex md:gap-1 md:text-[15px]"
          aria-label="Main"
        >
          {links.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={cn(
                "relative rounded-md px-3 py-2 text-[13px] font-medium tracking-wide text-parchment/65 transition-colors duration-300 ease-out-expo hover:text-parchment md:text-sm",
                pathMatchesNav(pathname, l.href) &&
                  "text-parchment after:pointer-events-none after:absolute after:bottom-1 after:left-3 after:right-3 after:h-px after:rounded-full after:bg-gradient-to-r after:from-goldleaf after:to-goldleaf/40"
              )}
            >
              {t(l.key)}
            </Link>
          ))}
          <LanguageSwitcher variant="dark" />
          {isAdmin ? (
            <NextLink
              href={`/${locale}/admin`}
              prefetch={false}
              className="text-xs font-medium uppercase tracking-editorial text-parchment/45 transition-colors hover:text-goldleaf md:text-[13px]"
            >
              {t("admin")}
            </NextLink>
          ) : null}
        </nav>
      </div>

      {portalReady && menuOpen
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-0 z-[200] bg-black/55 md:hidden"
                aria-label={t("closeMenu")}
                onClick={() => setMenuOpen(false)}
              />
              <div
                id="mobile-drawer"
                className="fixed inset-y-0 right-0 z-[210] flex max-h-[100dvh] w-[min(100%,20rem)] flex-col border-l border-goldleaf/25 bg-gradient-to-b from-[#1e1915] via-umber-deep to-[#120f0d] shadow-2xl md:hidden supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom,0px)] supports-[padding:max(0px)]:pt-[env(safe-area-inset-top,0px)]"
                role="dialog"
                aria-modal="true"
                aria-label={t("mobileNav")}
              >
                <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-5 py-6">
                  {links.map((l) => (
                    <Link
                      key={l.key}
                      href={l.href}
                      className={cn(
                        "rounded-md border-l-2 border-transparent py-3.5 pl-3 text-base font-medium text-parchment/80 transition-colors hover:border-goldleaf/45 hover:bg-parchment/[0.05] hover:text-parchment",
                        pathMatchesNav(pathname, l.href) &&
                          "border-goldleaf/70 bg-parchment/[0.06] text-parchment"
                      )}
                      onClick={() => setMenuOpen(false)}
                    >
                      {t(l.key)}
                    </Link>
                  ))}
                  <div className="mt-6 flex flex-col gap-4 border-t border-parchment/15 pt-6">
                    <LanguageSwitcher variant="dark" />
                    {isAdmin ? (
                      <NextLink
                        href={`/${locale}/admin`}
                        prefetch={false}
                        className="rounded-md py-3 text-sm font-medium uppercase tracking-[0.18em] text-parchment/45 hover:text-goldleaf"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t("admin")}
                      </NextLink>
                    ) : null}
                  </div>
                </nav>
              </div>
            </>,
            document.body
          )
        : null}
    </header>
  );
}
