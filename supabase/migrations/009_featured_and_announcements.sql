-- ============================================================
-- 首页「推荐文章」勾选位 + 「公告」表
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 可重复执行（幂等，不会删数据）
-- ============================================================

-- 1) posts 增加 featured（推荐）位：后台勾选后进首页「推荐文章」
alter table public.posts
  add column if not exists featured boolean not null default false;

-- 2) announcements：公告表（所有人可读，仅管理员可写）
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- 公开读
drop policy if exists "announcements_public_read" on public.announcements;
create policy "announcements_public_read" on public.announcements
  for select using (true);

-- 管理员写
drop policy if exists "announcements_admin_insert" on public.announcements;
create policy "announcements_admin_insert" on public.announcements
  for insert with check (public.is_admin());

drop policy if exists "announcements_admin_update" on public.announcements;
create policy "announcements_admin_update" on public.announcements
  for update using (public.is_admin());

drop policy if exists "announcements_admin_delete" on public.announcements;
create policy "announcements_admin_delete" on public.announcements
  for delete using (public.is_admin());

-- 更新时间戳（复用 001 里的 set_updated_at 函数）
drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();
