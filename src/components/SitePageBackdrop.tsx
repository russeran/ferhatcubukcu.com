/**
 * Parchment wash + blueprint grid + vignette + subtle gold rails.
 * Wraps all public main content so every route matches the home hero surface.
 */
export function SitePageBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-full w-full overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 min-h-full bg-gradient-to-br from-parchment/95 via-parchment-warm/75 to-parchment-dark/55"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 min-h-full opacity-[0.72] hero-blueprint-grid"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 min-h-full bg-gradient-to-b from-white/18 via-transparent to-umber-deep/[0.07]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-goldleaf/[0.12] via-goldleaf/[0.04] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-24 left-0 hidden w-px bg-gradient-to-b from-goldleaf/30 via-goldleaf/10 to-transparent md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-24 right-0 hidden w-px bg-gradient-to-b from-goldleaf/30 via-goldleaf/10 to-transparent md:block"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
