"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  locale: string;
  slug: string;
  title: string;
  mainSrc: string;
  prevSlug: string | null;
  nextSlug: string | null;
  enterLabel: string;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
};

export function ArtworkViewingRoom({
  locale: _locale,
  slug: _slug,
  title,
  mainSrc,
  prevSlug,
  nextSlug,
  enterLabel,
  prevLabel,
  nextLabel,
  closeLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    },
    [open]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring mb-4 inline-flex items-center gap-2 rounded-full border border-umber/20 bg-parchment/90 px-4 py-2 text-xs font-semibold uppercase tracking-editorial text-umber-deep transition hover:border-goldleaf/50 hover:text-oxide"
      >
        <span aria-hidden className="text-base leading-none">
          ⛶
        </span>
        {enterLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[280] flex flex-col bg-umber-deep/97 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
            <p className="min-w-0 truncate font-serif text-sm text-parchment sm:text-base">
              {title}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring shrink-0 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-parchment/80 hover:text-parchment"
            >
              {closeLabel}
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
            <div className="relative h-full w-full max-h-[calc(100dvh-8rem)] max-w-[min(100%,1200px)]">
              <Image
                src={mainSrc}
                alt=""
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            {prevSlug ? (
              <Link
                href={`/gallery/${prevSlug}`}
                className="focus-ring absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-parchment backdrop-blur-sm transition hover:bg-black/50 sm:left-6"
                aria-label={prevLabel}
              >
                <span aria-hidden className="text-lg">
                  ←
                </span>
              </Link>
            ) : null}
            {nextSlug ? (
              <Link
                href={`/gallery/${nextSlug}`}
                className="focus-ring absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-parchment backdrop-blur-sm transition hover:bg-black/50 sm:right-6"
                aria-label={nextLabel}
              >
                <span aria-hidden className="text-lg">
                  →
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
