"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  newsHubNavLinks,
  pathInNewsHub,
  pathMatchesNav,
} from "@/lib/site-nav";
import { cn } from "@/lib/utils";

type HubLinkProps = {
  pathname: string;
  className: string;
  activeClassName: string;
  onNavigate?: () => void;
};

function HubLinks({
  pathname,
  className,
  activeClassName,
  onNavigate,
}: HubLinkProps) {
  const t = useTranslations("nav");
  return (
    <>
      {newsHubNavLinks.map((l) => (
        <Link
          key={l.key}
          href={l.href}
          role="menuitem"
          className={cn(
            className,
            pathMatchesNav(pathname, l.href) && activeClassName
          )}
          onClick={onNavigate}
        >
          {t(l.key)}
        </Link>
      ))}
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn(
        "h-3.5 w-3.5 shrink-0 text-umber/45 transition-transform duration-200",
        open && "rotate-180"
      )}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Desktop flyout + mobile drawer subsection for Studio / Press / Social. */
export function NavNewsHub({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const hubActive = pathInNewsHub(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (variant !== "desktop" || !open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, variant]);

  if (variant === "mobile") {
    return (
      <div
        className="border-t border-umber/20 pt-4"
        aria-labelledby={`${menuId}-label`}
      >
        <p
          id={`${menuId}-label`}
          className="mb-2 px-2.5 font-serif text-[10px] font-semibold uppercase tracking-[0.28em] text-umber/70"
        >
          {t("newsHub")}
        </p>
        <div className="flex flex-col gap-0.5">
          <HubLinks
            pathname={pathname}
            className="rounded-sm border border-transparent py-3 pl-4 text-[15px] font-semibold text-umber-deep transition-colors hover:border-umber/15 hover:bg-umber/[0.08]"
            activeClassName="border-goldleaf/50 bg-goldleaf/15 text-umber-deep"
            onNavigate={onNavigate}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm px-3 py-2 text-[13px] font-medium tracking-wide text-umber/62 transition-colors duration-300 ease-out-expo hover:bg-umber/[0.06] hover:text-umber-deep md:text-sm",
          (hubActive || open) &&
            "bg-umber/[0.08] text-umber-deep shadow-[inset_0_-2px_0_0_rgba(201,168,90,0.75)]"
        )}
        onClick={() => setOpen((o) => !o)}
      >
        {t("newsHub")}
        <Chevron open={open} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute left-0 top-full z-[120] mt-1 min-w-[11.5rem] rounded-sm border border-umber/12 bg-gradient-to-b from-parchment/98 via-parchment-warm/95 to-parchment-dark/80 py-1.5 shadow-[0_16px_40px_-12px_rgba(26,23,20,0.22)] backdrop-blur-md"
        >
          <HubLinks
            pathname={pathname}
            className="block px-4 py-2.5 text-[13px] font-medium tracking-wide text-umber/70 transition-colors hover:bg-umber/[0.06] hover:text-umber-deep"
            activeClassName="bg-goldleaf/10 text-umber-deep"
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
