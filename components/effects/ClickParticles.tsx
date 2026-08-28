"use client";

import { useEffect, useRef } from "react";

// 点击粒子特效：点击页面任意位置，从点击处迸发出一小簇暖色粒子并缓缓消散。
// 独立组件，纯 Canvas 实现、零依赖；尊重「减弱动态效果」设置。
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
};

export function ClickParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 用户开启了「减弱动态效果」：不生成粒子
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const particles: Particle[] = [];
    // 暖色中性粒子，贴合编辑风配色
    const COLORS = ["#7a5c4a", "#8a8580", "#504f50", "#b3aea8", "#1a1a1a"];

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const spawn = (x: number, y: number) => {
      const count = 14 + Math.floor(Math.random() * 10); // 每簇 14~23 个
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1, // 略微向上飞
          life: 1,
          decay: Math.random() * 0.02 + 0.012,
          size: Math.random() * 3.5 + 1.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // 轻微重力
        p.vx *= 0.98; // 空气摩擦
        p.vy *= 0.98;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (particles.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        ctx.clearRect(0, 0, width, height); // 清空残留
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      spawn(e.clientX, e.clientY);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}
