"use client";

import { useEffect, useRef } from "react";

// 水面波纹背景：把背景照片做成一片会泛起涟漪的「水面」。
// 鼠标移动处荡开小涟漪、点击处荡开大涟漪并迸出闪光，水波会折射照片、产生高光。
//
// 忠实复刻参考效果 pastel-lab.pages.dev/flower-water-ripples 的核心：
//   CPU 波场模拟 + WebGL 折射着色 + 2D 闪光。
// 去掉了参考页里针对其特定照片的花朵/花瓣/控制面板，只保留通用的波纹交互。
// 尊重「减弱动态效果」：开启后只显示静态照片，不跑任何动画。

type Sparkle = {
  x: number;
  y: number;
  life: number;
  max: number;
  size: number;
  rot: number;
  vy: number;
  warm: boolean;
  iri: boolean;
};

export function WaterRipple({
  photo = "/ripple-bg.jpg",
  saturate = 1,
  className = "fixed inset-0 z-0",
}: {
  photo?: string;
  saturate?: number;
  className?: string;
}) {
  const glRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glCv = glRef.current;
    const fxCv = fxRef.current;
    const container = containerRef.current;
    if (!glCv || !fxCv || !container) return;

    // 减弱动态效果：直接退回静态照片背景，不初始化任何动画
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fctx = fxCv.getContext("2d");
    if (!fctx) return;
    const gl = (glCv.getContext("webgl", {
      preserveDrawingBuffer: true,
      antialias: false,
    }) ||
      glCv.getContext("experimental-webgl", {
        preserveDrawingBuffer: true,
      })) as WebGLRenderingContext | null;
    if (!gl) return;

    // TS 无法在闭包内保留上面这些变量的非空窄化，这里把非空类型固定到新常量
    const GL = gl;
    const CTX = fctx;
    const GLCV = glCv;
    const FXCV = fxCv;
    const CONTAINER = container;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    // ===== 波场（CPU，粗网格；宽固定，高随屏幕比例自适应）=====
    const NX = 160;
    let NY = 160;
    let u: Float32Array;
    let uPrev: Float32Array;
    let simBytes: Uint8Array;

    function allocSim() {
      NY = Math.max(90, Math.min(288, Math.round((NX * H) / W)));
      u = new Float32Array(NX * NY);
      uPrev = new Float32Array(NX * NY);
      simBytes = new Uint8Array(NX * NY);
      simBytes.fill(128);
    }

    function drop(gx: number, gy: number, radius: number, strength: number) {
      const r2 = radius * radius;
      const x0 = Math.max(1, Math.floor(gx - radius));
      const x1 = Math.min(NX - 2, Math.ceil(gx + radius));
      const y0 = Math.max(1, Math.floor(gy - radius));
      const y1 = Math.min(NY - 2, Math.ceil(gy + radius));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dx = x - gx;
          const dy = y - gy;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const k = Math.cos((Math.sqrt(d2) / radius) * Math.PI * 0.5);
            u[y * NX + x] += strength * k * k;
          }
        }
      }
    }

    function stepWater() {
      const damp = 0.979;
      for (let y = 1; y < NY - 1; y++) {
        const row = y * NX;
        for (let x = 1; x < NX - 1; x++) {
          const i = row + x;
          const v =
            (u[i - 1] + u[i + 1] + u[i - NX] + u[i + NX]) * 0.5 - uPrev[i];
          uPrev[i] = v * damp;
        }
      }
      const t = u;
      u = uPrev;
      uPrev = t;
    }

    function packSim() {
      for (let i = 0; i < u.length; i++) {
        const v = 128 + u[i] * 26;
        simBytes[i] = v < 1 ? 1 : v > 254 ? 254 : v;
      }
    }

    // ===== WebGL：照片 + 折射 + 高光 =====
    const VSH = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

    // 去掉了参考页里针对其照片的花朵漩涡，只保留通用的波纹折射 + 光影
    const FSH = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uPhoto;
uniform sampler2D uSim;
uniform vec2  uTexel;   // sim texel size
uniform vec2  uFrac;    // cover-crop fractions
uniform float uRefr;
uniform float uLight;
uniform float uTime;

float h(vec2 p){ return texture2D(uSim, p).r - 0.5019608; }

void main(){
  vec2 e = uTexel;
  float hl = h(vUv - vec2(e.x, 0.0));
  float hr = h(vUv + vec2(e.x, 0.0));
  float ht = h(vUv - vec2(0.0, e.y));
  float hb = h(vUv + vec2(0.0, e.y));
  vec2 grad = vec2(hr - hl, hb - ht);

  vec2 puv = (vUv - 0.5) * uFrac + 0.5;
  puv += grad * uRefr;
  puv = clamp(puv, 0.002, 0.998);
  vec3 col = texture2D(uPhoto, puv).rgb;

  // 漫反射涟漪光影（光源在左上）
  float light = (grad.x + grad.y) * 2.4;
  col += light * vec3(1.0, 0.98, 0.92);

  // 波峰上的高光闪烁
  float spec = max(0.0, light - 0.045) * 5.5;
  col += spec * vec3(1.0, 1.0, 0.96);

  // 缓慢漂移的日晕带
  float band = sin(dot(vUv, vec2(1.3, 1.0)) * 2.6 - uTime * 0.2);
  col += smoothstep(0.78, 1.0, band) * 0.065 * uLight;

  // 游走的一小片阳光
  vec2 sc = vec2(0.5 + 0.22 * cos(uTime * 0.07), 0.36 + 0.18 * sin(uTime * 0.09));
  float pool = 1.0 - smoothstep(0.0, 0.55, distance(vUv * vec2(1.0, 1.35), sc * vec2(1.0, 1.35)));
  col += pool * 0.055 * uLight;

  gl_FragColor = vec4(col, 1.0);
}`;

    let prog: WebGLProgram;
    let texPhoto: WebGLTexture;
    let texSim: WebGLTexture | null = null;
    let uni: Record<string, WebGLUniformLocation | null> = {};
    let photoW = 1;
    let photoH = 1;
    let glReady = false;

    function makeShader(type: number, src: string) {
      const s = GL.createShader(type);
      if (!s) throw new Error("createShader failed");
      GL.shaderSource(s, src);
      GL.compileShader(s);
      if (!GL.getShaderParameter(s, GL.COMPILE_STATUS)) {
        throw new Error(GL.getShaderInfoLog(s) || "shader compile failed");
      }
      return s;
    }

    function initGL() {
      prog = GL.createProgram()!;
      GL.attachShader(prog, makeShader(GL.VERTEX_SHADER, VSH));
      GL.attachShader(prog, makeShader(GL.FRAGMENT_SHADER, FSH));
      GL.linkProgram(prog);
      if (!GL.getProgramParameter(prog, GL.LINK_STATUS)) {
        throw new Error(GL.getProgramInfoLog(prog) || "link failed");
      }
      GL.useProgram(prog);

      const buf = GL.createBuffer();
      GL.bindBuffer(GL.ARRAY_BUFFER, buf);
      GL.bufferData(
        GL.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        GL.STATIC_DRAW,
      );
      const loc = GL.getAttribLocation(prog, "aPos");
      GL.enableVertexAttribArray(loc);
      GL.vertexAttribPointer(loc, 2, GL.FLOAT, false, 0, 0);

      for (const n of [
        "uPhoto",
        "uSim",
        "uTexel",
        "uFrac",
        "uRefr",
        "uLight",
        "uTime",
      ]) {
        uni[n] = GL.getUniformLocation(prog, n);
      }
      GL.uniform1i(uni.uPhoto, 0);
      GL.uniform1i(uni.uSim, 1);
      GL.pixelStorei(GL.UNPACK_ALIGNMENT, 1);
    }

    function setupPhotoTexture(img: HTMLImageElement) {
      photoW = img.naturalWidth;
      photoH = img.naturalHeight;
      texPhoto = GL.createTexture()!;
      GL.activeTexture(GL.TEXTURE0);
      GL.bindTexture(GL.TEXTURE_2D, texPhoto);
      GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, GL.RGB, GL.UNSIGNED_BYTE, img);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    }

    function setupSimTexture() {
      if (texSim) GL.deleteTexture(texSim);
      texSim = GL.createTexture();
      GL.activeTexture(GL.TEXTURE1);
      GL.bindTexture(GL.TEXTURE_2D, texSim);
      GL.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL.LUMINANCE,
        NX,
        NY,
        0,
        GL.LUMINANCE,
        GL.UNSIGNED_BYTE,
        simBytes,
      );
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    }

    function updateCover() {
      const s = Math.max(W / photoW, H / photoH);
      const coverFx = W / (s * photoW);
      const coverFy = H / (s * photoH);
      GL.uniform2f(uni.uFrac, coverFx, coverFy);
      GL.uniform2f(uni.uTexel, 1 / NX, 1 / NY);
    }

    // ===== 闪光（2D 覆盖层）=====
    const sparkles: Sparkle[] = [];

    function addSparkle(px: number, py: number, big: boolean) {
      const base = Math.max(1, Math.min(W, H) * 0.0042);
      sparkles.push({
        x: px,
        y: py,
        life: 0,
        max: 0.5 + Math.random() * (big ? 1.1 : 0.8),
        size: base * ((big ? 1.6 : 1) + Math.random() * (big ? 2.2 : 1.4)),
        rot: Math.random() * Math.PI,
        vy: -(2 + Math.random() * 5),
        warm: Math.random() < 0.3,
        iri: Math.random() < 0.22,
      });
    }

    function burst(px: number, py: number, n: number) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * Math.min(W, H) * 0.06;
        addSparkle(px + Math.cos(a) * r, py + Math.sin(a) * r * 0.8, true);
      }
    }

    function spawnAmbient(dt: number) {
      let n = 0.8 * 30 * dt;
      while (n > 0) {
        if (Math.random() < n) {
          addSparkle(Math.random() * W, Math.random() * H, false);
        }
        n -= 1;
      }
    }

    function updateDrawSparkles(dt: number, t: number) {
      CTX.save();
      CTX.globalCompositeOperation = "lighter";
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.life += dt;
        if (s.life > s.max) {
          sparkles.splice(i, 1);
          continue;
        }
        const k = s.life / s.max;
        const al = Math.sin(k * Math.PI);
        const y = s.y + s.vy * s.life;
        const sz = s.size * (0.6 + 0.4 * al);
        CTX.save();
        CTX.translate(s.x, y);
        CTX.rotate(s.rot + k * 0.7);
        let g0: CanvasGradient;
        if (s.iri) {
          const hue = (t * 40 + s.rot * 90) % 360;
          g0 = CTX.createRadialGradient(0, 0, 0, 0, 0, sz * 2.2);
          g0.addColorStop(0, `hsla(${hue},85%,90%,${0.85 * al})`);
          g0.addColorStop(1, `hsla(${hue},85%,90%,0)`);
        } else {
          const col = s.warm ? "255,240,205" : "255,255,255";
          g0 = CTX.createRadialGradient(0, 0, 0, 0, 0, sz * 2.2);
          g0.addColorStop(0, `rgba(${col},${0.85 * al})`);
          g0.addColorStop(1, `rgba(${col},0)`);
        }
        CTX.fillStyle = g0;
        CTX.beginPath();
        CTX.arc(0, 0, sz * 2.2, 0, Math.PI * 2);
        CTX.fill();
        CTX.strokeStyle = `rgba(255,255,255,${al})`;
        CTX.lineWidth = 1;
        CTX.lineCap = "round";
        CTX.beginPath();
        CTX.moveTo(-sz * 1.9, 0);
        CTX.lineTo(sz * 1.9, 0);
        CTX.moveTo(0, -sz * 1.9);
        CTX.lineTo(0, sz * 1.9);
        CTX.stroke();
        CTX.restore();
      }
      CTX.restore();
    }

    // ===== 布局 =====
    function layout() {
      // 容器放在 <ViewTransition> 里时，fixed 的包含块可能被 view-transition-name 劫持，
      // getBoundingClientRect()/clientWidth 会拿到错值。直接用视口尺寸与坐标，
      // 保证波场和点击坐标始终正确（与 FishSchool 同一套可靠做法）。
      W = window.innerWidth || document.documentElement.clientWidth || 1440;
      H = window.innerHeight || document.documentElement.clientHeight || 900;
      GLCV.width = W * DPR;
      GLCV.height = H * DPR;
      FXCV.width = W * DPR;
      FXCV.height = H * DPR;
      CTX.setTransform(DPR, 0, 0, DPR, 0, 0);
      allocSim();
      if (glReady) {
        GL.viewport(0, 0, GLCV.width, GLCV.height);
        setupSimTexture();
        updateCover();
      }
    }

    // ===== 输入：鼠标移动 = 小涟漪，点击 = 大涟漪 + 闪光 =====
    let lastMx = -1;
    let lastMy = -1;

    function touchWater(clientX: number, clientY: number, big: boolean) {
      // 容器固定铺满视口（top:0/left:0 + 100vw×100vh），clientX/clientY 本身就是容器坐标。
      // 不再依赖 getBoundingClientRect()，避免 fixed 被 ViewTransition 劫持后坐标全错。
      const px = clientX;
      const py = clientY;
      if (px < 0 || px >= W || py < 0 || py >= H) return;
      const gx = (px / W) * NX;
      const gy = (py / H) * NY;
      if (big) {
        drop(gx, gy, 6, 2.2);
        burst(px, py, 20);
      } else {
        drop(gx, gy, 2.4, 0.45);
      }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // 触摸滚动时不连续滴落，避免打断滚动
      if (lastMx >= 0) {
        const dist = Math.hypot(e.clientX - lastMx, e.clientY - lastMy);
        if (dist > 2) touchWater(e.clientX, e.clientY, false);
      }
      lastMx = e.clientX;
      lastMy = e.clientY;
    };
    const onDown = (e: PointerEvent) => touchWater(e.clientX, e.clientY, true);
    const onLeave = () => {
      lastMx = -1;
      lastMy = -1;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(layout);
    ro.observe(CONTAINER);

    // ===== 主循环 =====
    let raf = 0;
    let lastT = performance.now();
    let breathT = 0;

    function frame(now: number) {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const t = now / 1000;

      // 环境里的轻微「呼吸」：随机落几滴水，让水面永远有细微波纹
      breathT -= dt;
      if (breathT <= 0) {
        breathT = 0.4 + Math.random() * 1.3;
        drop(2 + Math.random() * (NX - 4), 2 + Math.random() * (NY - 4), 2, 0.14);
      }

      stepWater();
      packSim();

      GL.activeTexture(GL.TEXTURE1);
      GL.bindTexture(GL.TEXTURE_2D, texSim);
      GL.texSubImage2D(
        GL.TEXTURE_2D,
        0,
        0,
        0,
        NX,
        NY,
        GL.LUMINANCE,
        GL.UNSIGNED_BYTE,
        simBytes,
      );
      GL.uniform1f(uni.uRefr, 0.42);
      GL.uniform1f(uni.uLight, 1);
      GL.uniform1f(uni.uTime, t);
      GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);

      CTX.clearRect(0, 0, W, H);
      spawnAmbient(dt);
      updateDrawSparkles(dt, t);

      raf = requestAnimationFrame(frame);
    }

    // ===== 启动 =====
    const img = new Image();
    img.onload = () => {
      initGL();
      setupPhotoTexture(img);
      glReady = true;
      layout();
      GL.viewport(0, 0, GLCV.width, GLCV.height);
      raf = requestAnimationFrame(frame);
    };
    img.src = photo;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      // 反复进出本页会不断新建 WebGL 上下文，浏览器对同时存活的上限很低，
      // 耗尽后 getContext 返回 null、涟漪永久失效。真正离开页面时才释放。
      // Strict Mode 的「假卸载」不会把 canvas 移出 DOM（isConnected 仍 true）→ 跳过；
      // 真实卸载时 canvas 已脱离 DOM → 释放。同步 + rAF + setTimeout 三重兜底，
      // 避免页面转场期间 rAF 不触发，导致上下文迟迟不释放、慢慢耗尽。
      const release = () => {
        if (!GLCV.isConnected) {
          GL.getExtension("WEBGL_lose_context")?.loseContext();
        }
      };
      release();
      requestAnimationFrame(release);
      setTimeout(release, 120);
    };
  }, [photo]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none ${className}`}
      style={{
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        filter: saturate !== 1 ? `saturate(${saturate})` : undefined,
      }}
      aria-hidden="true"
    >
      {/* 静态照片兜底：无 WebGL / 减弱动态效果 / 图片加载完成前，始终有背景 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${photo}")` }}
      />
      <canvas ref={glRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={fxRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
