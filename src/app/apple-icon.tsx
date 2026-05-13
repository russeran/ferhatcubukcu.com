import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 28,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 128,
            height: 128,
            border: "11px solid #c9a85a",
            borderRadius: "50%",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            transform: "rotate(200deg)",
            top: 34,
            left: 26,
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 36,
            height: 36,
            background: "#922f3d",
            borderRadius: "50%",
            top: 38,
            left: 38,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
