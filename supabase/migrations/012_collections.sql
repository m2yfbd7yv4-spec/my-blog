-- ---------- 合集：用户自建的文章合集，作为与「分类」并列的第二套归类 ----------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.collections enable row level security;

-- 公开读
drop policy if exists "collections_public_read" on public.collections;
create policy "collections_public_read" on public.collections
  for select using (true);

-- 管理员写
drop policy if exists "collections_admin_insert" on public.collections;
create policy "collections_admin_insert" on public.collections
  for insert with check (public.is_admin());

drop policy if exists "collections_admin_update" on public.collections;
create policy "collections_admin_update" on public.collections
  for update using (public.is_admin());

drop policy if exists "collections_admin_delete" on public.collections;
create policy "collections_admin_delete" on public.collections
  for delete using (public.is_admin());

-- 更新时间戳（复用 001 里的 set_updated_at 函数）
drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

-- ---------- 合集 ↔ 文章 关联（多对多） ----------
create table if not exists public.collection_posts (
  collection_id uuid not null references public.collections(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, post_id)
);

alter table public.collection_posts enable row level security;

-- 公开读
drop policy if exists "collection_posts_public_read" on public.collection_posts;
create policy "collection_posts_public_read" on public.collection_posts
  for select using (true);

-- 管理员写（关联行只有增删，无更新）
drop policy if exists "collection_posts_admin_insert" on public.collection_posts;
create policy "collection_posts_admin_insert" on public.collection_posts
  for insert with check (public.is_admin());

drop policy if exists "collection_posts_admin_delete" on public.collection_posts;
create policy "collection_posts_admin_delete" on public.collection_posts
  for delete using (public.is_admin());
