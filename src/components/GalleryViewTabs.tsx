"use client";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  view: "grid" | "chronology";
  sort: string;
  series: string | undefined;
  labelGrid: string;
  labelChronology: string;
  tabsAria: string;
};

function buildHref(
  view: "grid" | "chronology",
  sort: string,
  series: string | undefined
) {
  const p = new URLSearchParams();
  if (view !== "grid") p.set("view", view);
  if (sort && sort !== "order") p.set("sort", sort);
  if (series?.trim()) p.set("series", series.trim());
  const q = p.toString();
  return q ? `/gallery?${q}` : "/gallery";
}

export function GalleryViewTabs({
  view,
  sort,
  series,
  labelGrid,
  labelChronology,
  tabsAria,
}: Props) {
  return (
    <div
      className="view-tabs"
      role="tablist"
      aria-label={tabsAria}
    >
      <Link
        href={buildHref("grid", sort, series)}
        scroll={false}
        className={cn("view-tab", view === "grid" && "view-tab-active")}
        aria-selected={view === "grid"}
        role="tab"
      >
        {labelGrid}
      </Link>
      <Link
        href={buildHref("chronology", sort, series)}
        scroll={false}
        className={cn(
          "view-tab",
          view === "chronology" && "view-tab-active"
        )}
        aria-selected={view === "chronology"}
        role="tab"
      >
        {labelChronology}
      </Link>
    </div>
  );
}
