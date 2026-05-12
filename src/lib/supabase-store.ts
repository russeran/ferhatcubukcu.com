import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Private bucket for JSON (settings + artworks). Auto-created on first use. */
const DEFAULT_KV_BUCKET = "portfolio-site-kv";

/** Public bucket for gallery images (when not using Vercel Blob). Auto-created on first use. */
const DEFAULT_MEDIA_BUCKET = "portfolio-media";

function kvBucketName(): string {
  return process.env.SUPABASE_KV_BUCKET?.trim() || DEFAULT_KV_BUCKET;
}

function mediaBucketName(): string {
  return (
    process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_MEDIA_BUCKET
  );
}

/** Project URL from Supabase → Settings → API (same as NEXT_PUBLIC_SUPABASE_URL). */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  );
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isAlreadyExistsError(err: { message?: string } | null): boolean {
  if (!err?.message) return false;
  const m = err.message.toLowerCase();
  return (
    m.includes("already exists") ||
    m.includes("resource already exists") ||
    m.includes("duplicate")
  );
}

let kvBucketEnsured = false;
let mediaBucketEnsured = false;

async function ensureKvBucket(sb: SupabaseClient): Promise<void> {
  if (kvBucketEnsured) return;
  const name = kvBucketName();
  const { error } = await sb.storage.createBucket(name, {
    public: false,
    fileSizeLimit: 6 * 1024 * 1024,
  });
  if (!error || isAlreadyExistsError(error)) {
    kvBucketEnsured = true;
    return;
  }
  const { data: list } = await sb.storage.listBuckets();
  if (list?.some((b) => b.name === name)) {
    kvBucketEnsured = true;
    return;
  }
  throw new Error(error.message);
}

async function ensureMediaBucket(sb: SupabaseClient): Promise<void> {
  if (mediaBucketEnsured) return;
  const name = mediaBucketName();
  const { error } = await sb.storage.createBucket(name, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
  });
  if (!error || isAlreadyExistsError(error)) {
    mediaBucketEnsured = true;
    return;
  }
  const { data: list } = await sb.storage.listBuckets();
  if (list?.some((b) => b.name === name)) {
    mediaBucketEnsured = true;
    return;
  }
  throw new Error(error.message);
}

/** Keys: `settings` | `artworks` — stored as `kv/{key}.json` in the private KV bucket. */
export async function supabaseGetJson(key: string): Promise<unknown | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  await ensureKvBucket(sb);
  const bucket = kvBucketName();
  const path = `kv/${key}.json`;
  const { data, error } = await sb.storage.from(bucket).download(path);
  if (error || !data) return null;
  try {
    const text = await data.text();
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function supabaseSetJson(key: string, value: unknown): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase is not configured");
  await ensureKvBucket(sb);
  const bucket = kvBucketName();
  const path = `kv/${key}.json`;
  const body = JSON.stringify(value);
  const buf = Buffer.from(body, "utf-8");
  const { error } = await sb.storage.from(bucket).upload(path, buf, {
    contentType: "application/json",
    upsert: true,
  });
  if (error) throw new Error(error.message);
}

export async function uploadPortfolioImage(
  filename: string,
  buf: Buffer,
  contentType: string
): Promise<string> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase is not configured");
  await ensureMediaBucket(sb);
  const bucket = mediaBucketName();
  const path = `gallery/${filename}`;
  const { error } = await sb.storage.from(bucket).upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function hasSupabaseUpload(): boolean {
  return getSupabaseAdmin() !== null;
}
