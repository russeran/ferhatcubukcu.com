import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://ferhatcubukcu.com"
  ),
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
