-- ============================================================
-- Migrasi: tambahkan mode 'live' pada constraint image_links
-- Jalankan di Dashboard Supabase -> SQL Editor -> New query
-- ============================================================

alter table public.image_links
  drop constraint if exists image_links_mode_check;

alter table public.image_links
  add constraint image_links_mode_check
  check (mode in ('blur', 'original', 'live'));
