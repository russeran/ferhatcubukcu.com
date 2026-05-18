"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NavNewsHub } from "@/components/NavNewsHub";
import { cn } from "@/lib/utils";
import { primaryNavLinks, pathMatchesNav } from "@/lib/site-nav";
import { ArtistWordmark } from "@/components/ArtistWordmark";
import { SiteBrandMarkSvg } from "@/components/SiteBrandMarkSvg";
import { splitArtistName } from "@/lib/split-artist-name";

const navBeforeHub = primaryNavLinks.slice(0, 2);
const navAfterHub = primaryNavLinks.slice(2);

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

export function SiteHeader({
  artistName = "Ferhat Çubukçu",
}: {
  artistName?: string;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { first, rest } = splitArtistName(artistName);
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
    <header className="relative sticky top-0 z-[100] border-b border-white/10 bg-gradient-to-b from-anthracite-light/98 via-anthracite/95 to-anthracite-dark/92 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.35)] backdrop-blur-md supports-[padding:max(0px)]:pt-[env(safe-area-inset-top,0px)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] hero-blueprint-grid"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-goldleaf/55 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 md:py-4">
        <Link
          href="/"
          className="group inline-flex min-h-11 min-w-0 shrink items-center gap-2.5 self-center rounded-sm py-2 transition-opacity hover:opacity-[0.94] sm:gap-3"
        >
          <SiteBrandMarkSvg className="hidden h-9 w-9 opacity-95 ring-1 ring-white/10 sm:block md:h-10 md:w-10" />
          <ArtistWordmark first={first} rest={rest} size="header" />
        </Link>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-white/15 bg-parchment/50 text-ink outline-none transition hover:border-goldleaf/45 hover:bg-parchment/80 focus-visible:ring-2 focus-visible:ring-goldleaf/55 md:hidden"
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
          className="hidden items-center gap-1 text-sm md:flex md:text-[14px]"
          aria-label="Main"
        >
          {navBeforeHub.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={cn(
                "relative rounded-sm px-3 py-2 text-[13px] font-medium tracking-wide text-ink-muted transition-colors duration-300 ease-out-expo hover:bg-white/[0.06] hover:text-ink md:text-sm",
                pathMatchesNav(pathname, l.href) &&
                  "bg-white/[0.08] text-ink shadow-[inset_0_-2px_0_0_rgba(201,168,90,0.75)]"
              )}
            >
              {t(l.key)}
            </Link>
          ))}
          <NavNewsHub variant="desktop" />
          {navAfterHub.map((l) => (
            <Link
              key={l.key}
              href={l.href}
              className={cn(
                "relative rounded-sm px-3 py-2 text-[13px] font-medium tracking-wide text-ink-muted transition-colors duration-300 ease-out-expo hover:bg-white/[0.06] hover:text-ink md:text-sm",
                pathMatchesNav(pathname, l.href) &&
                  "bg-white/[0.08] text-ink shadow-[inset_0_-2px_0_0_rgba(201,168,90,0.75)]"
              )}
            >
              {t(l.key)}
            </Link>
          ))}
          <div className="ml-1 border-l border-white/12 pl-3">
            <LanguageSwitcher variant="light" />
          </div>
          {isAdmin ? (
            <NextLink
              href={`/${locale}/admin`}
              prefetch={false}
              className="ml-1 rounded-sm border border-transparent px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-editorial text-ink-faint transition-colors hover:border-oxide/50 hover:bg-[#faf6f1] hover:text-oxide-deep md:text-[12px]"
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
                className="fixed inset-0 z-[200] bg-umber-deep/55 backdrop-blur-[2px] md:hidden"
                aria-label={t("closeMenu")}
                onClick={() => setMenuOpen(false)}
              />
              <div
                id="mobile-drawer"
                className="fixed inset-y-0 right-0 z-[210] flex max-h-[100dvh] w-[min(100%,14rem)] flex-col overflow-hidden border-l border-white/15 bg-anthracite-light shadow-[-16px_0_48px_-8px_rgba(0,0,0,0.45)] md:hidden supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom,0px)] supports-[padding:max(0px)]:pt-[env(safe-area-inset-top,0px)]"
                role="dialog"
                aria-modal="true"
                aria-label={t("mobileNav")}
              >
                <nav className="relative z-10 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-6">
                  {navBeforeHub.map((l) => (
                    <Link
                      key={l.key}
                      href={l.href}
                      className={cn(
                        "rounded-sm border border-transparent py-3.5 pl-2.5 text-[15px] font-semibold text-ink transition-colors hover:border-white/15 hover:bg-white/[0.08]",
                        pathMatchesNav(pathname, l.href) &&
                          "border-goldleaf/50 bg-goldleaf/15 text-ink"
                      )}
                      onClick={() => setMenuOpen(false)}
                    >
                      {t(l.key)}
                    </Link>
                  ))}
                  <NavNewsHub
                    variant="mobile"
                    onNavigate={() => setMenuOpen(false)}
                  />
                  {navAfterHub.map((l) => (
                    <Link
                      key={l.key}
                      href={l.href}
                      className={cn(
                        "rounded-sm border border-transparent py-3.5 pl-2.5 text-[15px] font-semibold text-ink transition-colors hover:border-white/15 hover:bg-white/[0.08]",
                        pathMatchesNav(pathname, l.href) &&
                          "border-goldleaf/50 bg-goldleaf/15 text-ink"
                      )}
                      onClick={() => setMenuOpen(false)}
                    >
                      {t(l.key)}
                    </Link>
                  ))}
                  <div className="mt-6 flex flex-col gap-4 border-t border-white/15 pt-6">
                    <LanguageSwitcher variant="drawer" />
                    {isAdmin ? (
                      <NextLink
                        href={`/${locale}/admin`}
                        prefetch={false}
                        className="rounded-sm border border-transparent py-3 pl-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-ink hover:border-oxide/50 hover:bg-[#faf6f1] hover:text-oxide-deep"
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
