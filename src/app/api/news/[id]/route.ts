import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  readNewsPosts,
  writeNewsPosts,
  ensureUniqueNewsSlug,
} from "@/lib/data";
import { diskWriteErrorMessage } from "@/lib/disk-write-error";
import { getSessionFromCookies } from "@/lib/auth";
import type { NewsKind, NewsPost } from "@/lib/types";
import { z } from "zod";
import { routing } from "@/i18n/routing";

function normOptionalText(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t ? t : undefined;
}

function revalidateNews(slug?: string) {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "layout");
    revalidatePath(`/${locale}/news`, "page");
    if (slug) {
      revalidatePath(`/${locale}/news/${slug}`, "page");
    }
  }
}

const kindEnum = z.enum(["news", "social", "press", "studio"]);

const patchSchema = z.object({
  kind: kindEnum.optional(),
  titleEn: z.string().min(1).optional(),
  titleTr: z.string().min(1).optional(),
  excerptEn: z.string().max(400).optional(),
  excerptTr: z.string().max(400).optional(),
  bodyEn: z.string().optional(),
  bodyTr: z.string().optional(),
  image: z.string().max(2048).optional(),
  externalUrl: z
    .union([z.string().url().max(2048), z.literal("")])
    .optional(),
  published: z.boolean().optional(),
  slug: z.string().optional(),
  order: z.number().int().optional(),
});

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const list = await readNewsPosts();
  const row = list.find((p) => p.id === id);
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
  const list = await readNewsPosts();
  const idx = list.findIndex((p) => p.id === id);
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
    slug = ensureUniqueNewsSlug(parsed.data.slug.trim(), list, id);
  } else if (
    parsed.data.titleEn !== undefined ||
    parsed.data.titleTr !== undefined
  ) {
    const base =
      parsed.data.titleEn ??
      parsed.data.titleTr ??
      current.titleEn;
    slug = ensureUniqueNewsSlug(base, list, id);
  }
  const patch = { ...parsed.data };
  delete patch.externalUrl;
  const updated: NewsPost = {
    ...current,
    ...patch,
    slug,
  };
  if (parsed.data.kind !== undefined) {
    updated.kind = parsed.data.kind as NewsKind;
  }
  if (parsed.data.excerptEn !== undefined) {
    updated.excerptEn = normOptionalText(parsed.data.excerptEn);
  }
  if (parsed.data.excerptTr !== undefined) {
    updated.excerptTr = normOptionalText(parsed.data.excerptTr);
  }
  if (parsed.data.image !== undefined) {
    updated.image = normOptionalText(parsed.data.image);
  }
  if (parsed.data.externalUrl !== undefined) {
    updated.externalUrl =
      parsed.data.externalUrl === ""
        ? undefined
        : parsed.data.externalUrl.trim();
  }
  const prevSlug = current.slug;
  list[idx] = updated;
  try {
    await writeNewsPosts(list);
  } catch (e) {
    list[idx] = current;
    return NextResponse.json(
      { error: diskWriteErrorMessage(e) },
      { status: 503 }
    );
  }
  revalidateNews(prevSlug);
  if (updated.slug !== prevSlug) revalidateNews(updated.slug);
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
  const list = await readNewsPosts();
  const removed = list.find((p) => p.id === id);
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await writeNewsPosts(next);
  } catch (e) {
    return NextResponse.json(
      { error: diskWriteErrorMessage(e) },
      { status: 503 }
    );
  }
  if (removed) revalidateNews(removed.slug);
  return NextResponse.json({ ok: true });
}
