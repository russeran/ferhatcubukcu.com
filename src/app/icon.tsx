import { ImageResponse } from "next/og";

/** 48×48 PNG — Google Search favicon guidelines prefer raster icons. */
export const runtime = "edge";
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f1b16",
          borderRadius: 6,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 34,
            height: 34,
            border: "3px solid #c9a85a",
            borderRadius: "50%",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            transform: "rotate(200deg)",
            top: 9,
            left: 7,
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            background: "#922f3d",
            borderRadius: "50%",
            top: 10,
            left: 10,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
