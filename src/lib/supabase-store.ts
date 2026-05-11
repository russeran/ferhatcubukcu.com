import { createClient } from "@supabase/supabase-js";

const KV_TABLE = "portfolio_kv";

/** Project URL from Supabase → Settings → API (same as NEXT_PUBLIC_SUPABASE_URL). */
export function getSupabaseAdmin() {
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

export async function supabaseGetJson(key: string): Promise<unknown | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from(KV_TABLE)
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return null;
  return data.value;
}

export async function supabaseSetJson(key: string, value: unknown): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase is not configured");
  const { error } = await sb.from(KV_TABLE).upsert(
    {
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  if (error) throw new Error(error.message);
}

export async function uploadPortfolioImage(
  filename: string,
  buf: Buffer,
  contentType: string
): Promise<string> {
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Supabase is not configured");
  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET?.trim() || "portfolio-media";
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
