-- ============================================================
-- BlurLink Generator — Schema Supabase
-- Jalankan file ini di Dashboard Supabase -> SQL Editor -> New query
-- ============================================================

-- Tabel utama
create table if not exists public.image_links (
  id uuid primary key,
  mode text not null check (mode in ('blur', 'original')),
  teaser_slug text unique,
  original_slug text unique,
  teaser_storage_path text,
  original_storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists image_links_teaser_slug_idx
  on public.image_links (teaser_slug);
create index if not exists image_links_original_slug_idx
  on public.image_links (original_slug);

-- Row Level Security
alter table public.image_links enable row level security;

drop policy if exists "public_select" on public.image_links;
create policy "public_select" on public.image_links
  for select using (true);

drop policy if exists "public_insert" on public.image_links;
create policy "public_insert" on public.image_links
  for insert with check (true);

drop policy if exists "public_update" on public.image_links;
create policy "public_update" on public.image_links
  for update using (true);

drop policy if exists "public_delete" on public.image_links;
create policy "public_delete" on public.image_links
  for delete using (true);

-- Bucket storage (publik)
insert into storage.buckets (id, name, public)
values ('originals', 'originals', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('blur', 'blur', true)
on conflict (id) do nothing;
