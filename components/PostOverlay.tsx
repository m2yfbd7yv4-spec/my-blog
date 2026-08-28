"use client";

import { useEffect } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { formatDate } from "@/lib/utils";
import type { ArchivePost } from "@/lib/types";

// 归档页「浮层阅读」：点击目录里的文章后，以一张纸片的形式从面板上弹出正文，
// 盖在目录上方；点关闭按钮 / 空白处 / ESC 都能返回目录。
export function PostOverlay({
  post,
  onClose,
}: {
  post: ArchivePost;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // 不锁背景滚动：打开浮层时，外面那层主页面仍可滚动
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      {/* 半透明遮罩：点击空白处关闭 */}
      <div
        className="overlay-backdrop absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 纸片浮层：外层负责弹出动画 + 裁剪，内层纸面负责毛边纹理 */}
      <div className="post-overlay-sheet relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden">
        <div className="overlay-paper absolute inset-0" aria-hidden="true" />

        {/* 内容滚动层 */}
        <div className="relative z-10 max-h-[85vh] overflow-y-auto">
          {/* 关闭按钮：吸顶，滚动时保持可见 */}
          <div className="sticky top-0 z-20 flex justify-end px-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fffdf8]/85 text-lg text-[#8a8580] transition-colors hover:text-[#1a1a1a]"
            >
              ✕
            </button>
          </div>

          <div className="px-6 pb-10 md:px-10">
            <header className="mb-8 pr-8">
              <h1 className="font-display text-3xl md:text-4xl text-[#1a1a1a] mb-3">
                {post.title}
              </h1>
              <time className="text-xs uppercase tracking-[0.25em] text-[#8a8580]">
                {formatDate(post.published_at)}
              </time>
            </header>

            {post.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.cover_image} alt={post.title} className="mb-8 w-full" />
            )}

            <MarkdownRenderer content={post.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
