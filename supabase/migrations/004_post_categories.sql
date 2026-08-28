-- ============================================================
-- 给 posts 增加「分类」字段（归档页按分类筛选用）
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 幂等：可重复执行
-- ============================================================

alter table public.posts
  add column if not exists category text not null default 'general';
