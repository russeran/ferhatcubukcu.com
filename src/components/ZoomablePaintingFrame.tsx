"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const STEP = 0.35;

type Props = {
  src: string;
  alt?: string;
  sizes: string;
  priority?: boolean;
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomResetLabel: string;
  zoomHint?: string;
  /** Reset zoom and pan when this value changes (e.g. lightbox slide). */
  resetKey?: string | number;
  className?: string;
  variant?: "dark" | "light";
  /** Rendered above the image (e.g. prev/next), not scaled with zoom. */
  floatingControls?: ReactNode;
};

export function ZoomablePaintingFrame({
  src,
  alt = "",
  sizes,
  priority = false,
  zoomInLabel,
  zoomOutLabel,
  zoomResetLabel,
  zoomHint,
  resetKey,
  className,
  variant = "dark",
  floatingControls,
}: Props) {
  const vpRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    sx: number;
    sy: number;
    px: number;
    py: number;
  } | null>(null);

  useEffect(() => {
    panRef.current = { x: 0, y: 0 };
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [resetKey]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const clampPan = useCallback((nx: number, ny: number, s: number) => {
    if (s <= MIN_SCALE) return { x: 0, y: 0 };
    const el = vpRef.current;
    if (!el) return { x: nx, y: ny };
    const w = el.clientWidth;
    const h = el.clientHeight;
    const mx = (Math.max(0, s - 1) * w) / 2;
    const my = (Math.max(0, s - 1) * h) / 2;
    return {
      x: Math.max(-mx, Math.min(mx, nx)),
      y: Math.max(-my, Math.min(my, ny)),
    };
  }, []);

  useEffect(() => {
    if (scale <= MIN_SCALE) {
      setPan({ x: 0, y: 0 });
      return;
    }
    setPan((p) => clampPan(p.x, p.y, scale));
  }, [scale, clampPan]);

  useEffect(() => {
    const el = vpRef.current;
    if (!el || scale <= MIN_SCALE) return;
    const ro = new ResizeObserver(() => {
      setPan((p) => clampPan(p.x, p.y, scale));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scale, clampPan]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const d = e.deltaY > 0 ? -STEP * 0.65 : STEP * 0.65;
    setScale((s) =>
      Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, Math.round((s + d) * 100) / 100)
      )
    );
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= MIN_SCALE) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const p = panRef.current;
    dragRef.current = {
      sx: p.x,
      sy: p.y,
      px: e.clientX,
      py: e.clientY,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || scale <= MIN_SCALE) return;
    const nx = d.sx + (e.clientX - d.px);
    const ny = d.sy + (e.clientY - d.py);
    setPan(clampPan(nx, ny, scale));
  };

  const endDrag = (e: React.PointerEvent) => {
    const was = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (was) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
  };

  const onDoubleClick = () => {
    if (scale > MIN_SCALE) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  const zoomOut = () =>
    setScale((s) =>
      Math.max(MIN_SCALE, Math.round((s - STEP) * 100) / 100)
    );
  const zoomIn = () =>
    setScale((s) =>
      Math.min(MAX_SCALE, Math.round((s + STEP) * 100) / 100)
    );
  const reset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const btnBase =
    variant === "light"
      ? "rounded-md border border-umber/25 bg-parchment/90 px-3 py-1.5 text-xs font-semibold text-umber-deep transition hover:border-oxide/40 disabled:pointer-events-none disabled:opacity-35"
      : "rounded-md border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-parchment/90 transition hover:bg-black/55 disabled:pointer-events-none disabled:opacity-35";

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}>
      <div
        ref={vpRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={onDoubleClick}
        className={cn(
          "relative min-h-[min(36vh,480px)] flex-1 touch-none overflow-hidden sm:min-h-[min(50vh,560px)] lg:min-h-[min(28vh,400px)]",
          scale > MIN_SCALE && "cursor-grab",
          dragging && "cursor-grabbing"
        )}
      >
        <div
          className="absolute inset-0 flex items-center justify-center will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transition: dragging ? "none" : "transform 0.2s ease-out",
          }}
        >
          <div className="pointer-events-none relative h-full max-h-[min(72vh,920px)] w-full max-w-[min(100%,1200px)] select-none">
            <Image
              src={src}
              alt={alt}
              fill
              draggable={false}
              className="object-contain"
              sizes={sizes}
              priority={priority}
            />
          </div>
        </div>
        {floatingControls ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-1 sm:px-3">
            {floatingControls}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-col gap-2 border-t px-2 py-2 sm:px-3",
          variant === "dark"
            ? "border-white/10 bg-black/25"
            : "border-umber/15 bg-parchment/80"
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className={btnBase}
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label={zoomOutLabel}
          >
            −
          </button>
          <button
            type="button"
            className={btnBase}
            onClick={reset}
            aria-label={zoomResetLabel}
          >
            ⊙
          </button>
          <button
            type="button"
            className={btnBase}
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label={zoomInLabel}
          >
            +
          </button>
        </div>
        {zoomHint ? (
          <p
            className={cn(
              "text-center text-[10px] leading-snug sm:text-[11px]",
              variant === "dark" ? "text-parchment/45" : "text-umber/50"
            )}
          >
            {zoomHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
