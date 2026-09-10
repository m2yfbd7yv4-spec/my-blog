-- ============================================================
-- 行路手记（Work-Study Journal）：工作/学习经历 + 干货分享
-- 用法：Supabase Dashboard → SQL Editor → 粘贴全部 → Run（可重复执行，幂等）
-- ============================================================

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  category text not null check (category in ('experience', 'knowledge')),
  summary text not null check (char_length(summary) between 1 and 500),
  content text not null,
  link text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

-- 公开读
drop policy if exists "journal_entries_public_read" on public.journal_entries;
create policy "journal_entries_public_read" on public.journal_entries
  for select using (true);

-- 管理员写
drop policy if exists "journal_entries_admin_insert" on public.journal_entries;
create policy "journal_entries_admin_insert" on public.journal_entries
  for insert with check (public.is_admin());

drop policy if exists "journal_entries_admin_update" on public.journal_entries;
create policy "journal_entries_admin_update" on public.journal_entries
  for update using (public.is_admin());

drop policy if exists "journal_entries_admin_delete" on public.journal_entries;
create policy "journal_entries_admin_delete" on public.journal_entries
  for delete using (public.is_admin());

-- 更新时间戳（复用 001 里的 public.set_updated_at()）
drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();
