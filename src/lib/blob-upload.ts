import { put } from "@vercel/blob";

/** Vercel injects `BLOB_READ_WRITE_TOKEN` when Blob is linked to the project. */
export function hasBlobUpload(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export async function uploadImageBlob(
  filename: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const blob = await put(`gallery/${filename}`, body, {
    access: "public",
    contentType,
  });
  return blob.url;
}
