import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { diskWriteErrorMessage } from "@/lib/disk-write-error";
import { getSessionFromCookies } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }
  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "gif";
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buf);
  } catch (e) {
    return NextResponse.json(
      { error: diskWriteErrorMessage(e) },
      { status: 503 }
    );
  }
  return NextResponse.json({ url: `/uploads/${name}` });
}
