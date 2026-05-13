import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readArtworks, writeArtworks, ensureUniqueSlug } from "@/lib/data";
import { diskWriteErrorMessage } from "@/lib/disk-write-error";
import { getSessionFromCookies } from "@/lib/auth";
import type { Artwork } from "@/lib/types";
import { z } from "zod";
import { randomUUID } from "crypto";
import { routing } from "@/i18n/routing";

function normOptionalText(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t ? t : undefined;
}

function revalidateGallery(slug?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "layout");
    if (slug) {
      revalidatePath(`/${locale}/gallery/${slug}`, "page");
    }
  }
}

const detailImagesField = z
  .array(z.string().min(1).max(2048))
  .max(24)
  .optional();

const artworkInput = z.object({
  titleEn: z.string().min(1),
  titleTr: z.string().min(1),
  descriptionEn: z.string(),
  descriptionTr: z.string(),
  image: z.string().min(1),
  detailImages: detailImagesField,
  year: z.string().optional(),
  mediumEn: z.string().optional(),
  mediumTr: z.string().optional(),
  dimensions: z.string().optional(),
  priceEn: z.string().max(160).optional(),
  priceTr: z.string().max(160).optional(),
  exhibitionEn: z.string().max(240).optional(),
  exhibitionTr: z.string().max(240).optional(),
  seriesSlug: z.string().max(80).optional(),
  seriesTitleEn: z.string().max(120).optional(),
  seriesTitleTr: z.string().max(120).optional(),
  sold: z.boolean().optional(),
  published: z.boolean(),
  slug: z.string().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin") === "1";
  const session = await getSessionFromCookies();
  const list = await readArtworks();
  if (admin && session) {
    return NextResponse.json(list.sort((a, b) => a.order - b.order));
  }
  const published = list.filter((a) => a.published).sort((a, b) => a.order - b.order);
  return NextResponse.json(published);
}

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json();
  const parsed = artworkInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const list = await readArtworks();
  const titleBase = parsed.data.titleEn || parsed.data.titleTr;
  const slug = ensureUniqueSlug(
    parsed.data.slug?.trim() || titleBase,
    list
  );
  const maxOrder = list.reduce((m, a) => Math.max(m, a.order), -1);
  const row: Artwork = {
    id: randomUUID(),
    slug,
    titleEn: parsed.data.titleEn,
    titleTr: parsed.data.titleTr,
    descriptionEn: parsed.data.descriptionEn,
    descriptionTr: parsed.data.descriptionTr,
    image: parsed.data.image,
    detailImages:
      parsed.data.detailImages && parsed.data.detailImages.length > 0
        ? parsed.data.detailImages
        : undefined,
    year: parsed.data.year,
    mediumEn: parsed.data.mediumEn,
    mediumTr: parsed.data.mediumTr,
    dimensions: parsed.data.dimensions,
    priceEn: normOptionalText(parsed.data.priceEn),
    priceTr: normOptionalText(parsed.data.priceTr),
    exhibitionEn: normOptionalText(parsed.data.exhibitionEn),
    exhibitionTr: normOptionalText(parsed.data.exhibitionTr),
    seriesSlug: normOptionalText(parsed.data.seriesSlug),
    seriesTitleEn: normOptionalText(parsed.data.seriesTitleEn),
    seriesTitleTr: normOptionalText(parsed.data.seriesTitleTr),
    order: maxOrder + 1,
    sold: parsed.data.sold ?? false,
    published: parsed.data.published,
    createdAt: new Date().toISOString(),
  };
  list.push(row);
  try {
    await writeArtworks(list);
  } catch (e) {
    list.pop();
    return NextResponse.json(
      { error: diskWriteErrorMessage(e) },
      { status: 503 }
    );
  }
  revalidateGallery(row.slug);
  return NextResponse.json(row);
}
