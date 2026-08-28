-- ============================================================
-- 灵感源泉：给记录加配图字段 + 图片存储桶
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 可重复执行（幂等）
-- ============================================================

-- 1. 给 inspirations 加 image_url 列（存图片的公开 URL，可为空）
alter table public.inspirations add column if not exists image_url text;

-- 2. 创建公开的图片存储桶（上传灵感配图用）
--    public = true 意味着拿到 URL 就能直接访问，访客也能看到图
insert into storage.buckets (id, name, public)
values ('inspirations', 'inspirations', true)
on conflict (id) do update set public = true;
