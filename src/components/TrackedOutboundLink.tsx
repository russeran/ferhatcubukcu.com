"use client";

import type { ReactNode } from "react";

type Props = {
  event: string;
  href: string;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
};

/** Fires a Vercel Analytics custom event when the outbound link is used. */
export function TrackedOutboundLink({
  event,
  href,
  className,
  children,
  target,
  rel,
}: Props) {
  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => {
        try {
          void import("@vercel/analytics").then((m) => {
            if (typeof m.track === "function") m.track(event);
          });
        } catch {
          /* optional dependency path */
        }
      }}
    >
      {children}
    </a>
  );
}
