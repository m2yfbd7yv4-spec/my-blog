-- ============================================================
-- 行路手记新增子分类：经历 → 工作/学习，干货 → 方法论/资源
-- 用法：Supabase Dashboard → SQL Editor → 粘贴全部 → Run（幂等）
-- 说明：如果你已经跑过 010 建了表（无 subcategory 列），跑这个补列即可；
--       如果还没跑 010，直接跑更新后的 010 就行，本文件可跳过。
-- ============================================================

alter table public.journal_entries
  add column if not exists subcategory text;

-- 已有行（若有）默认归入「工作」
update public.journal_entries
  set subcategory = 'work'
  where subcategory is null;

alter table public.journal_entries
  alter column subcategory set not null;

alter table public.journal_entries
  drop constraint if exists journal_entries_subcategory_check;
alter table public.journal_entries
  add constraint journal_entries_subcategory_check
  check (subcategory in ('work', 'study', 'methodology', 'resource'));
