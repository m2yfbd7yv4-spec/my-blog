import { formatDate } from "@/lib/utils";
import type { Inspiration } from "@/lib/types";

// 灵感源泉时间轴：竖向线条 + 节点，按时间（新→旧）收录全部灵感。
// 纯展示组件（服务端渲染），复用 formatDate 格式化中文日期。
export function InspirationTimeline({ items }: { items: Inspiration[] }) {
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <p className="font-typewriter text-sm tracking-wider text-[#8a8580]">
          还没有灵感记录。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24">
      <h2 className="font-typewriter text-sm uppercase tracking-[0.3em] text-[#8a8580] mb-8">
        时间轴
      </h2>
      <ol className="relative border-l border-[#e0d8cc] pl-8 space-y-10">
        {items.map((it) => (
          <li key={it.id} className="relative">
            {/* 节点圆点：贴在左竖线上 */}
            <span
              className="absolute -left-[38px] top-1 h-3 w-3 rounded-full bg-[#7a3f2a] ring-4 ring-[#fffdf8]"
              aria-hidden
            />
            <time className="font-typewriter text-xs tracking-[0.2em] text-[#b3aea8]">
              {formatDate(it.created_at)}
            </time>
            {it.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.image_url} alt="" className="mt-3 w-40 object-cover" />
            )}
            <p className="mt-3 text-[#504f50] leading-relaxed">{it.content}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
