import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FavoriteStamp } from "@/components/FavoriteStamp";
import { SoldStamp } from "@/components/SoldStamp";
import { IMAGE_BLUR_PLACEHOLDER } from "@/lib/image-blur";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  image: string;
  meta?: string | null;
  listingImageClass: string;
  galleryImageFit: boolean;
  sold?: boolean;
  soldLabel: string;
  favorite?: boolean;
  favoriteLabel?: string;
  viewLabel: string;
  price?: string | null;
  sizes: string;
  titleAs?: "h2" | "h3" | "p";
  titleClassName?: string;
  captionSpacing?: "compact" | "default";
};

export function GalleryArtworkListingCard({
  href,
  title,
  image,
  meta,
  listingImageClass,
  galleryImageFit,
  sold,
  soldLabel,
  favorite,
  favoriteLabel,
  viewLabel,
  price,
  sizes,
  titleAs = "p",
  titleClassName,
  captionSpacing = "default",
}: Props) {
  const TitleTag = titleAs;

  return (
    <Link
      href={href}
      className="group block cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-goldleaf/80 focus-visible:ring-offset-2 focus-visible:ring-offset-anthracite"
    >
      <div
        className={cn(
          "gallery-image-frame gallery-image-frame-hover relative aspect-[4/5]",
          favorite && "gallery-image-frame-favorite"
        )}
      >
        <Image
          src={image}
          alt=""
          fill
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_PLACEHOLDER}
          className={listingImageClass}
          sizes={sizes}
        />
        {sold ? <SoldStamp label={soldLabel} /> : null}
        {favorite && favoriteLabel ? (
          <FavoriteStamp label={favoriteLabel} compact={captionSpacing === "compact"} />
        ) : null}
        {!galleryImageFit ? (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/35 via-transparent to-transparent opacity-0 transition duration-500 ease-out-expo group-hover:opacity-100 group-focus-visible:opacity-100"
            aria-hidden
          />
        ) : null}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-anthracite-deep/80 via-anthracite-deep/35 to-transparent px-3 pb-3 pt-10 opacity-100 transition duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100"
          aria-hidden
        >
          <span className="rounded-sm border border-white/20 bg-parchment/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-editorial text-anthracite-deep shadow-sm sm:text-xs">
            {viewLabel}
          </span>
        </div>
      </div>
      <div className={captionSpacing === "compact" ? "mt-3" : "mt-4 space-y-1"}>
        {favorite && favoriteLabel ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-goldleaf sm:text-xs">
            {favoriteLabel}
          </p>
        ) : null}
        <TitleTag
          className={cn(
            titleAs === "h2" && "page-subsection-title",
            titleAs === "h3" && "page-card-title text-lg",
            titleAs === "p" && "page-card-title text-sm",
            favorite && "text-goldleaf/95",
            titleClassName
          )}
        >
          {title}
        </TitleTag>
        {meta ? (
          <p
            className={cn(
              "leading-relaxed text-ink-muted",
              captionSpacing === "compact"
                ? "mt-1 line-clamp-2 text-xs"
                : "text-sm"
            )}
          >
            {meta}
          </p>
        ) : null}
        {price ? (
          <p className="text-sm font-medium text-ink/95">{price}</p>
        ) : null}
        <p className="mt-2 text-xs font-semibold uppercase tracking-editorial text-goldleaf transition group-hover:text-goldleaf/95">
          <span>{viewLabel}</span>
          <span aria-hidden className="ml-1.5 inline-block transition group-hover:translate-x-0.5">
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
