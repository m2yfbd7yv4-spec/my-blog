import type { JournalCategory } from "@/lib/types";

// 行路手记分类：经历（工作/学习经历）+ 干货（干货分享）
export const JOURNAL_CATEGORIES: { value: JournalCategory; label: string }[] = [
  { value: "experience", label: "经历" },
  { value: "knowledge", label: "干货" },
];

// 分类值 → 中文标签（后台下拉 / 前台筛选 / 徽标共用）
export function journalCategoryLabel(value: string): string {
  return JOURNAL_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
