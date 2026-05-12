"use client";

import Image from "next/image";
import { TrackedOutboundLink } from "@/components/TrackedOutboundLink";
import type { InstagramFeedItem } from "@/lib/instagram-feed";

type Props = {
  items: InstagramFeedItem[];
  videoLabel: string;
};

function truncateCaption(text: string, max = 120): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function InstagramFeedGrid({ items, videoLabel }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4">
      {items.map((item) => {
        const label =
          item.caption && item.caption.trim().length > 0
            ? truncateCaption(item.caption)
            : "Instagram";
        const isVideo =
          item.mediaType.toUpperCase() === "VIDEO" ||
          item.mediaType.toUpperCase() === "REELS";

        return (
          <li key={item.id} className="relative aspect-square overflow-hidden rounded-lg border border-umber/10 bg-umber/5 shadow-sm">
            <TrackedOutboundLink
              event="instagram_feed_post_click"
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-oxide/40 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
              aria-label={label}
            >
              <Image
                src={item.displaySrc}
                alt=""
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                unoptimized
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-umber-deep/55 via-transparent to-transparent opacity-80 transition group-hover:opacity-95" />
              {isVideo ? (
                <span className="pointer-events-none absolute left-2 top-2 rounded bg-umber-deep/75 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-parchment">
                  {videoLabel}
                </span>
              ) : null}
              {item.caption ? (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-3 px-2 pb-2 pt-6 text-left text-[11px] leading-snug text-parchment/95 sm:text-xs">
                  {truncateCaption(item.caption, 90)}
                </span>
              ) : null}
            </TrackedOutboundLink>
          </li>
        );
      })}
    </ul>
  );
}
