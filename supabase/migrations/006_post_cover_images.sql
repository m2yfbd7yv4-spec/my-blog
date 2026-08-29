-- ============================================================
-- 文章封面图：图片存储桶（可选封面图上传用）
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 可重复执行（幂等）
-- ============================================================

-- 创建公开的文章封面图存储桶（上传后拿到 URL 即可直接访问）
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do update set public = true;
