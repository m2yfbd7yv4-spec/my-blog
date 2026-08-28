"use client";

import { useEffect, useRef } from "react";

// 玻璃水滴：一颗颗水珠贴在玻璃上，沿着表面慢慢往下滑，留下柔和的湿痕。
// 铺满整屏；水珠偶尔「跑」起来（快速滑落一道长痕），整体流动感强、质感柔和。
// 湿痕用 destination-out 淡出，在透明画布上留下自然的拖尾。

type Drop = {
  x: number;
  y: number;
  r: number; // 半径
  vx: number;
  vy: number; // 当前下滑速度
  speed: number; // 目标慢速
  alpha: number;
  phase: number;
};

export function Waterfall({
  count = 320,
  color = "255, 252, 246",
}: {
  count?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 捕获非空别名：TS 不会把 const 的空值收窄带进内部函数声明里
    const CV = canvas;
    const CTX = ctx;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const drops: Drop[] = [];

    function resize() {
      // 用视口尺寸，避免 canvas 被「替换元素」默认 300×150 卡住不撑满
      W = window.innerWidth;
      H = window.innerHeight;
      CV.width = W * DPR;
      CV.height = H * DPR;
      CV.style.width = W + "px";
      CV.style.height = H + "px";
      CTX.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function spawn(d: Drop, fromTop: boolean) {
      d.x = Math.random() * W;
      d.y = fromTop ? -Math.random() * 30 : Math.random() * H;
      d.r = 1.5 + Math.random() * 2.8; // 大小不一的水珠
      d.vx = 0;
      d.vy = 0.25 + Math.random() * 0.65; // 缓慢下滑
      d.speed = d.vy;
      d.alpha = 0.05 + Math.random() * 0.12; // 进一步压低透明度，水珠几乎隐进背景
      d.phase = Math.random() * Math.PI * 2;
    }

    resize();
    for (let i = 0; i < count; i++) {
      const d = {} as Drop;
      spawn(d, false);
      drops.push(d);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    let raf = 0;

    // 随滚动淡入淡出：顶部最清晰，往下滚逐渐隐去，往回滚恢复
    let scrollTarget = 1;
    let scrollFactor = 1;

    function onScroll() {
      const fade = Math.max(560, window.innerHeight * 1.6);
      scrollTarget = Math.max(0, 1 - window.scrollY / fade);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function tick(now: number) {
      const t = now / 1000;
      scrollFactor += (scrollTarget - scrollFactor) * 0.1;

      // 湿痕淡出：让水珠滑过的痕迹慢慢消失，形成柔和的拖尾
      CTX.globalCompositeOperation = "destination-out";
      CTX.fillStyle = "rgba(0,0,0,0.035)";
      CTX.fillRect(0, 0, W, H);
      CTX.globalCompositeOperation = "source-over";

      for (const d of drops) {
        const a = d.alpha * scrollFactor; // 滚动淡出后的有效透明度
        // 轻微左右摆动 + 玻璃表面细微的「黏着」晃动
        const sway = Math.sin(t * 0.3 + d.phase) * 0.2 + Math.sin(t * 0.12) * 0.1;
        d.vx += (sway - d.vx) * 0.01;

        // 偶尔「跑」起来：水珠积到一定重量就快速滑落一道长痕
        if (Math.random() < 0.0006) {
          d.vy += 2.5 + Math.random() * 3;
        }
        // 跑完后缓缓回到慢速
        d.vy += (d.speed - d.vy) * 0.006;

        d.x += d.vx;
        d.y += d.vy;

        // 滑出底部就回到顶部，重新开始
        if (d.y > H + d.r * 2) spawn(d, true);
        if (d.x < -10) d.x = W + 10;
        if (d.x > W + 10) d.x = -10;

        // 水珠：柔和的径向渐变（高光在上、慢慢化开）+ 一颗高光点
        const g = CTX.createRadialGradient(
          d.x - d.r * 0.35,
          d.y - d.r * 0.4,
          d.r * 0.1,
          d.x,
          d.y,
          d.r,
        );
        g.addColorStop(0, `rgba(${color},${a})`);
        g.addColorStop(0.55, `rgba(${color},${a * 0.35})`);
        g.addColorStop(1, `rgba(${color},0)`);
        CTX.fillStyle = g;
        CTX.beginPath();
        CTX.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        CTX.fill();

        // 高光点：左上角一颗亮晶晶的小点
        CTX.fillStyle = `rgba(255,255,255,${Math.min(0.2, a + 0.05 * scrollFactor)})`;
        CTX.beginPath();
        CTX.arc(d.x - d.r * 0.32, d.y - d.r * 0.36, d.r * 0.22, 0, Math.PI * 2);
        CTX.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [count, color]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed z-0"
      style={{ top: 0, left: 0, width: "100vw", height: "100vh" }}
      aria-hidden="true"
    />
  );
}
