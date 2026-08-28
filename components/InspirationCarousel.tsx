"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/utils";
import type { Inspiration } from "@/lib/types";

// 灵感源泉 3D 旋转木马：卡片（配图+文字）围成一圈，
// 整圈缓慢自动旋转；滚轮/左右拖拽给它加惯性；悬停单张卡片放大。
export function InspirationCarousel({ items }: { items: Inspiration[] }) {
  const ringRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const dragRef = useRef<{ lastX: number } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dims, setDims] = useState({ cardW: 150, cardH: 187, radius: 230 });

  const n = items.length;

  // 响应式卡片尺寸 + 环形半径
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const cardW = Math.min(150, Math.max(104, w * 0.12));
      const cardH = cardW * 1.25;
      const a = (2 * Math.PI) / Math.max(n, 3);
      const radius = Math.max(cardW, cardW / (2 * Math.tan(a / 2)) + 28);
      setDims({ cardW, cardH, radius });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [n]);

  // 自动旋转 + 惯性衰减（仅 3 条及以上才转圈）
  useEffect(() => {
    if (n < 3) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      velocityRef.current *= 0.96;
      rotationRef.current += 5.5 * dt + velocityRef.current * 36 * dt;
      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [n]);

  const onWheel = (e: React.WheelEvent) => {
    velocityRef.current += e.deltaY * 0.04;
  };
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { lastX: e.clientX };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.lastX;
    dragRef.current.lastX = e.clientX;
    velocityRef.current += dx * 0.5;
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  if (n === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-typewriter text-sm tracking-wider text-[#8a8580]">
          还没有灵感记录，灵感正在路上。
        </p>
      </div>
    );
  }

  // 图片高度：固定占卡片上半部分，尺寸用内联像素写死，不依赖外部 CSS
  const imgH = Math.round(dims.cardH * 0.5);

  // 单张卡片内容（平铺和环形共用）
  const renderCard = (it: Inspiration, i: number) => (
    <div
      className={`insp-card ${hovered === i ? "is-hovered" : ""}`}
      style={{ width: dims.cardW, height: dims.cardH }}
    >
      {it.image_url ? (
        <img
          src={it.image_url}
          alt=""
          width={dims.cardW}
          height={imgH}
          className="insp-card-img"
          style={{ width: dims.cardW, height: imgH }}
        />
      ) : (
        <div
          className="insp-card-img insp-card-img--empty"
          aria-hidden
          style={{ width: dims.cardW, height: imgH }}
        >
          ✦
        </div>
      )}
      <div className="insp-card-body">
        <p className="insp-card-text">{it.content}</p>
        <time className="insp-card-date">{formatDate(it.created_at)}</time>
      </div>
    </div>
  );

  // 1~2 条：直接平铺，不转圈
  if (n <= 2) {
    return (
      <div className="flex h-full items-center justify-center gap-6 px-6">
        {items.map((it, i) => (
          <div
            key={it.id}
            style={{ width: dims.cardW, height: dims.cardH }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {renderCard(it, i)}
          </div>
        ))}
      </div>
    );
  }

  const angle = 360 / n;

  return (
    <div
      className="insp-scene"
      style={
        {
          "--cw": `${dims.cardW}px`,
          "--ch": `${dims.cardH}px`,
          "--radius": `${dims.radius}px`,
        } as React.CSSProperties
      }
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="insp-ring" ref={ringRef}>
        {items.map((it, i) => (
          <div
            key={it.id}
            className="insp-slot"
            style={{
              width: dims.cardW,
              height: dims.cardH,
              transform: `rotateY(${i * angle}deg) translateZ(${dims.radius}px)`,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {renderCard(it, i)}
          </div>
        ))}
      </div>
    </div>
  );
}
