import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
};

/** Standard page intro: eyebrow, title, optional lead. */
export function PageHeader({ eyebrow, title, lead, className }: Props) {
  return (
    <header className={cn("page-header", className)}>
      {eyebrow ? <p className="editorial-eyebrow">{eyebrow}</p> : null}
      <h1 className="page-title">{title}</h1>
      {lead ? <p className="page-lead">{lead}</p> : null}
    </header>
  );
}
