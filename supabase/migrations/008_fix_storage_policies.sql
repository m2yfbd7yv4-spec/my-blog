-- ============================================================
-- 修复封面图/灵感图上传：确保存储桶 + 上传策略存在（幂等，可重复执行）
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 背景：006/007 的存储桶与上传策略此前未在线上库执行，
--       导致「已登录的站长」上传封面图被 storage RLS 拒绝。
-- ============================================================

-- 1. 文章封面图存储桶（public：拿到 URL 即可直接访问）
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do update set public = true;

-- 2. 灵感配图存储桶（保险，重复执行无害）
insert into storage.buckets (id, name, public)
values ('inspirations', 'inspirations', true)
on conflict (id) do update set public = true;

-- 3. 封面图上传策略：仅管理员可用登录态上传到 posts 桶
drop policy if exists "posts_admin_upload" on storage.objects;
create policy "posts_admin_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'posts' and public.is_admin());

-- 4. 灵感配图上传策略：仅管理员可上传到 inspirations 桶
drop policy if exists "inspirations_admin_upload" on storage.objects;
create policy "inspirations_admin_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'inspirations' and public.is_admin());
