import type { JournalCategory, JournalSubcategory } from "@/lib/types";

// 行路手记一级分类：经历（工作/学习经历）+ 干货（干货分享）
export const JOURNAL_CATEGORIES: { value: JournalCategory; label: string }[] = [
  { value: "experience", label: "经历" },
  { value: "knowledge", label: "干货" },
];

// 行路手记二级分类：经历 → 工作/学习，干货 → 方法论/资源
export const JOURNAL_SUBCATEGORIES: Record<
  JournalCategory,
  { value: JournalSubcategory; label: string }[]
> = {
  experience: [
    { value: "work", label: "工作" },
    { value: "study", label: "学习" },
  ],
  knowledge: [
    { value: "methodology", label: "方法论" },
    { value: "resource", label: "资源" },
  ],
};

// 一级分类值 → 中文标签（后台下拉 / 前台筛选共用）
export function journalCategoryLabel(value: string): string {
  return JOURNAL_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

// 二级分类值 → 中文标签（徽标共用）
export function journalSubcategoryLabel(value: string): string {
  for (const sub of Object.values(JOURNAL_SUBCATEGORIES)) {
    const found = sub.find((s) => s.value === value);
    if (found) return found.label;
  }
  return value;
}

// 校验某子分类是否属于给定一级分类（后台保存用）
export function isSubcategoryOf(
  subcategory: string,
  category: JournalCategory,
): boolean {
  return (JOURNAL_SUBCATEGORIES[category] ?? []).some(
    (s) => s.value === subcategory,
  );
}
