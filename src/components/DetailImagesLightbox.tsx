"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ZoomablePaintingFrame } from "@/components/ZoomablePaintingFrame";

type Slide = { src: string; alt: string };

type Props = {
  slides: Slide[];
  title: string;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomResetLabel: string;
  zoomHint?: string;
};

export function DetailImagesLightbox({
  slides,
  title,
  closeLabel,
  prevLabel,
  nextLabel,
  zoomInLabel,
  zoomOutLabel,
  zoomResetLabel,
  zoomHint,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const index = openIndex ?? 0;
  const slide = slides[index];

  const close = useCallback(() => {
    setOpenIndex(null);
  }, []);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (openIndex === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") {
        setOpenIndex((i) =>
          i === null ? null : (i - 1 + slides.length) % slides.length
        );
      }
      if (e.key === "ArrowRight") {
        setOpenIndex((i) =>
          i === null ? null : (i + 1) % slides.length
        );
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
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {slides.map((s, i) => (
          <li key={`${s.src}-${i}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
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
            <button
              type="button"
              onClick={close}
              className="focus-ring shrink-0 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-parchment/85 hover:text-parchment"
            >
              {closeLabel}
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <ZoomablePaintingFrame
              src={slide.src}
              alt={slide.alt}
              sizes="100vw"
              resetKey={slide.src}
              zoomInLabel={zoomInLabel}
              zoomOutLabel={zoomOutLabel}
              zoomResetLabel={zoomResetLabel}
              zoomHint={zoomHint}
              variant="dark"
              className="min-h-0 flex-1"
              floatingControls={
                slides.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenIndex((i) =>
                          i === null
                            ? null
                            : (i - 1 + slides.length) % slides.length
                        )
                      }
                      className="focus-ring pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/35 text-parchment sm:h-12 sm:w-12"
                      aria-label={prevLabel}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenIndex((i) =>
                          i === null ? null : (i + 1) % slides.length
                        )
                      }
                      className="focus-ring pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/35 text-parchment sm:h-12 sm:w-12"
                      aria-label={nextLabel}
                    >
                      →
                    </button>
                  </>
                ) : null
              }
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
