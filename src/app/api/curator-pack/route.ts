import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readArtworks, readSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

/** Standard WinAnsi fonts in pdf-lib cannot encode all Unicode; map common Turkish letters and fall back for the rest. */
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

function wrapLine(text: string, maxChars: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
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
  return lines.length ? lines : [""];
}

export async function GET() {
  const settings = await readSettings();
  const works = (await readArtworks())
    .filter((a) => a.published)
    .sort((a, b) => a.order - b.order);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  const pageW = 595;
  const pageH = 842;
  let page = pdfDoc.addPage([pageW, pageH]);
  let y = pageH - margin;

  const draw = (text: string, size = 10, bold = false) => {
    const f = bold ? fontBold : font;
    const safe = textForPdfWinAnsi(text);
    for (const line of wrapLine(safe, 85)) {
      if (y < margin + 40) {
        page = pdfDoc.addPage([pageW, pageH]);
        y = pageH - margin;
      }
      page.drawText(line, {
        x: margin,
        y,
        size,
        font: f,
        color: rgb(0.15, 0.12, 0.1),
      });
      y -= size + 3;
    }
  };

  draw(`${textForPdfWinAnsi(settings.artistName)} — published works`, 16, true);
  y -= 6;
  draw(`Generated ${new Date().toISOString().slice(0, 10)}`, 9);
  y -= 10;

  for (const a of works) {
    const title = a.titleEn;
    const url = absoluteUrl(`/en/gallery/${a.slug}`);
    const bits = [
      a.year,
      a.mediumEn,
      a.dimensions,
      a.priceEn ? `Price: ${a.priceEn}` : null,
    ].filter(Boolean);
    draw(title, 12, true);
    draw(bits.join(" · "), 9);
    draw(url, 8);
    y -= 6;
  }

  draw("—", 10);
  draw(`Contact: ${settings.contactEmail || ""}`, 10);
  const beh = settings.behance?.trim();
  if (beh) draw(`Portfolio: ${beh}`, 10);

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
