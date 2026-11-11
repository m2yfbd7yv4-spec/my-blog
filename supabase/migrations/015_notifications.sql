-- ---------- 站内通知（站长：新评论 / 新留言 / 新注册） ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('comment', 'guestbook', 'registration')),
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- 管理员读
drop policy if exists "notifications_admin_read" on public.notifications;
create policy "notifications_admin_read" on public.notifications
  for select using (public.is_admin());

-- 管理员标记已读 / 删除
drop policy if exists "notifications_admin_update" on public.notifications;
create policy "notifications_admin_update" on public.notifications
  for update using (public.is_admin());

drop policy if exists "notifications_admin_delete" on public.notifications;
create policy "notifications_admin_delete" on public.notifications
  for delete using (public.is_admin());

-- 公开插入：评论/留言/注册的 server action 用当前会话写入通知
drop policy if exists "notifications_public_insert" on public.notifications;
create policy "notifications_public_insert" on public.notifications
  for insert with check (true);
