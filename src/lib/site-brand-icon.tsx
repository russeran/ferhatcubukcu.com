/** Brand mark: anthracite field, gold spiral, oxide accent — used in favicon & OG images. */

export const BRAND = {
  anthracite: "#383e42",
  anthraciteDeep: "#2f3439",
  goldleaf: "#c9a85a",
  oxide: "#922f3d",
  ink: "#f0ede8",
  inkMuted: "#c5cad1",
} as const;

type MarkProps = {
  size: number;
  showPhi?: boolean;
};

/** Square brand mark for app icons. */
export function SiteBrandMark({ size, showPhi = false }: MarkProps) {
  const r = Math.round(size * 0.12);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(145deg, ${BRAND.anthracite} 0%, ${BRAND.anthraciteDeep} 100%)`,
        borderRadius: Math.max(4, Math.round(size * 0.14)),
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: `${Math.round(size / 5)}px ${Math.round(size / 5)}px`,
        }}
      />
      <svg
        width={size * 0.72}
        height={size * 0.72}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
      >
        <path
          d="M6 24c0-8 4-14 10-16 6-2 10 2 10 8"
          stroke={BRAND.goldleaf}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="10" cy="10" r="2.25" fill={BRAND.oxide} />
      </svg>
      {showPhi ? (
        <span
          style={{
            position: "absolute",
            right: Math.round(size * 0.1),
            bottom: Math.round(size * 0.08),
            fontSize: Math.round(size * 0.22),
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: BRAND.goldleaf,
            opacity: 0.9,
          }}
        >
          φ
        </span>
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: r,
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.12)`,
        }}
      />
    </div>
  );
}
