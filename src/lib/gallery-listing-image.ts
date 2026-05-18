import { cn } from "@/lib/utils";

/** Public gallery card image: cover (crop) vs contain (fit full painting). */
export function galleryListingImageClass(fitFullImage: boolean): string {
  return cn(
    fitFullImage
      ? "object-contain object-center p-1 sm:p-1.5"
      : "object-cover transition duration-[1100ms] ease-out-expo motion-safe:group-hover:scale-[1.03]"
  );
}
