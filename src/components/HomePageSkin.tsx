/**
 * Shared home backdrop — parchment wash + blueprint grid + vignette (matches hero).
 * Wraps all home sections so the page reads as one continuous surface.
 */
export function HomePageSkin({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 min-h-full bg-gradient-to-br from-parchment/95 via-parchment-warm/75 to-parchment-dark/55"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 min-h-full opacity-[0.72] hero-blueprint-grid"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 min-h-full bg-gradient-to-b from-white/25 via-transparent to-umber-deep/[0.04]"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
