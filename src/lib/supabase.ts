import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Env SUPABASE belum diatur. Salin .env.local.example ke .env.local lalu isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return cached;
}

export function publicStorageUrl(bucket: string, path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL belum diatur.");
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

export function parseStoragePath(publicUrl: string): {
  bucket: string;
  path: string;
} | null {
  try {
    const u = new URL(publicUrl);
    const match = u.pathname.match(
      /^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/
    );
    if (!match) return null;
    return { bucket: match[1], path: decodeURIComponent(match[2]) };
  } catch {
    return null;
  }
}
