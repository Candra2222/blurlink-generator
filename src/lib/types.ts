export type Mode = "blur" | "original";

export interface ImageLink {
  id: string;
  mode: Mode;
  teaser_slug: string | null;
  original_slug: string | null;
  teaser_storage_path: string | null;
  original_storage_path: string | null;
  created_at: string;
}
