"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { PostOverlay } from "@/components/PostOverlay";
import { PostCard } from "@/components/PostCard";
import { PaperCard } from "@/components/effects/PaperCard";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import type { ArchivePost } from "@/lib/types";

type View = "list" | "grid";

// 归档正文：右上角「列表 / 方格」切换，两种视图共用同一份文章数据。
export function ArchiveView({ posts }: { posts: ArchivePost[] }) {
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<ArchivePost | null>(null);

  if (posts.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-[#8a8580]">还没有文章。</p>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-end gap-x-4 text-xs uppercase tracking-[0.15em]">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`transition-colors ${
            view === "list"
              ? "text-[#7a3f2a]"
              : "text-[#8a8580] hover:text-[#1a1a1a]"
          }`}
        >
          列表
        </button>
        <span aria-hidden className="h-4 w-px bg-[#d8d4cd]" />
        <button
          type="button"
          onClick={() => setView("grid")}
          className={`transition-colors ${
            view === "grid"
              ? "text-[#7a3f2a]"
              : "text-[#8a8580] hover:text-[#1a1a1a]"
          }`}
        >
          方格
        </button>
      </div>

      {view === "list" ? (
        <ListView posts={posts} onOpen={setSelected} />
      ) : (
        <GridView posts={posts} onOpen={setSelected} />
      )}

      {selected && (
        <PostOverlay post={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ListView({
  posts,
  onOpen,
}: {
  posts: ArchivePost[];
  onOpen: (p: ArchivePost) => void;
}) {
  const byYear = new Map<string, ArchivePost[]>();
  for (const p of posts) {
    const year = p.published_at
      ? new Date(p.published_at).getFullYear().toString()
      : "未知";
    const arr = byYear.get(year) ?? [];
    arr.push(p);
    byYear.set(year, arr);
  }

  // 全局递增序号，让「波浪」错落跨年份连续
  let index = 0;
  const sections = [...byYear.entries()].map(([year, list]) => ({
    year,
    items: list.map((p) => ({ post: p, i: index++ })),
  }));

  return (
    <div>
      {sections.map(({ year, items }) => (
        <section key={year} className="mb-12">
          <h2 className="font-display text-2xl text-[#1a1a1a] mb-4">{year}</h2>
          <ul>
            {items.map(({ post, i }) => (
              <li key={post.id} className="border-b border-[#e8e6e1]">
                <ScrollReveal delay={(i % 6) * 70} className="reveal-br">
                  <button
                    type="button"
                    onClick={() => onOpen(post)}
                    className="group flex w-full items-baseline justify-between gap-4 py-4 text-left"
                  >
                    <span className="font-display text-[#1a1a1a] transition-colors group-hover:text-[#7a5c4a]">
                      {post.title}
                    </span>
                    <time className="shrink-0 text-xs tracking-[0.15em] text-[#b3aea8]">
                      {formatDate(post.published_at)}
                    </time>
                  </button>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function GridView({
  posts,
  onOpen,
}: {
  posts: ArchivePost[];
  onOpen: (p: ArchivePost) => void;
}) {
  return (
    <div className="columns-1 md:columns-2 gap-8">
      {posts.map((post) => (
        <ScrollReveal key={post.id} className="mb-8 break-inside-avoid">
          <PaperCard>
            <PostCard post={post} onOpen={() => onOpen(post)} />
          </PaperCard>
        </ScrollReveal>
      ))}
    </div>
  );
}
