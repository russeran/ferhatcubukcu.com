import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readArtworks, readSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 50;
const IMG_MAX_W = PAGE_W - 2 * MARGIN;
const IMG_MAX_H = 140;

/** Standard WinAnsi fonts in pdf-lib cannot encode all Unicode; map Turkish letters and fall back for the rest. */
function textForPdfWinAnsi(input: string): string {
  const tr: Record<string, string> = {
    ğ: "g",
    Ğ: "G",
    ş: "s",
    Ş: "S",
    ı: "i",
    İ: "I",
    ö: "o",
    Ö: "O",
    ü: "u",
    Ü: "U",
    ç: "c",
    Ç: "C",
  };
  const stripped = input.normalize("NFD").replace(/\p{M}/gu, "");
  let out = "";
  for (const ch of stripped) {
    if (tr[ch]) {
      out += tr[ch];
      continue;
    }
    const code = ch.codePointAt(0)!;
    if (code >= 0x20 && code <= 0x7e) out += ch;
    else out += "?";
  }
  return out;
}

/** Prefer ASCII-friendly punctuation so Helvetica WinAnsi never skips glyphs. */
function sanitizePdfLine(input: string): string {
  return textForPdfWinAnsi(
    input
      .replace(/[\u2013\u2014\u2212]/g, "-")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
  );
}

function wrapLine(text: string, maxChars: number): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const words = t.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w.length > maxChars ? w.slice(0, maxChars) : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [];
}

function resolveArtworkImageUrl(image: string): string {
  const trimmed = image.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return absoluteUrl(path);
}

function isProbablySvg(url: string): boolean {
  return /\.svg(\?|$)/i.test(url);
}

async function fetchRasterForPdf(
  url: string
): Promise<{ kind: "jpg" | "png"; bytes: Uint8Array } | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length < 8) return null;
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      return { kind: "jpg", bytes };
    }
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return { kind: "png", bytes };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  const settings = await readSettings();
  const works = (await readArtworks())
    .filter((a) => a.published)
    .sort((a, b) => a.order - b.order);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensureRoom = (minYFromBottom: number) => {
    if (y < MARGIN + minYFromBottom) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  const drawLines = (text: string, size = 10, bold = false) => {
    const f = bold ? fontBold : font;
    const safe = sanitizePdfLine(text);
    if (!safe.trim()) return;
    for (const line of wrapLine(safe, 85)) {
      if (!line) continue;
      ensureRoom(size + 24);
      page.drawText(line, {
        x: MARGIN,
        y,
        size,
        font: f,
        color: rgb(0.15, 0.12, 0.1),
      });
      y -= size + 3;
    }
  };

  const drawImageBlock = async (imageUrl: string) => {
    if (!imageUrl || isProbablySvg(imageUrl)) return;
    const raster = await fetchRasterForPdf(imageUrl);
    if (!raster) return;

    let embedded;
    try {
      embedded =
        raster.kind === "jpg"
          ? await pdfDoc.embedJpg(raster.bytes)
          : await pdfDoc.embedPng(raster.bytes);
    } catch {
      return;
    }

    const { width: iw, height: ih } = embedded;
    const scale = Math.min(IMG_MAX_W / iw, IMG_MAX_H / ih, 1);
    const w = iw * scale;
    const h = ih * scale;

    if (y - h < MARGIN) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
    page.drawImage(embedded, {
      x: MARGIN,
      y: y - h,
      width: w,
      height: h,
    });
    y -= h + 10;
  };

  drawLines(`${settings.artistName} — published works`, 16, true);
  y -= 6;
  drawLines(`Generated ${new Date().toISOString().slice(0, 10)}`, 9);
  y -= 8;

  if (works.length === 0) {
    drawLines(
      "No published paintings are listed yet. Add or publish works in the admin panel.",
      10
    );
  }

  for (const a of works) {
    const url = absoluteUrl(`/en/gallery/${a.slug}`);
    const bits = [
      a.year,
      a.mediumEn,
      a.dimensions,
      a.priceEn ? `Price: ${a.priceEn}` : null,
    ].filter(Boolean);

    drawLines(a.titleEn || a.titleTr || "Untitled", 12, true);

    const imgUrl = resolveArtworkImageUrl(a.image);
    await drawImageBlock(imgUrl);

    if (bits.length) {
      drawLines(bits.map(String).join(" · "), 9);
    }
    drawLines(url, 8);
    y -= 8;
  }

  y -= 4;
  drawLines("-", 10);
  drawLines(`Contact: ${settings.contactEmail || ""}`, 10);
  const beh = settings.behance?.trim();
  if (beh) drawLines(`Portfolio: ${beh}`, 10);

  const pdfBytes = await pdfDoc.save();
  const filename = `ferhat-cubukcu-curator-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
