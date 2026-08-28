"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Inspiration } from "@/lib/types";

// 灵感散布：围着中心的标题绕成同心圆环，越新的在内圈、越旧的在外圈；
// 点击整页逐级拉远（scale 缩小），每拉远一次看到更外圈的灵感图。
type Node = Inspiration & { x: number; y: number; size: number; rotate: number };

const INNER_RADIUS = 400; // 内圈半径（中间留给标题）
const RING_GAP = 340; // 圈与圈间距
const PER_RING = 6; // 每圈图片数
const ZOOM_STEP = 0.7; // 每次点击缩放倍率
const CARD_BASE = 200; // 卡片基准宽度

export function InspirationScatter({ items }: { items: Inspiration[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [sMin, setSMin] = useState(0);
  const [sStart, setSStart] = useState(1.1);
  const [hint, setHint] = useState(true);

  // 同心圆环布局：内圈最新、外圈最旧，相邻圈错开半个间隔避免上下对齐
  const world = useMemo(() => {
    const nodes: Node[] = items.map((it, i) => {
      const ring = Math.floor(i / PER_RING);
      const idx = i % PER_RING;
      const angle = (idx / PER_RING) * Math.PI * 2 + ring * (Math.PI / PER_RING);
      const r = INNER_RADIUS + ring * RING_GAP;
      return {
        ...it,
        // 取整：避免服务端/客户端浮点运算最后一位不一致，导致 hydration 报错
        x: Math.round(r * Math.cos(angle)),
        y: Math.round(r * Math.sin(angle)),
        size: CARD_BASE + ((i * 53) % 90), // 200~289px，略有大小变化
        rotate: ((i * 37) % 15) - 7, // -7°~7° 轻微散落倾斜
      };
    });
    const lastRing = Math.max(0, Math.ceil(items.length / PER_RING) - 1);
    const rMax = INNER_RADIUS + lastRing * RING_GAP;
    const half = rMax + 320;
    return { nodes, half };
  }, [items]);

  // 测量视口 → 计算「全览」缩放与初始放大（带 window 兜底）
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const w = r.width || window.innerWidth;
      const h = r.height || window.innerHeight;
      const fit = Math.min(w / (world.half * 2), h / (world.half * 2));
      // 初始缩放：让内圈图片围着标题、清晰可见
      const start = Math.max((Math.min(w, h) * 0.42) / INNER_RADIUS, fit * 1.25);
      setSMin(fit);
      setSStart(start);
      setScale((prev) => prev ?? start);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [world]);

  const zoomOut = useCallback(() => {
    setHint(false);
    setScale((prev) => {
      if (prev == null) return prev;
      const next = prev * ZOOM_STEP;
      if (next <= sMin) {
        // 已到最远：点击回到最近，循环往复
        return sStart;
      }
      return next;
    });
  }, [sMin, sStart]);

  // 尚未测量前给个默认缩放，保证图片先显示出来，绝不出现「空白」
  const s = scale ?? 1.1;
  const atMax = scale != null && scale <= sMin * 1.05;

  if (items.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-typewriter text-sm tracking-wider text-[#8a8580]">
          还没有灵感记录。
        </p>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      onClick={zoomOut}
      className={`absolute inset-0 grid select-none place-items-center overflow-hidden ${
        atMax ? "cursor-zoom-in" : "cursor-zoom-out"
      }`}
    >
      <div
        className="relative h-0 w-0"
        style={{
          transform: `scale(${s})`,
          transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {world.nodes.map((nd) => (
          <ScatterCard key={nd.id} node={nd} />
        ))}

        {/* 标题：居中跟随缩放，不拦截点击 */}
        <div
          className="pointer-events-none absolute"
          style={{
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <p
            className="font-script whitespace-nowrap text-5xl md:text-7xl text-[#1a1a1a]"
            style={{
              textShadow:
                "0 2px 10px rgba(255,255,255,1), 0 0 28px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,0.95), 0 0 110px rgba(255,255,255,0.85)",
            }}
          >
            Inspiration
          </p>
        </div>
      </div>

      {/* 提示：首次点击后淡出 */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center transition-opacity duration-700 ${
          hint ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-typewriter text-xs tracking-[0.25em] text-[#8a8580]">
          点击页面 · 拉远查看更多灵感
        </p>
      </div>
    </div>
  );
}

// 单张灵感卡片：仿拍立得的白边相框 + 一张图 + 一行小字说明
function ScatterCard({ node }: { node: Node }) {
  return (
    <div
      className="absolute"
      style={{
        left: node.x,
        top: node.y,
        width: node.size,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="overflow-hidden rounded-sm border border-[#e0d8ca] bg-[#fffdf8] p-2 shadow-[0_14px_34px_-16px_rgba(60,45,30,0.45)]"
        style={{ transform: `rotate(${node.rotate}deg)` }}
      >
        {node.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={node.image_url}
            alt=""
            draggable={false}
            className="aspect-[4/3] w-full bg-[#efe7da] object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-[#f1ebe0] px-3">
            <p className="line-clamp-4 text-xs leading-relaxed text-[#7a6f62]">
              {node.content}
            </p>
          </div>
        )}
      </div>
      <p
        className="mt-2 line-clamp-1 px-1 text-center text-xs leading-snug text-[#4a4038]"
        style={{
          textShadow:
            "0 1px 8px rgba(255,255,255,0.95), 0 0 16px rgba(255,255,255,0.75)",
        }}
      >
        {node.content}
      </p>
    </div>
  );
}
