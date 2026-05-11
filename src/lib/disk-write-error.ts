/** User-facing hint when JSON/data files cannot be written (e.g. Vercel serverless). */
export function diskWriteErrorMessage(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  if (/EROFS|EPERM|EACCES|read-only|ENOTSUP/i.test(m)) {
    return "Could not write local files — filesystem is read-only (typical on Vercel). Add Upstash Redis (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) for paintings/settings, and Vercel Blob (BLOB_READ_WRITE_TOKEN) for image uploads. See README.";
  }
  return m;
}
