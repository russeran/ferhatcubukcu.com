import { cn } from "@/lib/utils";

type Props = {
  first: string;
  rest?: string | null;
  size?: "header" | "hero";
  className?: string;
};

const plaqueClass =
  "inline-flex max-w-full flex-wrap items-baseline gap-x-1.5 gap-y-1 rounded-sm border border-white/30 bg-gradient-to-br from-[#fcf9f4] via-[#f3ede4] to-[#e8e0d4] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_14px_rgba(0,0,0,0.3)]";

const nameClass =
  "font-serif font-bold italic text-oxide-deep drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]";

/** Artist name on a light plaque so it stays readable on any backdrop. */
export function ArtistWordmark({
  first,
  rest,
  size = "header",
  className,
}: Props) {
  if (size === "hero") {
    return (
      <span className={cn(plaqueClass, "px-3 py-2 sm:px-4 sm:py-2.5", className)}>
        <span
          className={cn(
            nameClass,
            "text-[clamp(2rem,5.8vw,3.65rem)] leading-[1.02] tracking-[0.06em]"
          )}
        >
          {first}
        </span>
        {rest ? (
          <span
            className={cn(
              nameClass,
              "text-[clamp(1.85rem,5.2vw,3.2rem)] leading-[1.02] tracking-[0.06em]"
            )}
          >
            {rest}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        plaqueClass,
        "px-2 py-1 sm:px-2.5 sm:py-1",
        className
      )}
    >
      <span
        className={cn(
          nameClass,
          "text-[1.12rem] leading-snug tracking-[0.1em] sm:text-xl md:text-[1.5rem]"
        )}
      >
        {first}
      </span>
      {rest ? (
        <span
          className={cn(
            nameClass,
            "text-[1.12rem] leading-snug tracking-[0.1em] sm:text-xl md:text-[1.5rem]"
          )}
        >
          {rest}
        </span>
      ) : null}
    </span>
  );
}
