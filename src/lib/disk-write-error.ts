/** User-facing hint when JSON/data files cannot be written (e.g. Vercel serverless). */
export function diskWriteErrorMessage(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  if (/EROFS|EPERM|EACCES|read-only|ENOTSUP/i.test(m)) {
    return "Could not write data files — this host’s filesystem is read-only (typical on Vercel). Use persistent storage or a database to keep admin changes.";
  }
  return m;
}
