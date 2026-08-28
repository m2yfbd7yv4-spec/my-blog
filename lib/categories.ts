export type Category = { slug: string; label: string };

// 归档页分类（截图里的 5 个分类）。
// 想改名 / 增删分类，直接改这里即可——后台下拉、归档侧边栏、筛选都会同步。
export const CATEGORIES: Category[] = [
  { slug: "general", label: "general" },
  { slug: "essays", label: "Essays" },
  { slug: "journal", label: "journal" },
  { slug: "notes", label: "notes" },
  { slug: "reviews", label: "reviews" },
];

export const DEFAULT_CATEGORY = "general";

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
