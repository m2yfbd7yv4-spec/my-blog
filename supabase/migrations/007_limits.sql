-- ============================================================
-- 调整评论/留言字数上限：评论 2000 → 500，留言 200 → 50
-- 用法：登录 Supabase 后台 → SQL Editor → 粘贴本文件全部内容 → Run
-- 可重复执行（幂等）
-- ============================================================

-- 评论：字数上限 500
alter table public.comments drop constraint if exists comments_content_check;
alter table public.comments add constraint comments_content_check
  check (char_length(content) between 1 and 500);

-- 留言：字数上限 50
alter table public.guestbook_messages drop constraint if exists guestbook_messages_content_check;
alter table public.guestbook_messages add constraint guestbook_messages_content_check
  check (char_length(content) between 1 and 50);
