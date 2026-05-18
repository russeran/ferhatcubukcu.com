import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  readArtworks,
  writeArtworks,
  ensureUniqueSlug,
} from "@/lib/data";
import { diskWriteErrorMessage } from "@/lib/disk-write-error";
import { getSessionFromCookies } from "@/lib/auth";
import type { Artwork } from "@/lib/types";
import { z } from "zod";
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

const patchSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleTr: z.string().min(1).optional(),
  descriptionEn: z.string().optional(),
  descriptionTr: z.string().optional(),
  image: z.string().min(1).optional(),
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
  favorite: z.boolean().optional(),
  published: z.boolean().optional(),
  slug: z.string().optional(),
  order: z.number().int().optional(),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const list = await readArtworks();
  const row = list.find((a) => a.id === id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const list = await readArtworks();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const json = await req.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const current = list[idx];
  let slug = current.slug;
  if (parsed.data.slug !== undefined && parsed.data.slug.trim() !== "") {
    slug = ensureUniqueSlug(parsed.data.slug.trim(), list, id);
  } else if (
    parsed.data.titleEn !== undefined ||
    parsed.data.titleTr !== undefined
  ) {
    const base =
      parsed.data.titleEn ??
      parsed.data.titleTr ??
      current.titleEn;
    slug = ensureUniqueSlug(base, list, id);
  }
  const patch = { ...parsed.data };
  if (patch.detailImages === undefined) {
    delete patch.detailImages;
  }
  if (patch.sold === undefined) {
    delete patch.sold;
  }
  if (patch.favorite === undefined) {
    delete patch.favorite;
  }
  const updated: Artwork = {
    ...current,
    ...patch,
    slug,
  };
  if (parsed.data.priceEn !== undefined) {
    updated.priceEn = normOptionalText(parsed.data.priceEn);
  }
  if (parsed.data.priceTr !== undefined) {
    updated.priceTr = normOptionalText(parsed.data.priceTr);
  }
  if (parsed.data.exhibitionEn !== undefined) {
    updated.exhibitionEn = normOptionalText(parsed.data.exhibitionEn);
  }
  if (parsed.data.exhibitionTr !== undefined) {
    updated.exhibitionTr = normOptionalText(parsed.data.exhibitionTr);
  }
  if (parsed.data.seriesSlug !== undefined) {
    updated.seriesSlug = normOptionalText(parsed.data.seriesSlug);
  }
  if (parsed.data.seriesTitleEn !== undefined) {
    updated.seriesTitleEn = normOptionalText(parsed.data.seriesTitleEn);
  }
  if (parsed.data.seriesTitleTr !== undefined) {
    updated.seriesTitleTr = normOptionalText(parsed.data.seriesTitleTr);
  }
  const prevSlug = current.slug;
  list[idx] = updated;
  try {
    await writeArtworks(list);
  } catch (e) {
    list[idx] = current;
    return NextResponse.json(
      { error: diskWriteErrorMessage(e) },
      { status: 503 }
    );
  }
  revalidateGallery(prevSlug);
  if (updated.slug !== prevSlug) revalidateGallery(updated.slug);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const list = await readArtworks();
  const removed = list.find((a) => a.id === id);
  const next = list.filter((a) => a.id !== id);
  if (next.length === list.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await writeArtworks(next);
  } catch (e) {
    return NextResponse.json(
      { error: diskWriteErrorMessage(e) },
      { status: 503 }
    );
  }
  if (removed) revalidateGallery(removed.slug);
  return NextResponse.json({ ok: true });
}
