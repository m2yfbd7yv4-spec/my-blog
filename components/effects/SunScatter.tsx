"use client";

import { useEffect, useState } from "react";

type Sun = {
  id: number;
  side: "left" | "right";
  inset: number; // 距所在侧边缘的百分比（1-12%）
  top: number; // 0-100（相对酒红区高度的百分比）
  size: number; // px
  spinDirection: 1 | -1; // 1=顺时针（右转）-1=逆时针（左转），左右交替
  spinDuration: number; // 转一圈的秒数
  delay: number; // 动画延迟（秒）
  duration: number; // 漂浮周期（秒）
  opacity: number; // 0.7-0.95
};

// 太阳散落：左右两侧各 3 个、等距错落，漂浮 + 光晕，旋转方向左右交替，避开中间正文、不出屏。
export function SunScatter() {
  const [suns, setSuns] = useState<Sun[]>([]);

  useEffect(() => {
    // 仅客户端生成随机位置，避免 SSR 水合不一致
    const list: Sun[] = [];
    const perSide = 3; // 左右各 3 个，均衡
    // 大小分三档，让散落的太阳明显大小不一
    const tiers: [number, number][] = [
      [72, 92],
      [94, 114],
      [116, 144],
    ];
    for (let i = 0; i < perSide * 2; i++) {
      const side: Sun["side"] = i < perSide ? "left" : "right";
      const slot = i % perSide;
      // 垂直方向等距分布 + 抖动，避免扎堆；整体下移，与上方两侧的 1611 人物拉开距离
      const baseTop = ((slot + 0.5) / perSide) * 58 + 24; // 约 34/53/72%
      const top = Math.min(82, Math.max(24, baseTop + (Math.random() * 10 - 5)));
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const size = Math.round(tier[0] + Math.random() * (tier[1] - tier[0]));
      const inset = 1 + Math.random() * 11; // 1-12%，左右靠边、不出屏
      list.push({
        id: i,
        side,
        inset,
        top: Math.round(top),
        size,
        spinDirection: i % 2 === 0 ? 1 : -1, // 交替：顺/逆时针
        spinDuration: +(16 + Math.random() * 12).toFixed(2), // 16-28s 转一圈
        delay: +(Math.random() * 6).toFixed(2),
        duration: +(6 + Math.random() * 5).toFixed(2),
        opacity: +(0.7 + Math.random() * 0.25).toFixed(2),
      });
    }
    setSuns(list);
  }, []);

  return (
    <div aria-hidden className="sun-scatter">
      {suns.map((s) => (
        <div
          key={s.id}
          className="sun-scatter-item"
          style={{
            left: s.side === "left" ? `${s.inset}%` : undefined,
            right: s.side === "right" ? `${s.inset}%` : undefined,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <div
            className="sun-inner"
            style={{
              animation: `sun-spin ${s.spinDuration}s linear infinite${
                s.spinDirection === -1 ? " reverse" : ""
              }`,
            }}
          >
            <span className="sun-glow" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/home-sun.png" alt="" draggable={false} />
          </div>
        </div>
      ))}
    </div>
  );
}
