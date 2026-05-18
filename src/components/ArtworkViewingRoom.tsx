"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { ArtworkInquiryLink } from "@/components/ArtworkInquiryLink";
import {
  ZoomablePaintingFrame,
  zoomFrameNavBtnClass,
} from "@/components/ZoomablePaintingFrame";
import { cn } from "@/lib/utils";

export type ViewingRoomDetailRow = {
  label: string;
  value: string;
  emphasize?: boolean;
};

type Props = {
  title: string;
  mainSrc: string;
  prevSlug: string | null;
  nextSlug: string | null;
  enterLabel: string;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
  /** When true, open the overlay on load (e.g. prev/next from inside the room). */
  initialOpen?: boolean;
  detailRows: ViewingRoomDetailRow[];
  description?: string;
  inquiryHref?: string;
  inquiryCta?: string;
  /** Extra classes for the enter button (layout next to title, avoid overlapping admin actions). */
  triggerClassName?: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomResetLabel: string;
  zoomHint?: string;
};

export function ArtworkViewingRoom({
  title,
  mainSrc,
  prevSlug,
  nextSlug,
  enterLabel,
  prevLabel,
  nextLabel,
  closeLabel,
  initialOpen = false,
  detailRows,
  description,
  inquiryHref,
  inquiryCta,
  triggerClassName,
  zoomInLabel,
  zoomOutLabel,
  zoomResetLabel,
  zoomHint,
}: Props) {
  const [open, setOpen] = useState(initialOpen);
  const hasDetailsPanel = useMemo(
    () =>
      detailRows.length > 0 ||
      Boolean(description?.trim()) ||
      Boolean(inquiryHref && inquiryCta),
    [detailRows, description, inquiryHref, inquiryCta]
  );
  const router = useRouter();
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    if (typeof window !== "undefined" && window.location.search.includes("room")) {
      router.replace(pathname);
    }
  }, [pathname, router]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") close();
    },
    [open, close]
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
        className={cn(
          "focus-ring inline-flex shrink-0 items-center gap-2 rounded-full border border-umber/20 bg-parchment/90 px-4 py-2 text-xs font-semibold uppercase tracking-editorial text-ink transition hover:border-goldleaf/50 hover:text-oxide",
          triggerClassName
        )}
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
              onClick={close}
              className="focus-ring shrink-0 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-parchment/80 hover:text-parchment"
            >
              {closeLabel}
            </button>
          </div>
          <div
            className={`flex min-h-0 flex-1 flex-col ${hasDetailsPanel ? "lg:flex-row" : ""}`}
          >
            <div className="relative flex min-h-[36vh] min-w-0 flex-1 flex-col lg:min-h-0">
              <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-3 pt-2 sm:px-6 sm:pb-4 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-6">
                <ZoomablePaintingFrame
                  src={mainSrc}
                  alt=""
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  priority
                  zoomInLabel={zoomInLabel}
                  zoomOutLabel={zoomOutLabel}
                  zoomResetLabel={zoomResetLabel}
                  zoomHint={zoomHint}
                  variant="dark"
                  className="min-h-0 flex-1"
                  showFloatingNav={Boolean(prevSlug || nextSlug)}
                  floatingLeft={
                    prevSlug ? (
                      <Link
                        href={`/gallery/${prevSlug}?room=1`}
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
                        href={`/gallery/${nextSlug}?room=1`}
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
            </div>
            {hasDetailsPanel ? (
              <aside
                className="max-h-[38vh] shrink-0 overflow-y-auto border-t border-white/10 bg-black/30 px-4 py-4 sm:px-5 lg:max-h-none lg:w-[min(100%,400px)] lg:border-l lg:border-t-0 lg:py-6"
              >
                {detailRows.length > 0 ? (
                  <dl className="space-y-3 text-sm text-parchment/85">
                    {detailRows.map((row, i) => (
                      <div
                        key={`${row.label}-${i}`}
                        className="grid gap-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-3 sm:gap-y-0"
                      >
                        <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-parchment/45">
                          {row.label}
                        </dt>
                        <dd
                          className={`min-w-0 leading-snug ${row.emphasize ? "font-medium text-parchment" : ""}`}
                        >
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {description?.trim() ? (
                  <p className="mt-4 whitespace-pre-wrap border-t border-white/10 pt-4 text-xs leading-relaxed text-parchment/75">
                    {description.trim()}
                  </p>
                ) : null}
                {inquiryHref && inquiryCta ? (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <ArtworkInquiryLink
                      href={inquiryHref}
                      className="accent-outline-btn px-4 py-2 text-xs uppercase tracking-editorial"
                    >
                      {inquiryCta}
                    </ArtworkInquiryLink>
                  </div>
                ) : null}
              </aside>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
