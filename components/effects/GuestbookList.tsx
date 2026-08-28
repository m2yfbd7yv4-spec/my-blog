"use client";

import { useState } from "react";
import type { GuestbookMessageDisplay } from "@/lib/types";
import { formatDate } from "@/lib/utils";

// 留言列表：静态排列（不再用漂浮弹幕）。默认只显示最新 10 条，点「展开」查看全部。
export function GuestbookList({
  messages,
}: {
  messages: GuestbookMessageDisplay[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (messages.length === 0) {
    return (
      <p className="py-10 text-center text-sm tracking-[0.2em] text-[#96615f]">
        還沒有留言，來發第一條吧
      </p>
    );
  }

  const visible = expanded ? messages : messages.slice(0, 10);

  return (
    <div>
      <ul className="divide-y divide-[#e7d3d0]">
        {visible.map((m) => (
          <li key={m.id} className="flex items-baseline gap-3 py-3 text-sm">
            <span className="shrink-0 text-xs font-light text-white">
              {m.profiles?.username || "匿名"}
            </span>
            <span className="min-w-0 break-words text-[#2b1414]">
              {m.content}
            </span>
            <span className="ml-auto shrink-0 text-xs text-[#a98a86]">
              {formatDate(m.created_at)}
            </span>
          </li>
        ))}
      </ul>
      {messages.length > 10 && (
        <div className="pt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs tracking-[0.2em] text-[#96615f] underline underline-offset-4 transition-colors hover:text-[#6b3b38]"
          >
            {expanded ? "收起" : `展开全部（共 ${messages.length} 条）`}
          </button>
        </div>
      )}
    </div>
  );
}
