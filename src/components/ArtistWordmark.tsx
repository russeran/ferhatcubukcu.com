import { cn } from "@/lib/utils";

type Props = {
  first: string;
  rest?: string | null;
  size?: "header" | "hero";
  className?: string;
};

/** Artist name — gradient type with shadow for contrast, no plaque. */
export function ArtistWordmark({
  first,
  rest,
  size = "header",
  className,
}: Props) {
  const isHero = size === "hero";

  return (
    <span className={cn("artist-wordmark", className)}>
      <span
        className={cn(
          "artist-wordmark-name leading-[1.02]",
          isHero
            ? "text-[clamp(2rem,5.8vw,3.65rem)] tracking-[0.08em]"
            : "text-[1.12rem] tracking-[0.12em] sm:text-xl md:text-[1.5rem]"
        )}
      >
        {first}
      </span>
      {rest ? (
        <span
          className={cn(
            "artist-wordmark-name leading-[1.02]",
            isHero
              ? "text-[clamp(1.85rem,5.2vw,3.2rem)] tracking-[0.08em]"
              : "text-[1.12rem] tracking-[0.12em] sm:text-xl md:text-[1.5rem]"
          )}
        >
          {rest}
        </span>
      ) : null}
    </span>
  );
}
