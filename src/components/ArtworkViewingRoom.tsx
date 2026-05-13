"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { ArtworkInquiryLink } from "@/components/ArtworkInquiryLink";

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
              <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-3 pt-2 sm:px-6 sm:pb-4 sm:pt-3 lg:px-8 lg:pb-8 lg:pt-6">
                <div className="relative h-full min-h-[200px] w-full max-h-[min(72vh,920px)] max-w-[min(100%,1200px)]">
                  <Image
                    src={mainSrc}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    priority
                  />
                </div>
                {prevSlug ? (
                  <Link
                    href={`/gallery/${prevSlug}?room=1`}
                    scroll={false}
                    className="focus-ring absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-parchment backdrop-blur-sm transition hover:bg-black/55 sm:left-4"
                    aria-label={prevLabel}
                  >
                    <span aria-hidden className="text-lg">
                      ←
                    </span>
                  </Link>
                ) : null}
                {nextSlug ? (
                  <Link
                    href={`/gallery/${nextSlug}?room=1`}
                    scroll={false}
                    className="focus-ring absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-parchment backdrop-blur-sm transition hover:bg-black/55 sm:right-4"
                    aria-label={nextLabel}
                  >
                    <span aria-hidden className="text-lg">
                      →
                    </span>
                  </Link>
                ) : null}
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
                      className="inline-flex rounded-full border border-oxide/40 bg-oxide/10 px-4 py-2 text-xs font-semibold uppercase tracking-editorial text-goldleaf transition hover:border-goldleaf/80 hover:bg-oxide/20"
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
