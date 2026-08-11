import { getSupabase, parseStoragePath, publicStorageUrl } from "./supabase";

export type Bucket = "blur" | "originals";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function saveImage(
  bucket: Bucket,
  filename: string,
  data: Buffer
): Promise<string> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "png";
  const contentType = CONTENT_TYPES[ext] ?? "image/png";
  const { error } = await getSupabase()
    .storage.from(bucket)
    .upload(filename, data, { contentType, upsert: true });
  if (error) throw new Error(error.message);
  return publicStorageUrl(bucket, filename);
}

export async function deleteImageByPublicPath(
  publicUrl: string | null
): Promise<void> {
  if (!publicUrl) return;
  const parsed = parseStoragePath(publicUrl);
  if (!parsed) return;
  await getSupabase().storage.from(parsed.bucket).remove([parsed.path]);
}
