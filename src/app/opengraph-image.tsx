import { ImageResponse } from "next/og";
import { BRAND, SiteBrandMark } from "@/lib/site-brand-icon";

export const alt = "Ferhat Çubukçu — Painter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(125deg, ${BRAND.anthraciteDeep} 0%, ${BRAND.anthracite} 42%, #40464c 100%)`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: `linear-gradient(180deg, ${BRAND.goldleaf}88, transparent 70%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "56px 72px",
          }}
        >
          <SiteBrandMark size={200} showPhi />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
              maxWidth: 640,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 22,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: BRAND.goldleaf,
                fontFamily: "Georgia, serif",
              }}
            >
              Fibonacci · golden ratio
            </p>
            <h1
              style={{
                margin: "20px 0 0",
                fontSize: 72,
                lineHeight: 1.02,
                fontWeight: 600,
                fontStyle: "italic",
                color: BRAND.ink,
                fontFamily: "Georgia, serif",
              }}
            >
              Ferhat Çubukçu
            </h1>
            <p
              style={{
                margin: "24px 0 0",
                fontSize: 28,
                color: BRAND.inkMuted,
                fontFamily: "Georgia, serif",
              }}
            >
              Contemporary painting
            </p>
            <div
              style={{
                marginTop: 32,
                width: 120,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${BRAND.goldleaf}, transparent)`,
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
