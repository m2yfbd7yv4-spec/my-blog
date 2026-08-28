"use client";

import { useEffect, useRef } from "react";

// 粒子波浪背景：白色柔光粒子排成网格，随正弦波起伏（像会呼吸的水面）。
// 鼠标悬停处粒子向外散开，移开后弹簧回位。纯 Canvas、零依赖；尊重「减弱动态效果」。

type P = {
  bx: number; // 网格基准位置
  by: number;
  x: number; // 当前位置
  y: number;
  vx: number;
  vy: number;
  phase: number;
  size: number;
};

export function ParticleWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 预渲染柔光贴片：替代昂贵的 shadowBlur，保证大量粒子时帧率顺滑
    const glow = document.createElement("canvas");
    glow.width = 48;
    glow.height = 48;
    const gctx = glow.getContext("2d");
    if (gctx) {
      const grad = gctx.createRadialGradient(24, 24, 0, 24, 24, 24);
      grad.addColorStop(0, "rgba(255, 252, 245, 0.9)");
      grad.addColorStop(0.4, "rgba(255, 250, 240, 0.35)");
      grad.addColorStop(1, "rgba(255, 250, 240, 0)");
      gctx.fillStyle = grad;
      gctx.fillRect(0, 0, 48, 48);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let ps: P[] = [];
    let mouseX = -1e9;
    let mouseY = -1e9;

    const GAP = 40;

    const vw = () =>
      window.innerWidth || document.documentElement.clientWidth || 1440;
    const vh = () =>
      window.innerHeight || document.documentElement.clientHeight || 900;

    const seed = () => {
      const cols = Math.ceil(W / GAP) + 2;
      const rows = Math.ceil(H / GAP) + 2;
      ps = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ps.push({
            bx: c * GAP,
            by: r * GAP,
            x: c * GAP,
            y: r * GAP,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2,
            size: 1.3 + Math.random() * 1.7,
          });
        }
      }
    };

    const resize = () => {
      W = vw();
      H = vh();
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onLeave = () => {
      mouseX = -1e9;
      mouseY = -1e9;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    const R = 140; // 悬停影响半径

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(2, (t - last) / 16.67);
      last = t;
      ctx.clearRect(0, 0, W, H);

      const time = t / 1000;

      for (const p of ps) {
        // 波浪位移：两个方向/频率的正弦叠加，形成流动起伏
        const wave = Math.sin(p.bx * 0.018 + time * 1.2 + p.phase) +
          Math.cos(p.by * 0.022 + time * 0.9);
        const wx = wave * 5;
        const wy =
          Math.cos(p.bx * 0.02 + time * 0.8 + p.phase) * 6 +
          Math.sin(p.by * 0.016 + time * 1.1) * 5;

        let tx = p.bx + wx;
        let ty = p.by + wy;

        // 悬停散开：鼠标附近的粒子被向外推开（力度随距离衰减）
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < R) {
          const force = 1 - dist / R;
          const push = force * force * 110;
          tx += (dx / (dist || 1)) * push;
          ty += (dy / (dist || 1)) * push;
        }

        // 弹簧追踪目标位置
        p.vx = (p.vx + (tx - p.x) * 0.1) * 0.85;
        p.vy = (p.vy + (ty - p.y) * 0.1) * 0.85;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // 明暗随波浪：波峰更亮、更大
        const bright = 0.5 + 0.5 * Math.sin(p.bx * 0.018 + time * 1.2 + p.phase);
        const a = 0.25 + 0.5 * bright;
        const g = p.size * (2.4 + bright * 1.4);
        ctx.globalAlpha = Math.max(0, Math.min(1, a));
        ctx.drawImage(glow, p.x - g, p.y - g, g * 2, g * 2);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
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
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
