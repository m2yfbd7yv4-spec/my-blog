// 把标题转成 URL 友好的 slug；纯中文标题自动用随机短串兜底
export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // 如果结果不含 ASCII 字母/数字（例如全中文），用随机短串保证 URL 干净
  if (!s || !/[a-z0-9]/.test(s)) {
    return `post-${Math.random().toString(36).slice(2, 10)}`;
  }
  return s;
}

// 格式化日期为中文（如「2026年8月26日」）
export function formatDate(date: string | null | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
