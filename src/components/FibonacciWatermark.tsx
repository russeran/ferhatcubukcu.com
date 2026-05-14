/** Subtle Fibonacci spiral — fixed watermark, pointer-events none. */
export function FibonacciWatermark() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute -right-[18%] top-[8%] h-[min(92vh,820px)] w-[min(92vw,820px)] -translate-y-1/4 translate-x-1/4 text-goldleaf/[0.18] motion-reduce:opacity-0 sm:-right-[12%] sm:top-[12%]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 50 C50 30 70 20 80 35 C88 48 78 62 65 65 C52 68 42 58 42 45 C42 32 55 25 68 30 C82 36 88 52 82 65 C76 80 58 88 42 82 C26 76 15 58 22 42 C29 26 50 18 68 25 C86 32 95 52 88 70 C81 88 58 98 38 90 C18 82 8 58 18 38 C28 18 55 8 75 18 C95 28 102 52 92 72"
          stroke="currentColor"
          strokeWidth="0.38"
          strokeLinecap="round"
        />
        <path
          d="M50 50m-28 0a28 28 0 1 1 56 0a28 28 0 1 1-56 0"
          stroke="currentColor"
          strokeWidth="0.2"
          opacity={0.6}
        />
      </svg>
    </div>
  );
}
