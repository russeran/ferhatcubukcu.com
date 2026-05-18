"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { FavoriteStamp } from "@/components/FavoriteStamp";
import { SoldStamp } from "@/components/SoldStamp";
import { cn } from "@/lib/utils";
import {
  ZoomablePaintingFrame,
  zoomFrameNavBtnClass,
} from "@/components/ZoomablePaintingFrame";
import { IMAGE_BLUR_PLACEHOLDER } from "@/lib/image-blur";

type Props = {
  src: string;
  alt: string;
  sold: boolean;
  soldLabel: string;
  favorite?: boolean;
  favoriteLabel?: string;
  openZoomLabel: string;
  closeLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomResetLabel: string;
  zoomHint?: string;
  swipeHint?: string;
  fullscreenLabel: string;
  exitFullscreenLabel: string;
  sizes: string;
  prevSlug?: string | null;
  nextSlug?: string | null;
  prevLabel?: string;
  nextLabel?: string;
  /** Open lightbox on load when URL has `?zoom=1` (e.g. after prev/next in zoom). */
  initialZoomOpen?: boolean;
};

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function requestShellFullscreen(el: HTMLElement) {
  const node = el as HTMLElement & {
    webkitRequestFullscreen?: () => void;
  };
  if (node.requestFullscreen) {
    await node.requestFullscreen();
  } else if (node.webkitRequestFullscreen) {
    node.webkitRequestFullscreen();
  }
}

async function exitShellFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => void;
  };
  if (doc.fullscreenElement && doc.exitFullscreen) {
    await doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  }
}

export function PaintingHeroWithZoom({
  src,
  alt,
  sold,
  soldLabel,
  favorite,
  favoriteLabel,
  openZoomLabel,
  closeLabel,
  zoomInLabel,
  zoomOutLabel,
  zoomResetLabel,
  zoomHint,
  swipeHint,
  fullscreenLabel,
  exitFullscreenLabel,
  sizes,
  prevSlug = null,
  nextSlug = null,
  prevLabel = "Previous",
  nextLabel = "Next",
  initialZoomOpen = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(initialZoomOpen);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasNav = Boolean(prevSlug || nextSlug);

  const combinedHint = [zoomHint, hasNav && swipeHint ? swipeHint : null]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    setOpen(initialZoomOpen);
  }, [initialZoomOpen, src]);

  const closeZoom = useCallback(() => {
    if (getFullscreenElement()) {
      exitShellFullscreen().catch(() => {});
    }
    setOpen(false);
    setIsFullscreen(false);
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const openZoom = useCallback(() => {
    setOpen(true);
    router.replace(`${pathname}?zoom=1`, { scroll: false });
  }, [pathname, router]);

  const goPrev = useCallback(() => {
    if (prevSlug) {
      router.replace(`/gallery/${prevSlug}?zoom=1`, { scroll: false });
    }
  }, [prevSlug, router]);

  const goNext = useCallback(() => {
    if (nextSlug) {
      router.replace(`/gallery/${nextSlug}?zoom=1`, { scroll: false });
    }
  }, [nextSlug, router]);

  const toggleFullscreen = useCallback(async () => {
    const el = shellRef.current;
    if (!el) return;
    try {
      if (getFullscreenElement()) {
        await exitShellFullscreen();
      } else {
        await requestShellFullscreen(el);
      }
    } catch {
      /* unsupported or denied */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(getFullscreenElement()));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (getFullscreenElement()) {
          exitShellFullscreen().catch(() => {});
          return;
        }
        closeZoom();
      }
      if (e.key === "ArrowLeft" && prevSlug) goPrev();
      if (e.key === "ArrowRight" && nextSlug) goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeZoom, goPrev, goNext, prevSlug, nextSlug]);

  return (
    <>
      <button
        type="button"
        onClick={openZoom}
        className={cn(
          "group relative aspect-[3/4] w-full overflow-hidden rounded-md bg-white text-left shadow-gallery ring-1 ring-umber/10 lg:aspect-[4/5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goldleaf/50 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
          favorite && "gallery-image-frame-favorite ring-2 ring-goldleaf/65"
        )}
        aria-label={openZoomLabel}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition duration-700 ease-out-expo group-hover:scale-[1.02]"
          sizes={sizes}
          priority
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_PLACEHOLDER}
        />
        {sold ? <SoldStamp label={soldLabel} /> : null}
        {favorite && favoriteLabel ? (
          <FavoriteStamp label={favoriteLabel} />
        ) : null}
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/30 bg-umber-deep/85 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-parchment shadow-md backdrop-blur-sm sm:text-[11px]">
          {openZoomLabel}
        </span>
      </button>

      {open ? (
        <div
          ref={shellRef}
          className="fixed inset-0 z-[260] flex flex-col bg-umber-deep/97 backdrop-blur-md supports-[height:100dvh]:min-h-[100dvh] supports-[height:100dvh]:max-h-[100dvh]"
          role="dialog"
          aria-modal="true"
          aria-label={openZoomLabel}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:gap-3 sm:px-6">
            <p className="min-w-0 flex-1 truncate font-serif text-sm text-parchment sm:text-base">
              {alt}
            </p>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="focus-ring rounded-md px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-parchment/80 hover:text-parchment sm:px-3 sm:text-xs"
                aria-label={
                  isFullscreen ? exitFullscreenLabel : fullscreenLabel
                }
              >
                {isFullscreen ? exitFullscreenLabel : fullscreenLabel}
              </button>
              <button
                type="button"
                onClick={closeZoom}
                className="focus-ring rounded-md px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-parchment/80 hover:text-parchment sm:px-3 sm:text-xs"
              >
                {closeLabel}
              </button>
            </div>
          </div>
          <ZoomablePaintingFrame
            key={src}
            src={src}
            alt={alt}
            sizes="(max-width: 1024px) 100vw, 90vw"
            priority
            resetKey={src}
            zoomInLabel={zoomInLabel}
            zoomOutLabel={zoomOutLabel}
            zoomResetLabel={zoomResetLabel}
            zoomHint={combinedHint || undefined}
            variant="dark"
            className="min-h-0 flex-1"
            showFloatingNav={hasNav}
            onSwipePrev={prevSlug ? goPrev : undefined}
            onSwipeNext={nextSlug ? goNext : undefined}
            floatingLeft={
              prevSlug ? (
                <Link
                  href={`/gallery/${prevSlug}?zoom=1`}
                  scroll={false}
                  className={zoomFrameNavBtnClass}
                  aria-label={prevLabel}
                >
                  <span aria-hidden>←</span>
                </Link>
              ) : null
            }
            floatingRight={
              nextSlug ? (
                <Link
                  href={`/gallery/${nextSlug}?zoom=1`}
                  scroll={false}
                  className={zoomFrameNavBtnClass}
                  aria-label={nextLabel}
                >
                  <span aria-hidden>→</span>
                </Link>
              ) : null
            }
          />
        </div>
      ) : null}
    </>
  );
}
