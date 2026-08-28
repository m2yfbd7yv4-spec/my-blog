-- ============================================================
-- 留言板（弹幕评论）表 + 行级安全(RLS)
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 结构与 comments 表一致，只是不绑定具体文章（没有 post_id）
-- 依赖 001 里已有的 public.is_admin() 函数
-- ============================================================

create table if not exists public.guestbook_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 200),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.guestbook_messages enable row level security;

-- 公开读：只有审核通过的留言可见
drop policy if exists "guestbook_public_read_approved" on public.guestbook_messages;
create policy "guestbook_public_read_approved" on public.guestbook_messages
  for select using (status = 'approved');

-- 用户可读自己的留言（能看到“审核中”状态）
drop policy if exists "guestbook_read_own" on public.guestbook_messages;
create policy "guestbook_read_own" on public.guestbook_messages
  for select using (auth.uid() = author_id);

-- 管理员可读全部
drop policy if exists "guestbook_admin_read_all" on public.guestbook_messages;
create policy "guestbook_admin_read_all" on public.guestbook_messages
  for select using (public.is_admin());

-- 登录用户可发留言，只能是 pending（无法自己“通过”）
drop policy if exists "guestbook_insert_own_pending" on public.guestbook_messages;
create policy "guestbook_insert_own_pending" on public.guestbook_messages
  for insert with check (auth.uid() = author_id and status = 'pending');

-- 管理员可审核（改状态）
drop policy if exists "guestbook_admin_update" on public.guestbook_messages;
create policy "guestbook_admin_update" on public.guestbook_messages
  for update using (public.is_admin());

-- 管理员可删
drop policy if exists "guestbook_admin_delete" on public.guestbook_messages;
create policy "guestbook_admin_delete" on public.guestbook_messages
  for delete using (public.is_admin());

-- 用户可删自己的留言
drop policy if exists "guestbook_delete_own" on public.guestbook_messages;
create policy "guestbook_delete_own" on public.guestbook_messages
  for delete using (auth.uid() = author_id);
