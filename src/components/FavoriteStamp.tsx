import { SiteBrandMarkSvg } from "@/components/SiteBrandMarkSvg";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  className?: string;
  compact?: boolean;
};

/** Artist’s selection — brand mark + label on artwork images. */
export function FavoriteStamp({ label, className = "", compact }: Props) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute right-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] select-none items-center gap-1.5 rounded-md border border-goldleaf/55 bg-gradient-to-br from-[#faf7f2] via-[#f5efe4] to-[#ebe3d4] px-2 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.28)] ring-1 ring-white/40",
        compact ? "py-0.5 pl-1.5 pr-2" : "px-2.5 py-1.5",
        className
      )}
      aria-hidden
    >
      <SiteBrandMarkSvg
        className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
      />
      <span
        className={cn(
          "font-sans font-bold uppercase leading-tight text-anthracite-deep",
          compact
            ? "text-[8px] tracking-[0.12em]"
            : "text-[9px] tracking-[0.16em] sm:text-[10px]"
        )}
      >
        {label}
      </span>
    </span>
  );
}
