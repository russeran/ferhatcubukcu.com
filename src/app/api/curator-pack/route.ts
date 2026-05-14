import { NextResponse } from "next/server";
import type { PDFPage, PDFFont, PDFImage } from "pdf-lib";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Artwork } from "@/lib/types";
import { readArtworks, readSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 44;
const COL_GUTTER = 20;
const THUMB_H = 118;
/** Space reserved under each thumbnail for title + meta + URL */
const TEXT_ZONE = 58;
const ROW_GAP = 14;
const FOOTER_BLOCK = 72;

const INNER_W = PAGE_W - 2 * MARGIN;
const COL_W = (INNER_W - COL_GUTTER) / 2;
const ROW_H = THUMB_H + 8 + TEXT_ZONE + ROW_GAP;

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

const INK = rgb(0.11, 0.09, 0.08);
const MUTED = rgb(0.38, 0.34, 0.3);
const LINE = rgb(0.72, 0.66, 0.58);
const PANEL = rgb(0.96, 0.94, 0.9);

function drawWrapped(
  page: PDFPage,
  text: string,
  x: number,
  startY: number,
  size: number,
  font: PDFFont,
  fontBold: PDFFont,
  bold: boolean,
  maxChars: number,
  color = INK
): number {
  let y = startY;
  const f = bold ? fontBold : font;
  const safe = sanitizePdfLine(text);
  if (!safe.trim()) return startY;
  for (const line of wrapLine(safe, maxChars)) {
    if (!line) continue;
    page.drawText(line, {
      x,
      y,
      size,
      font: f,
      color,
    });
    y -= size + 2.5;
  }
  return y;
}

async function embedArtworkImage(
  pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>,
  imageUrl: string
): Promise<PDFImage | null> {
  if (!imageUrl || isProbablySvg(imageUrl)) return null;
  const raster = await fetchRasterForPdf(imageUrl);
  if (!raster) return null;
  try {
    return raster.kind === "jpg"
      ? await pdfDoc.embedJpg(raster.bytes)
      : await pdfDoc.embedPng(raster.bytes);
  } catch {
    return null;
  }
}

/** Same visual frame for every work: fixed box, image scaled to fit (contain), centered. */
async function drawCatalogCell(
  page: PDFPage,
  pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>,
  cellX: number,
  cellTop: number,
  colW: number,
  artwork: Artwork,
  font: PDFFont,
  fontBold: PDFFont
): Promise<void> {
  const cellBottom = cellTop - THUMB_H;

  page.drawRectangle({
    x: cellX,
    y: cellBottom,
    width: colW,
    height: THUMB_H,
    color: PANEL,
    borderColor: LINE,
    borderWidth: 0.85,
  });

  const imgUrl = resolveArtworkImageUrl(artwork.image);
  const embedded = await embedArtworkImage(pdfDoc, imgUrl);
  if (embedded) {
    const { width: iw, height: ih } = embedded;
    const s = Math.min(colW / iw, THUMB_H / ih);
    const w = iw * s;
    const h = ih * s;
    const offX = (colW - w) / 2;
    const offY = (THUMB_H - h) / 2;
    page.drawImage(embedded, {
      x: cellX + offX,
      y: cellBottom + offY,
      width: w,
      height: h,
    });
  }

  const title =
    sanitizePdfLine(artwork.titleEn || artwork.titleTr || "Untitled") +
    (artwork.sold ? " (SOLD)" : "");
  const metaBits = [
    artwork.year,
    artwork.mediumEn,
    artwork.dimensions,
    artwork.priceEn ? `Price: ${sanitizePdfLine(artwork.priceEn)}` : null,
    artwork.exhibitionEn
      ? sanitizePdfLine(artwork.exhibitionEn)
      : null,
  ].filter(Boolean) as string[];

  const url = absoluteUrl(`/en/gallery/${artwork.slug}`);
  const maxChars = Math.max(22, Math.floor(colW / 5.2));

  let ty = cellBottom - 10;
  ty = drawWrapped(page, title, cellX, ty, 9.5, font, fontBold, true, maxChars, INK);
  if (metaBits.length) {
    ty = drawWrapped(
      page,
      metaBits.join(" · "),
      cellX,
      ty - 2,
      8,
      font,
      fontBold,
      false,
      maxChars,
      MUTED
    );
  }
  drawWrapped(page, url, cellX, ty - 2, 7, font, fontBold, false, maxChars + 4, rgb(0.45, 0.4, 0.38));
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
  let rowTop = PAGE_H - MARGIN;

  const drawHeader = (p: PDFPage, top: number) => {
    let y = top;
    p.drawText(sanitizePdfLine(`${settings.artistName} — published works`), {
      x: MARGIN,
      y,
      size: 15,
      font: fontBold,
      color: INK,
    });
    y -= 20;
    p.drawText(`Curator pack · ${new Date().toISOString().slice(0, 10)}`, {
      x: MARGIN,
      y,
      size: 8.5,
      font,
      color: MUTED,
    });
    y -= 12;
    p.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.6,
      color: LINE,
    });
    return y - 14;
  };

  rowTop = drawHeader(page, rowTop - 4);

  if (works.length === 0) {
    drawWrapped(
      page,
      "No published paintings are listed yet. Add or publish works in the admin panel.",
      MARGIN,
      rowTop,
      10,
      font,
      fontBold,
      false,
      72
    );
  }

  const minY = MARGIN + FOOTER_BLOCK;

  for (let i = 0; i < works.length; i += 2) {
    if (rowTop - ROW_H < minY) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      rowTop = PAGE_H - MARGIN - 8;
    }

    const left = works[i]!;
    const right = works[i + 1];

    await drawCatalogCell(page, pdfDoc, MARGIN, rowTop, COL_W, left, font, fontBold);
    if (right) {
      await drawCatalogCell(
        page,
        pdfDoc,
        MARGIN + COL_W + COL_GUTTER,
        rowTop,
        COL_W,
        right,
        font,
        fontBold
      );
    }

    rowTop -= ROW_H;
  }

  /** Footer fixed to bottom band of last page (body layout reserves `FOOTER_BLOCK`). */
  const lastPage = pdfDoc.getPages().at(-1)!;
  const footerRuleY = MARGIN + 52;
  lastPage.drawLine({
    start: { x: MARGIN, y: footerRuleY },
    end: { x: PAGE_W - MARGIN, y: footerRuleY },
    thickness: 0.5,
    color: LINE,
  });
  let fy = footerRuleY - 8;
  fy = drawWrapped(
    lastPage,
    `Contact: ${sanitizePdfLine(settings.contactEmail || "")}`,
    MARGIN,
    fy,
    9,
    font,
    fontBold,
    false,
    80
  );
  const beh = settings.behance?.trim();
  if (beh) {
    drawWrapped(
      lastPage,
      `Portfolio: ${sanitizePdfLine(beh)}`,
      MARGIN,
      fy - 2,
      9,
      font,
      fontBold,
      false,
      80
    );
  }

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
