import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 把标题转成 URL 友好的 slug；纯中文标题自动用随机短串兜底
export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // 只要结果含有任何非 ASCII 字符（中文、全角符号、表情等），就用随机短串兜底，
  // 保证 URL 干净可访问。之前只判断「有没有英文字母/数字」，中文标题带个数字「1」
  // 就会漏过，存成中文 slug 导致点进去 404。
  if (!s || /[^a-z0-9-]/.test(s)) {
    return `post-${Math.random().toString(36).slice(2, 10)}`;
  }
  return s;
}

// 北京时间（UTC+8，无夏令时）当天 00:00 对应的 UTC 时间。
// Vercel 服务器跑在 UTC，直接用 setHours(0,0,0,0) 会按 UTC 零点重置（= 北京时间早上 8 点）。
// 这里手动换算，让「每天限额」在北京时间凌晨 12 点重置。
export function beijingDayStart(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 得到北京"墙上时间"
  const utcMidnight = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
  return new Date(utcMidnight - 8 * 60 * 60 * 1000);
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
