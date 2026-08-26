-- ============================================================
-- 个人博客数据库结构 + 行级安全(RLS)策略
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 可重复执行（已做幂等处理，不会删数据）
-- ============================================================

-- ---------- 辅助函数：判断当前登录用户是否为管理员 ----------
-- 用 security definer 避免 RLS 递归问题
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- profiles：用户资料 ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 注册后自动创建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- posts：文章 ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  slug text not null unique,
  excerpt text,
  cover_image text,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- 公开读：只有已发布的文章对外可见
drop policy if exists "posts_public_read_published" on public.posts;
create policy "posts_public_read_published" on public.posts
  for select using (status = 'published');

-- 管理员可读全部（含草稿）
drop policy if exists "posts_admin_read_all" on public.posts;
create policy "posts_admin_read_all" on public.posts
  for select using (public.is_admin());

-- 管理员可写（作者必须是本人）
drop policy if exists "posts_admin_insert" on public.posts;
create policy "posts_admin_insert" on public.posts
  for insert with check (public.is_admin() and author_id = auth.uid());

drop policy if exists "posts_admin_update" on public.posts;
create policy "posts_admin_update" on public.posts
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "posts_admin_delete" on public.posts;
create policy "posts_admin_delete" on public.posts
  for delete using (public.is_admin());

-- 更新时间戳
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------- comments：评论 ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

-- 公开读：只有审核通过的评论对外可见
drop policy if exists "comments_public_read_approved" on public.comments;
create policy "comments_public_read_approved" on public.comments
  for select using (status = 'approved');

-- 用户可读自己的评论（能看到“审核中”状态）
drop policy if exists "comments_read_own" on public.comments;
create policy "comments_read_own" on public.comments
  for select using (auth.uid() = author_id);

-- 管理员可读全部评论
drop policy if exists "comments_admin_read_all" on public.comments;
create policy "comments_admin_read_all" on public.comments
  for select using (public.is_admin());

-- 登录用户可发评论，但只能是 pending（无法自己“通过”）
drop policy if exists "comments_insert_own_pending" on public.comments;
create policy "comments_insert_own_pending" on public.comments
  for insert with check (auth.uid() = author_id and status = 'pending');

drop policy if exists "comments_admin_update" on public.comments;
create policy "comments_admin_update" on public.comments
  for update using (public.is_admin());

drop policy if exists "comments_admin_delete" on public.comments;
create policy "comments_admin_delete" on public.comments
  for delete using (public.is_admin());

-- 用户可删除自己的评论
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = author_id);

-- ============================================================
-- ⚠️ 重要：把自己设为管理员
-- 注册你自己的账号后，在 Profiles 表里找到你的记录，或执行下面这行
-- （把 <你的用户ID> 换成实际的 uuid，可在 Auth → Users 里查到）：
--
-- update public.profiles set role = 'admin' where id = '<你的用户ID>';
-- ============================================================
