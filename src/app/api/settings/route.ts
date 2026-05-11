import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/data";
import { diskWriteErrorMessage } from "@/lib/disk-write-error";
import { getSessionFromCookies } from "@/lib/auth";
import { z } from "zod";
import { routing } from "@/i18n/routing";

function revalidateSite() {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/about`);
    revalidatePath(`/${locale}/contact`);
  }
}

const settingsSchema = z.object({
  artistName: z.string().min(1).optional(),
  taglineEn: z.string().optional(),
  taglineTr: z.string().optional(),
  bioEn: z.string().optional(),
  bioTr: z.string().optional(),
  heroImage: z.string().optional(),
  contactEmail: z.union([z.string().email(), z.literal("")]).optional(),
  instagram: z.string().optional(),
  behance: z.string().optional(),
  studioNoteEn: z.string().optional(),
  studioNoteTr: z.string().optional(),
});

export async function GET() {
  const s = await readSettings();
  return NextResponse.json(s);
}

export async function PATCH(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await req.json();
  const parsed = settingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const cleaned = {
    ...parsed.data,
    ...(parsed.data.contactEmail !== undefined
      ? { contactEmail: parsed.data.contactEmail || "" }
      : {}),
  };
  let next;
  try {
    next = await writeSettings(cleaned);
  } catch (e) {
    return NextResponse.json(
      { error: diskWriteErrorMessage(e) },
      { status: 503 }
    );
  }
  revalidateSite();
  return NextResponse.json(next);
}
