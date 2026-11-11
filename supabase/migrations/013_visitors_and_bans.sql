-- ---------- 访客记录 + 屏蔽/拉黑 ----------

-- 访客访问日志（每条 = 一次页面浏览）
create table if not exists public.visitor_logs (
  id bigint generated always as identity primary key,
  ip text not null,
  user_agent text,
  path text,
  referrer text,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists visitor_logs_created_at_idx
  on public.visitor_logs (created_at desc);

alter table public.visitor_logs enable row level security;

-- 只有管理员能读（访客日志不外泄）
drop policy if exists "visitor_logs_admin_read" on public.visitor_logs;
create policy "visitor_logs_admin_read" on public.visitor_logs
  for select using (public.is_admin());

-- 允许匿名写入（middleware 用 anon key 记录访问）
drop policy if exists "visitor_logs_public_insert" on public.visitor_logs;
create policy "visitor_logs_public_insert" on public.visitor_logs
  for insert with check (true);

-- 屏蔽的 IP（整站拦截）
create table if not exists public.banned_ips (
  id uuid primary key default gen_random_uuid(),
  ip text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.banned_ips enable row level security;

-- 公开读：middleware 需要读到名单才能拦截
drop policy if exists "banned_ips_public_read" on public.banned_ips;
create policy "banned_ips_public_read" on public.banned_ips
  for select using (true);

drop policy if exists "banned_ips_admin_insert" on public.banned_ips;
create policy "banned_ips_admin_insert" on public.banned_ips
  for insert with check (public.is_admin());

drop policy if exists "banned_ips_admin_delete" on public.banned_ips;
create policy "banned_ips_admin_delete" on public.banned_ips
  for delete using (public.is_admin());

-- 拉黑的用户（禁止评论/留言）
create table if not exists public.banned_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.banned_users enable row level security;

-- 公开读：server action 需要判断当前用户是否被拉黑
drop policy if exists "banned_users_public_read" on public.banned_users;
create policy "banned_users_public_read" on public.banned_users
  for select using (true);

drop policy if exists "banned_users_admin_insert" on public.banned_users;
create policy "banned_users_admin_insert" on public.banned_users
  for insert with check (public.is_admin());

drop policy if exists "banned_users_admin_delete" on public.banned_users;
create policy "banned_users_admin_delete" on public.banned_users
  for delete using (public.is_admin());
