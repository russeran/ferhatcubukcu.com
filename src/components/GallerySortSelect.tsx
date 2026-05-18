"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { GallerySortId } from "@/lib/gallery-sort";
import { normalizeGallerySort } from "@/lib/gallery-sort";

type Option = { id: GallerySortId; label: string };

type Props = {
  label: string;
  options: Option[];
};

export function GallerySortSelect({ label, options }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = normalizeGallerySort(searchParams.get("sort") ?? undefined);

  return (
    <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="shrink-0 text-xs font-medium uppercase tracking-[0.22em] text-umber/50">
        {label}
      </span>
      <select
        className="focus-ring min-h-11 max-w-full rounded-md border border-umber/15 bg-parchment/80 px-3 py-2.5 text-sm text-ink shadow-sm backdrop-blur-sm sm:min-w-[14rem]"
        value={current}
        onChange={(e) => {
          const v = e.target.value as GallerySortId;
          const next = new URLSearchParams(searchParams.toString());
          if (v === "order") next.delete("sort");
          else next.set("sort", v);
          const q = next.toString();
          router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
        }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
