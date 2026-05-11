/** User-facing hint when JSON/data files cannot be written (e.g. Vercel serverless). */
export function diskWriteErrorMessage(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  if (/EROFS|EPERM|EACCES|read-only|ENOTSUP/i.test(m)) {
    return "Could not write local files — filesystem is read-only (typical on Vercel). Free options: Supabase (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SQL table portfolio_kv; see README), Upstash Redis free tier, or Vercel Blob for uploads only.";
  }
  return m;
}
