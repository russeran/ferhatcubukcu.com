import { cn } from "@/lib/utils";

/** Inline brand mark for header / UI (matches generated favicon). */
export function SiteBrandMarkSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="5" fill="#383e42" />
      <path
        d="M6 24c0-8 4-14 10-16 6-2 10 2 10 8"
        stroke="#c9a85a"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="2.25" fill="#922f3d" />
    </svg>
  );
}
