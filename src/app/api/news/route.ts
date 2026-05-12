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
import { randomUUID } from "crypto";
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

const newsInput = z.object({
  kind: kindEnum,
  titleEn: z.string().min(1),
  titleTr: z.string().min(1),
  excerptEn: z.string().max(400).optional(),
  excerptTr: z.string().max(400).optional(),
  bodyEn: z.string(),
  bodyTr: z.string(),
  image: z.string().max(2048).optional(),
  externalUrl: z
    .union([z.string().url().max(2048), z.literal("")])
    .optional(),
  published: z.boolean(),
  slug: z.string().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin") === "1";
  const session = await getSessionFromCookies();
  const list = await readNewsPosts();
  if (admin && session) {
    return NextResponse.json(list.sort((a, b) => a.order - b.order));
  }
  const published = list
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order);
  return NextResponse.json(published);
}

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json();
  const parsed = newsInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const list = await readNewsPosts();
  const titleBase = parsed.data.titleEn || parsed.data.titleTr;
  const slug = ensureUniqueNewsSlug(
    parsed.data.slug?.trim() || titleBase,
    list
  );
  const maxOrder = list.reduce((m, p) => Math.max(m, p.order), -1);
  const extRaw = parsed.data.externalUrl;
  const ext =
    extRaw === undefined || extRaw === ""
      ? undefined
      : extRaw.trim();
  const row: NewsPost = {
    id: randomUUID(),
    slug,
    kind: parsed.data.kind as NewsKind,
    titleEn: parsed.data.titleEn,
    titleTr: parsed.data.titleTr,
    excerptEn: normOptionalText(parsed.data.excerptEn),
    excerptTr: normOptionalText(parsed.data.excerptTr),
    bodyEn: parsed.data.bodyEn,
    bodyTr: parsed.data.bodyTr,
    image: normOptionalText(parsed.data.image),
    externalUrl: ext,
    order: maxOrder + 1,
    published: parsed.data.published,
    createdAt: new Date().toISOString(),
  };
  list.push(row);
  try {
    await writeNewsPosts(list);
  } catch (e) {
    list.pop();
    return NextResponse.json(
      { error: diskWriteErrorMessage(e) },
      { status: 503 }
    );
  }
  revalidateNews(row.slug);
  return NextResponse.json(row);
}
