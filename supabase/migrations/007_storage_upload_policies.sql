-- ============================================================
-- 存储上传权限：允许「已登录的站长」直接用登录态上传图片，
-- 不再依赖 service_role 密钥（避免密钥没配好导致上传失败）
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 可重复执行（幂等）
-- ============================================================

-- 文章封面图：仅管理员可上传到 posts 桶
drop policy if exists "posts_admin_upload" on storage.objects;
create policy "posts_admin_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'posts' and public.is_admin());

-- 灵感配图：仅管理员可上传到 inspirations 桶
drop policy if exists "inspirations_admin_upload" on storage.objects;
create policy "inspirations_admin_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'inspirations' and public.is_admin());
