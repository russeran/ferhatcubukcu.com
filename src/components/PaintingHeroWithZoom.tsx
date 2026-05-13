"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SoldStamp } from "@/components/SoldStamp";
import { ZoomablePaintingFrame } from "@/components/ZoomablePaintingFrame";
import { IMAGE_BLUR_PLACEHOLDER } from "@/lib/image-blur";

type Props = {
  src: string;
  alt: string;
  sold: boolean;
  soldLabel: string;
  openZoomLabel: string;
  closeLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomResetLabel: string;
  zoomHint?: string;
  sizes: string;
};

export function PaintingHeroWithZoom({
  src,
  alt,
  sold,
  soldLabel,
  openZoomLabel,
  closeLabel,
  zoomInLabel,
  zoomOutLabel,
  zoomResetLabel,
  zoomHint,
  sizes,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative aspect-[3/4] w-full overflow-hidden rounded-md bg-white text-left shadow-gallery ring-1 ring-umber/10 lg:aspect-[4/5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-goldleaf/50 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
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
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/30 bg-umber-deep/85 px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-parchment shadow-md backdrop-blur-sm sm:text-[11px]">
          {openZoomLabel}
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[260] flex flex-col bg-umber-deep/97 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={openZoomLabel}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
            <p className="min-w-0 truncate font-serif text-sm text-parchment sm:text-base">
              {alt}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring shrink-0 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-parchment/80 hover:text-parchment"
            >
              {closeLabel}
            </button>
          </div>
          <ZoomablePaintingFrame
            src={src}
            alt={alt}
            sizes="(max-width: 1024px) 100vw, 90vw"
            priority
            zoomInLabel={zoomInLabel}
            zoomOutLabel={zoomOutLabel}
            zoomResetLabel={zoomResetLabel}
            zoomHint={zoomHint}
            variant="dark"
            className="min-h-0 flex-1"
          />
        </div>
      ) : null}
    </>
  );
}
