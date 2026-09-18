"use client";

import Link from "next/link";
import { journalSubcategoryLabel } from "@/lib/journal";
import { PaperCard } from "@/components/effects/PaperCard";

type MarqueeEntry = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  summary: string;
};

// 把列表重复铺满轨道：至少 28 张卡片，且总数为原列表的偶数倍
// （配合 CSS 的 translateX(-50%)，位移恰好回到整份列表的起点，实现无缝循环）
function buildMarqueeList<T>(list: T[]): T[] {
  const target = Math.max(28, list.length * 2);
  const copies = Math.ceil(target / list.length);
  const evenCopies = copies % 2 === 0 ? copies : copies + 1;
  return Array.from({ length: evenCopies }, () => list).flat();
}

// 首页「践学存档」：两行横向滚动。第一行=经历（向左），第二行=干货（向右）。
export function JournalMarquee({ entries }: { entries: MarqueeEntry[] }) {
  const rows = [
    { key: "experience", reverse: false },
    { key: "knowledge", reverse: true },
  ];

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#c0a493]">
        还没有内容，敬请期待。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const list = entries.filter((e) => e.category === row.key);
        if (list.length === 0) return null;
        const items = buildMarqueeList(list);

        return (
          <div key={row.key} className="overflow-hidden py-4">
            <div
              className={`marquee-track${
                row.reverse ? " marquee-track--reverse" : ""
              }`}
            >
              {items.map((e, i) => (
                <Link
                  key={`${e.id}-${i}`}
                  href={`/journal/${e.id}`}
                  className="marquee-card block"
                >
                  <PaperCard floating>
                    <span className="block text-[11px] tracking-[0.2em] text-[#b98a6b]">
                      {journalSubcategoryLabel(e.subcategory)}
                    </span>
                    <h3 className="mt-1.5 font-display text-lg leading-snug text-[#241209]">
                      {e.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#46281a]">
                      {e.summary}
                    </p>
                  </PaperCard>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
