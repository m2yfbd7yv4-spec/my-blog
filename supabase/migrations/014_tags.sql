-- ---------- 标签：轻量的多对多归类（与「分类」「合集」并列，三者都保留） ----------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 30),
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

-- 公开读
drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read" on public.tags
  for select using (true);

-- 管理员写
drop policy if exists "tags_admin_insert" on public.tags;
create policy "tags_admin_insert" on public.tags
  for insert with check (public.is_admin());

drop policy if exists "tags_admin_update" on public.tags;
create policy "tags_admin_update" on public.tags
  for update using (public.is_admin());

drop policy if exists "tags_admin_delete" on public.tags;
create policy "tags_admin_delete" on public.tags
  for delete using (public.is_admin());

-- ---------- 标签 ↔ 文章 关联（多对多） ----------
create table if not exists public.post_tags (
  tag_id uuid not null references public.tags(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tag_id, post_id)
);

alter table public.post_tags enable row level security;

-- 公开读
drop policy if exists "post_tags_public_read" on public.post_tags;
create policy "post_tags_public_read" on public.post_tags
  for select using (true);

-- 管理员写（关联行只有增删）
drop policy if exists "post_tags_admin_insert" on public.post_tags;
create policy "post_tags_admin_insert" on public.post_tags
  for insert with check (public.is_admin());

drop policy if exists "post_tags_admin_delete" on public.post_tags;
create policy "post_tags_admin_delete" on public.post_tags
  for delete using (public.is_admin());
