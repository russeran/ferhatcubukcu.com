import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  wide?: boolean;
  className?: string;
};

/** Standard page width and vertical rhythm. */
export function PageShell({ children, wide, className }: Props) {
  return (
    <div
      className={cn(
        "page-shell-frame relative z-10 animate-fade-up",
        wide ? "page-shell-wide" : "page-shell",
        className
      )}
    >
      {children}
    </div>
  );
}
