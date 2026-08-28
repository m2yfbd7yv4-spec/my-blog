"use client";

import { useEffect, useRef, useState } from "react";

// 淡粉水彩蔓延背景：多块错位叠加的淡粉水彩，边缘不规则、有炸毛感，铺在留言板区块底部。
// 进入视口时从中心向外「蔓延」展开，离开时收回，下次进入重新播放。
// 内联 SVG + feTurbulence/feDisplacementMap 生成不规则毛边，零外链、过 CSP。
export function WatercolorWash() {
  const ref = useRef<HTMLDivElement>(null);
  const [spread, setSpread] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSpread(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setSpread(entry.isIntersecting));
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`watercolor-wash ${spread ? "spread" : ""}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          {/* 底层：浅粉大块，最淡 */}
          <radialGradient
            id="wcPink1"
            gradientUnits="userSpaceOnUse"
            cx="50"
            cy="48"
            r="46"
          >
            <stop offset="0%" stopColor="#f1c8c0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#e8b2ab" stopOpacity="0" />
          </radialGradient>
          {/* 中层：玫瑰粉 */}
          <radialGradient
            id="wcPink2"
            gradientUnits="userSpaceOnUse"
            cx="46"
            cy="52"
            r="34"
          >
            <stop offset="0%" stopColor="#e3a6a2" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#d98f92" stopOpacity="0" />
          </radialGradient>
          {/* 顶层：深粉核心，最浓 */}
          <radialGradient
            id="wcPink3"
            gradientUnits="userSpaceOnUse"
            cx="54"
            cy="45"
            r="24"
          >
            <stop offset="0%" stopColor="#d18488" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c16e75" stopOpacity="0" />
          </radialGradient>

          {/* 三级毛边过滤器：低频大波浪 + 高频细碎炸毛，逐层加强 */}
          <filter id="wcF1" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="3"
              seed="4"
              result="n1"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.11"
              numOctaves="2"
              seed="21"
              result="n2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n1"
              scale="32"
              xChannelSelector="R"
              yChannelSelector="G"
              result="d1"
            />
            <feDisplacementMap
              in="d1"
              in2="n2"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="wcF2" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.024"
              numOctaves="3"
              seed="9"
              result="n1"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.14"
              numOctaves="3"
              seed="37"
              result="n2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n1"
              scale="40"
              xChannelSelector="R"
              yChannelSelector="G"
              result="d1"
            />
            <feDisplacementMap
              in="d1"
              in2="n2"
              scale="24"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="wcF3" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.028"
              numOctaves="4"
              seed="15"
              result="n1"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.18"
              numOctaves="3"
              seed="52"
              result="n2"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n1"
              scale="42"
              xChannelSelector="R"
              yChannelSelector="G"
              result="d1"
            />
            <feDisplacementMap
              in="d1"
              in2="n2"
              scale="26"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* 三层错位叠加制造层次感；各自独立位移，毛边互相交错 */}
        <g filter="url(#wcF1)">
          <rect x="-25" y="-25" width="150" height="150" fill="url(#wcPink1)" />
        </g>
        <g filter="url(#wcF2)">
          <rect x="-25" y="-25" width="150" height="150" fill="url(#wcPink2)" />
        </g>
        <g filter="url(#wcF3)">
          <rect x="-25" y="-25" width="150" height="150" fill="url(#wcPink3)" />
        </g>
      </svg>
    </div>
  );
}
