import { ImageResponse } from "next/og";
import { SiteBrandMark } from "@/lib/site-brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<SiteBrandMark size={180} showPhi />, {
    ...size,
  });
}
