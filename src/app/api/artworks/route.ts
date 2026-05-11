import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readArtworks, writeArtworks, ensureUniqueSlug } from "@/lib/data";
import { diskWriteErrorMessage } from "@/lib/disk-write-error";
import { getSessionFromCookies } from "@/lib/auth";
import type { Artwork } from "@/lib/types";
import { z } from "zod";
import { randomUUID } from "crypto";
import { routing } from "@/i18n/routing";

function revalidateGallery(slug?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/gallery`);
    if (slug) revalidatePath(`/${locale}/gallery/${slug}`);
  }
}

const artworkInput = z.object({
  titleEn: z.string().min(1),
  titleTr: z.string().min(1),
  descriptionEn: z.string(),
  descriptionTr: z.string(),
  image: z.string().min(1),
  year: z.string().optional(),
  mediumEn: z.string().optional(),
  mediumTr: z.string().optional(),
  dimensions: z.string().optional(),
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
    year: parsed.data.year,
    mediumEn: parsed.data.mediumEn,
    mediumTr: parsed.data.mediumTr,
    dimensions: parsed.data.dimensions,
    order: maxOrder + 1,
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
