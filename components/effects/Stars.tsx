"use client";

import { useEffect, useRef } from "react";

// 发光星星：暖白/金的小星星撒在顶部棕色背景区域，一闪一闪（呼吸式明暗），
// 少数带十字星光，缓缓漂移；往下（接近棕色区域底部）逐渐淡出，与酒红区自然衔接。

const OPACITY = 0.85; // 整体透明度（越小越透明）

type Star = {
  x: number;
  y: number;
  r: number; // 星核半径
  glow: number; // 光晕半径倍数
  phase: number; // 闪烁相位
  speed: number; // 闪烁速度
  vx: number;
  vy: number; // 缓慢漂移
  sparkle: boolean; // 是否带十字星光
};

export function Stars({
  count = 130,
}: {
  count?: number;
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
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0; // 棕色区域高度 = 120vh
    let fadeStart = 0; // 从这一高度开始淡出
    let fadeEnd = 0; // 到这一高度完全消失
    const stars: Star[] = [];

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight * 1.2; // 与 .home-bg 的 height:120vh 对齐
      fadeStart = H * 0.5; // 下半段开始淡出
      fadeEnd = H * 0.85; // 接近底部完全消失
      CV.width = W * DPR;
      CV.height = H * DPR;
      CV.style.width = W + "px";
      CV.style.height = H + "px";
      CTX.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function spawn(s: Star) {
      s.x = Math.random() * W;
      s.y = Math.random() * H;
      s.r = 0.8 + Math.random() * 2; // 星核略大，更醒目
      s.glow = 4 + Math.random() * 4; // 光晕半径 4~8 倍星核
      s.phase = Math.random() * Math.PI * 2;
      s.speed = 0.6 + Math.random() * 1.8; // 闪烁速度
      s.vx = (Math.random() - 0.5) * 0.12; // 缓慢漂移
      s.vy = (Math.random() - 0.5) * 0.12;
      s.sparkle = Math.random() < 0.3; // 约三成带十字星光
    }

    function drawStar(s: Star, t: number) {
      const { x, y, r } = s;

      // 底部淡出：位于 fadeStart~fadeEnd 之间线性变淡，以下消失
      let vf = 1;
      if (y > fadeStart) {
        vf = y >= fadeEnd ? 0 : 1 - (y - fadeStart) / (fadeEnd - fadeStart);
      }
      if (vf <= 0.01) return;

      // 呼吸式明暗：0.2 ~ 1.0 之间起伏，最暗也保留一点
      const tw = 0.6 + 0.4 * Math.sin(t * s.speed + s.phase);
      const a = OPACITY * vf * tw;
      if (a <= 0.02) return;

      CTX.globalAlpha = a;

      // 1) 光晕：暖金柔光
      const gr = r * s.glow;
      const g = CTX.createRadialGradient(x, y, 0, x, y, gr);
      g.addColorStop(0, "rgba(255, 246, 210, 1)");
      g.addColorStop(0.25, "rgba(255, 210, 110, 0.6)");
      g.addColorStop(0.6, "rgba(255, 190, 80, 0.2)");
      g.addColorStop(1, "rgba(255, 180, 70, 0)");
      CTX.fillStyle = g;
      CTX.beginPath();
      CTX.arc(x, y, gr, 0, Math.PI * 2);
      CTX.fill();

      // 2) 十字星光（少数几颗）
      if (s.sparkle) {
        CTX.strokeStyle = "rgba(255, 250, 235, 0.85)";
        CTX.lineWidth = Math.max(0.5, r * 0.25);
        CTX.lineCap = "round";
        const L = gr * 1.1;
        CTX.beginPath();
        CTX.moveTo(x - L, y);
        CTX.lineTo(x + L, y);
        CTX.moveTo(x, y - L);
        CTX.lineTo(x, y + L);
        CTX.stroke();
      }

      // 3) 星核：一颗亮白小点
      CTX.fillStyle = "rgba(255, 255, 255, 1)";
      CTX.beginPath();
      CTX.arc(x, y, r, 0, Math.PI * 2);
      CTX.fill();

      CTX.globalAlpha = 1;
    }

    function redraw(t: number) {
      CTX.clearRect(0, 0, W, H);
      for (const s of stars) drawStar(s, t);
    }

    resize();
    for (let i = 0; i < count; i++) {
      const s = {} as Star;
      spawn(s);
      stars.push(s);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    let raf = 0;

    function tick(now: number) {
      const t = now / 1000;
      CTX.clearRect(0, 0, W, H);

      for (const s of stars) {
        // 缓慢漂移，漂出边界就绕到另一边
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -30) s.x = W + 30;
        else if (s.x > W + 30) s.x = -30;
        if (s.y < -30) s.y = H + 30;
        else if (s.y > H + 30) s.y = -30;

        drawStar(s, t);
      }

      raf = requestAnimationFrame(tick);
    }

    if (reduceMotion) {
      // 减少动态偏好：只画静态一帧，不循环动画
      redraw(0);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute z-0"
      style={{ top: 0, left: 0, width: "100vw", height: "120vh" }}
      aria-hidden="true"
    />
  );
}
