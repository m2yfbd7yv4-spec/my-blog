"use client";

import { useEffect, useRef } from "react";

// 鱼群背景：暖色小鱼围绕鼠标游动（鼠标移动时追踪），点击时从指针处四散逃开，随后重新聚回鼠标周围。
// 纯 Canvas 实现、零依赖；尊重「减弱动态效果」设置。

type Fish = {
  x: number;
  y: number;
  ox: number; // 相对鼠标的固定偏移：鱼在鼠标周围的方位
  oy: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  phase: number; // 尾巴摆动相位
  wander: number; // 游动方向（缓慢扰动）
  heading: number; // 当前朝向（画尾巴用）
};

// 暖金/奶油色，带柔光，能在视频背景上显出来
const COLORS = [
  "rgba(255, 250, 240, 0.95)",
  "rgba(255, 242, 220, 0.95)",
  "rgba(255, 228, 182, 0.92)",
  "rgba(250, 244, 236, 0.9)",
  "rgba(255, 214, 160, 0.9)",
];

function drawFish(
  ctx: CanvasRenderingContext2D,
  f: Fish,
  t: number,
  glow: HTMLCanvasElement,
) {
  // 速度足够时才更新朝向，静止时保持上一朝向，避免原地乱转
  if (Math.hypot(f.vx, f.vy) > 0.4) f.heading = Math.atan2(f.vy, f.vx);
  const s = f.size;
  const wag = Math.sin(t * 0.05 + f.phase) * 0.5;

  // 预渲染的柔光贴片垫在下面（替代昂贵的 shadowBlur，保证帧率顺滑）
  const g = s * 2.6;
  ctx.drawImage(glow, f.x - g, f.y - g, g * 2, g * 2);

  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.heading);
  ctx.fillStyle = f.color;

  // 尾巴（三角形，左右摆动）
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, 0);
  ctx.lineTo(-s * 1.5, -s * 0.6 + wag * s * 0.4);
  ctx.lineTo(-s * 1.5, s * 0.6 + wag * s * 0.4);
  ctx.closePath();
  ctx.fill();

  // 身体（椭圆）
  ctx.beginPath();
  ctx.ellipse(0, 0, s, s * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = "rgba(60, 45, 30, 0.75)";
  ctx.beginPath();
  ctx.arc(s * 0.42, -s * 0.1, s * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function FishSchool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 用户开启了「减弱动态效果」：不渲染鱼群
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 预渲染一张柔光贴片：画鱼前垫在下面，替代昂贵的 shadowBlur
    const glow = document.createElement("canvas");
    glow.width = 64;
    glow.height = 64;
    const gctx = glow.getContext("2d");
    if (gctx) {
      const grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 238, 210, 0.5)");
      grad.addColorStop(0.6, "rgba(255, 238, 210, 0.16)");
      grad.addColorStop(1, "rgba(255, 238, 210, 0)");
      gctx.fillStyle = grad;
      gctx.fillRect(0, 0, 64, 64);
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let fish: Fish[] = [];

    // 鼠标位置：首次以画布中心为默认，之后随移动更新
    let mouseX = 0;
    let mouseY = 0;
    let mouseSeen = false;

    const seed = () => {
      const count = Math.min(22, Math.max(12, Math.floor((width * height) / 70000)));
      fish = Array.from({ length: count }, () => {
        const ang = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 34; // 紧密绕在光标周围，光标本身就是一小团鱼
        return {
          x: mouseX + Math.cos(ang) * dist,
          y: mouseY + Math.sin(ang) * dist,
          ox: Math.cos(ang) * dist,
          oy: Math.sin(ang) * dist,
          vx: 0,
          vy: 0,
          size: 5 + Math.random() * 7,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          phase: Math.random() * Math.PI * 2,
          wander: Math.random() * Math.PI * 2,
          heading: Math.random() * Math.PI * 2,
        };
      });
    };

    // 直接用视口尺寸作为坐标基准，不依赖 canvas 的 getBoundingClientRect（避免定位被
    // ViewTransition / 布局容器影响时拿到错误尺寸，导致鱼群被挤压到左上角）
    const vw = () =>
      window.innerWidth || document.documentElement.clientWidth || 1440;
    const vh = () =>
      window.innerHeight || document.documentElement.clientHeight || 900;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = vw();
      height = vh();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!mouseSeen) {
        mouseX = width / 2;
        mouseY = height / 2;
      }
      seed();
    };
    resize();
    window.addEventListener("resize", resize);

    // 鼠标移动 → 追踪；点击 → 散开（给一记向外冲量）
    const onMove = (e: PointerEvent) => {
      mouseSeen = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      mouseSeen = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      // 立刻给一记向外冲量，让散开瞬间可见
      for (const f of fish) {
        const dx = f.x - e.clientX;
        const dy = f.y - e.clientY;
        const dist = Math.hypot(dx, dy) || 1;
        const power = 4 + Math.random() * 5;
        f.vx += (dx / dist) * power;
        f.vy += (dy / dist) * power;
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(2, (t - last) / 16.67); // 归一化到约 60fps
      last = t;
      ctx.clearRect(0, 0, width, height);

      for (const f of fish) {
        // 追踪目标 = 鼠标位置 + 固定偏移，让鱼群围绕鼠标、跟随鼠标移动
        const tx = mouseX + f.ox;
        const ty = mouseY + f.oy;
        let fx = (tx - f.x) * 0.06; // 追踪力（弹簧）：0.025 太慢、0.12 太快，取中间值
        let fy = (ty - f.y) * 0.06;

        // 游动：缓慢改变方向的小扰动（幅度调小，让鱼更贴光标）
        f.wander += (Math.random() - 0.5) * 0.4;
        fx += Math.cos(f.wander) * 0.02;
        fy += Math.sin(f.wander) * 0.02;

        f.vx = (f.vx + fx) * 0.9;
        f.vy = (f.vy + fy) * 0.9;
        const sp = Math.hypot(f.vx, f.vy);
        if (sp > 10) {
          f.vx = (f.vx / sp) * 10;
          f.vy = (f.vy / sp) * 10;
        }
        f.x += f.vx * dt;
        f.y += f.vy * dt;

        // 边界：飘出后从另一边回来
        if (f.x < -20) f.x = width + 20;
        else if (f.x > width + 20) f.x = -20;
        if (f.y < -20) f.y = height + 20;
        else if (f.y > height + 20) f.y = -20;

        drawFish(ctx, f, t, glow);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        // 高于正文层(z-10)，让小鱼光标浮在推荐文章/公告横带之上，不被盖住；仍低于导航栏(z-20)
        zIndex: 15,
        pointerEvents: "none",
      }}
    />
  );
}
