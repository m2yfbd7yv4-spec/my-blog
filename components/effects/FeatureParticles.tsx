"use client";

import { useEffect, useRef } from "react";

// 功能入口粒子特效：暖色微粒缓缓漂浮，滚动时被轻微推动，形成「滚动浮尘」感。
// sparkle = true 时切换成「亮晶晶」风格：亮白/香槟金配色、更高亮度、带光晕、闪烁更明显。
// 纯 Canvas 实现、零依赖；尊重「减弱动态效果」设置。
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  twinkle: number;
  color: string;
};

export function FeatureParticles({ sparkle = false }: { sparkle?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 用户开启了「减弱动态效果」：不渲染粒子
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 默认暖色系 vs 亮晶晶（亮白 / 香槟金 / 暖金）
    const COLORS = sparkle
      ? ["#ffffff", "#fff6df", "#ffe3a8", "#ffd27f", "#ffe9c0"]
      : ["#f4ece4", "#e8b79f", "#c0a493", "#7a5c4a", "#90443e"];

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];

    // 预渲染柔光贴片：画粒子前垫在下面，做出柔和光晕（替代昂贵的 shadowBlur，保证帧率）
    const glow = document.createElement("canvas");
    glow.width = 64;
    glow.height = 64;
    const gctx = glow.getContext("2d");
    if (gctx) {
      const grad = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 244, 224, 0.6)");
      grad.addColorStop(0.5, "rgba(255, 244, 224, 0.2)");
      grad.addColorStop(1, "rgba(255, 244, 224, 0)");
      gctx.fillStyle = grad;
      gctx.fillRect(0, 0, 64, 64);
    }

    const seed = () => {
      const count = sparkle
        ? Math.max(40, Math.floor((width * height) / 5000))
        : Math.max(28, Math.floor((width * height) / 6500));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(Math.random() * 0.4 + 0.1), // 缓慢上浮
        size: sparkle ? Math.random() * 3 + 1 : Math.random() * 2.2 + 0.6,
        alpha: sparkle ? Math.random() * 0.45 + 0.45 : Math.random() * 0.3 + 0.65,
        twinkle: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();

    // 滚动推力：滚得越快，粒子被推得越明显，随后逐渐衰减
    let scrollBoost = 0;
    let lastY = window.scrollY;
    const onScroll = () => {
      const delta = window.scrollY - lastY;
      lastY = window.scrollY;
      scrollBoost = Math.max(-3, Math.min(3, delta * 0.08));
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(2, (t - last) / 16.67); // 归一化到约 60fps
      last = t;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.twinkle += sparkle ? 0.045 : 0.03;
        p.y += (p.vy - scrollBoost) * dt;
        p.x += p.vx * dt;

        // 环绕：飘出边界后从另一边回来
        if (p.y < -12) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x < -12) p.x = width + 12;
        else if (p.x > width + 12) p.x = -12;

        // 亮晶晶：abs(sin) 让闪烁更「尖」，一明一暗更明显；默认则更柔和
        const a = sparkle
          ? p.alpha * (0.35 + 0.65 * Math.abs(Math.sin(p.twinkle)))
          : p.alpha * (0.85 + 0.15 * Math.sin(p.twinkle));
        // 默认模式：垫一层柔光，让粒子带一圈柔和光晕
        if (!sparkle) {
          const g = p.size * 4.5;
          ctx.globalAlpha = Math.max(0, Math.min(1, a * 0.7));
          ctx.drawImage(glow, p.x - g, p.y - g, g * 2, g * 2);
        }
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.fillStyle = p.color;
        if (sparkle) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 3.5; // 光晕，做出「晶晶」的发光感
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      scrollBoost *= 0.9; // 推力衰减
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sparkle]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
