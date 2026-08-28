"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

// 滚动旋转：随页面滚动，包裹的元素缓缓旋转（旋转角度 = 滚动距离 × speed）。
// 独立组件，零依赖；尊重「减弱动态效果」设置。
type ScrollRotateProps = {
  children: ReactNode;
  /** 每滚动 1px 旋转的度数 */
  speed?: number;
  className?: string;
};

export function ScrollRotate({
  children,
  speed = 0.25,
  className = "",
}: ScrollRotateProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      el.style.transform = `rotate(${(window.scrollY * speed).toFixed(2)}deg)`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
