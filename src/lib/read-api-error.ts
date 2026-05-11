/** Parse error message from a failed API response (JSON or plain text). */
export async function readApiError(res: Response): Promise<string> {
  const raw = await res.text();
  if (!raw) return `Request failed (${res.status})`;
  try {
    const j = JSON.parse(raw) as { error?: unknown };
    if (typeof j.error === "string") return j.error;
    if (j.error !== undefined) return JSON.stringify(j.error);
  } catch {
    return raw.slice(0, 280);
  }
  return raw.slice(0, 280);
}
