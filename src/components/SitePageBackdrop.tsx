/**
 * Anthracite wash + blueprint grid + vignette + subtle gold rails.
 */
export function SitePageBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-full w-full overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 min-h-full bg-gradient-to-br from-anthracite-light/90 via-anthracite/85 to-anthracite-dark/95"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 min-h-full opacity-[0.65] hero-blueprint-grid"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 min-h-full bg-gradient-to-b from-white/[0.04] via-transparent to-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-goldleaf/[0.1] via-goldleaf/[0.03] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-24 left-0 hidden w-px bg-gradient-to-b from-goldleaf/25 via-goldleaf/8 to-transparent md:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-24 right-0 hidden w-px bg-gradient-to-b from-goldleaf/25 via-goldleaf/8 to-transparent md:block"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
