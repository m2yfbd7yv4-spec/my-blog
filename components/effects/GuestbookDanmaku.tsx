"use client";

import type { GuestbookMessageDisplay } from "@/lib/types";

// 留言板弹幕：在区块内从右往左漂浮。纯 CSS 动画，零依赖。
// 动画参数由索引/内容长度确定性算出，保证服务端渲染与客户端一致。
export function GuestbookDanmaku({
  messages,
}: {
  messages: GuestbookMessageDisplay[];
}) {
  if (messages.length === 0) {
    return (
      <p className="py-10 text-center text-sm tracking-[0.2em] text-[#96615f]">
        還沒有留言，來發第一條吧
      </p>
    );
  }

  return (
    <div className="danmaku-stage" aria-hidden="true">
      {messages.map((m, i) => {
        const lane = (i * 7) % 5; // 5 条泳道，7 互质散开
        const top = 5 + lane * 18; // 5% ~ 77%
        const dur = Math.max(8, Math.min(18, 8 + m.content.length * 0.3));
        const delay = -((i * 13) % Math.floor(dur));
        return (
          <span
            key={m.id}
            className="danmaku-item"
            style={{
              top: `${top}%`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          >
            <span className="danmaku-name">{m.profiles?.username || "匿名"}</span>
            {m.content}
          </span>
        );
      })}
    </div>
  );
}
