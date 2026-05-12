type Props = {
  /** Visible label, e.g. "SOLD" / "SATILDI" from i18n */
  label: string;
  className?: string;
};

/** Corner mark on artwork images (works inside overflow-hidden cards). */
export function SoldStamp({ label, className = "" }: Props) {
  return (
    <span
      className={`pointer-events-none absolute left-3 top-3 z-10 select-none rounded-md bg-umber-deep/95 px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-parchment shadow-md ring-1 ring-black/15 ${className}`}
      aria-hidden
    >
      {label}
    </span>
  );
}
