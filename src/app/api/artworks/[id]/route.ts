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

function revalidateGallery(slug?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "layout");
    if (slug) {
      revalidatePath(`/${locale}/gallery/${slug}`, "page");
    }
  }
}

const patchSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleTr: z.string().min(1).optional(),
  descriptionEn: z.string().optional(),
  descriptionTr: z.string().optional(),
  image: z.string().min(1).optional(),
  year: z.string().optional(),
  mediumEn: z.string().optional(),
  mediumTr: z.string().optional(),
  dimensions: z.string().optional(),
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
  const updated: Artwork = {
    ...current,
    ...parsed.data,
    slug,
  };
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
