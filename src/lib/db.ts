import { getSupabase } from "./supabase";
import type { ImageLink } from "./types";

const TABLE = "image_links";

export async function insertLink(link: ImageLink): Promise<void> {
  const { error } = await getSupabase().from(TABLE).insert(link);
  if (error) throw new Error(error.message);
}

export async function listLinks(): Promise<ImageLink[]> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ImageLink[];
}

export async function findLinkByTeaserSlug(
  slug: string
): Promise<ImageLink | null> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("*")
    .eq("teaser_slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ImageLink | null) ?? null;
}

export async function findLinkByOriginalSlug(
  slug: string
): Promise<ImageLink | null> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("*")
    .eq("original_slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ImageLink | null) ?? null;
}

export async function deleteLink(id: string): Promise<ImageLink | null> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ImageLink | null) ?? null;
}
