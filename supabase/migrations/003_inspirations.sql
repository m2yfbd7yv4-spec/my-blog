-- ============================================================
-- 灵感源泉记录表 + 行级安全(RLS)
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 形态：仅站长（admin）可记录，访客只读
-- 依赖 001 里已有的 public.is_admin() 函数
-- ============================================================

create table if not exists public.inspirations (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.inspirations enable row level security;

-- 公开读：所有记录对访客可见
drop policy if exists "inspirations_public_read" on public.inspirations;
create policy "inspirations_public_read" on public.inspirations
  for select using (true);

-- 仅管理员可记录
drop policy if exists "inspirations_admin_insert" on public.inspirations;
create policy "inspirations_admin_insert" on public.inspirations
  for insert with check (public.is_admin() and author_id = auth.uid());

drop policy if exists "inspirations_admin_update" on public.inspirations;
create policy "inspirations_admin_update" on public.inspirations
  for update using (public.is_admin());

drop policy if exists "inspirations_admin_delete" on public.inspirations;
create policy "inspirations_admin_delete" on public.inspirations
  for delete using (public.is_admin());
