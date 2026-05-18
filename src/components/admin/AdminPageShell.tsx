import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Admin pages — parchment panel on the public anthracite shell. */
export function AdminPageShell({
  children,
  title,
  description,
  actions,
  className,
}: Props) {
  return (
    <div className={cn("admin-surface", className)}>
      {title || description || actions ? (
        <header className="admin-header">
          <div>
            {title ? <h1 className="admin-title">{title}</h1> : null}
            {description ? (
              <div className="admin-lead max-w-lg">{description}</div>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
