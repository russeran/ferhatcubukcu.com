/** Poster-style geometry + spiral — home hero only, pointer-events none. */
export function HomeHeroGeometryDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 opacity-[0.11] mix-blend-multiply">
        <div className="absolute left-[48%] top-0 h-[min(42%,320px)] w-[52%] bg-patina md:left-[50%]" />
        <div className="absolute bottom-0 right-0 h-[min(48%,380px)] w-[min(46%,420px)] bg-oxide" />
        <div className="absolute bottom-[8%] left-[40%] h-[26%] w-[min(34%,280px)] bg-goldleaf/90 md:left-[42%]" />
        <div className="absolute left-0 top-[18%] h-[22%] w-[min(28%,200px)] bg-patina-light/80" />
      </div>
      <div className="absolute -right-[8%] top-[6%] h-[min(88vw,560px)] w-[min(88vw,560px)] text-umber-deep/[0.11] motion-reduce:opacity-0 sm:-right-[4%] sm:top-[10%] md:h-[min(72vh,600px)] md:w-[min(72vh,600px)]">
        <svg
          className="h-full w-full motion-safe:animate-hero-atmosphere"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M50 50 C50 30 70 20 80 35 C88 48 78 62 65 65 C52 68 42 58 42 45 C42 32 55 25 68 30 C82 36 88 52 82 65 C76 80 58 88 42 82 C26 76 15 58 22 42 C29 26 50 18 68 25 C86 32 95 52 88 70 C81 88 58 98 38 90 C18 82 8 58 18 38 C28 18 55 8 75 18 C95 28 102 52 92 72"
            stroke="currentColor"
            strokeWidth="0.42"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="28"
            stroke="currentColor"
            strokeWidth="0.22"
            opacity={0.55}
          />
        </svg>
      </div>
    </div>
  );
}
