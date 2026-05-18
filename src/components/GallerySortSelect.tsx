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
      <span className="text-meta shrink-0">
        {label}
      </span>
      <select
        className="form-control max-w-full sm:min-w-[14rem]"
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
