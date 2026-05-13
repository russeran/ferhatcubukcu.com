"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Slide = { src: string; alt: string };

type Props = {
  slides: Slide[];
  title: string;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
  zoomLabel: string;
  unzoomLabel: string;
};

export function DetailImagesLightbox({
  slides,
  title,
  closeLabel,
  prevLabel,
  nextLabel,
  zoomLabel,
  unzoomLabel,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const index = openIndex ?? 0;
  const slide = slides[index];

  const close = useCallback(() => {
    setOpenIndex(null);
    setZoomed(false);
  }, []);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (openIndex === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") {
        setOpenIndex((i) =>
          i === null ? null : (i - 1 + slides.length) % slides.length
        );
        setZoomed(false);
      }
      if (e.key === "ArrowRight") {
        setOpenIndex((i) =>
          i === null ? null : (i + 1) % slides.length
        );
        setZoomed(false);
      }
    },
    [close, openIndex, slides.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  useEffect(() => {
    if (openIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openIndex]);

  if (slides.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {slides.map((s, i) => (
          <li key={`${s.src}-${i}`}>
            <button
              type="button"
              onClick={() => {
                setOpenIndex(i);
                setZoomed(false);
              }}
              className="group relative aspect-square w-full overflow-hidden rounded-md bg-parchment-dark shadow-sm ring-1 ring-umber/10 transition duration-500 ease-out-expo hover:ring-goldleaf/30"
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                className="object-cover transition duration-700 ease-out-expo group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && slide ? (
        <div
          className="fixed inset-0 z-[290] flex flex-col bg-umber-deep/96 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2 sm:px-5">
            <p className="min-w-0 truncate text-xs text-parchment/80 sm:text-sm">
              {slide.alt}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                className="focus-ring rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-parchment/85 hover:text-parchment"
              >
                {zoomed ? unzoomLabel : zoomLabel}
              </button>
              <button
                type="button"
                onClick={close}
                className="focus-ring rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-parchment/85 hover:text-parchment"
              >
                {closeLabel}
              </button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6">
            <div
              className={cn(
                "relative h-full w-full max-h-[calc(100dvh-7rem)] max-w-[min(100%,1400px)] transition-transform duration-500 ease-out-expo",
                zoomed && "scale-[1.35] cursor-zoom-out"
              )}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            {slides.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpenIndex((i) =>
                      i === null
                        ? null
                        : (i - 1 + slides.length) % slides.length
                    );
                    setZoomed(false);
                  }}
                  className="focus-ring absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-parchment sm:left-5"
                  aria-label={prevLabel}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenIndex((i) =>
                      i === null ? null : (i + 1) % slides.length
                    );
                    setZoomed(false);
                  }}
                  className="focus-ring absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-parchment sm:right-5"
                  aria-label={nextLabel}
                >
                  →
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
