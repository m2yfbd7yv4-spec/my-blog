"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// 滚动浮现：元素每次进入视口时淡入 + 上浮，离开后再进入会重新播放，可设延迟制造错落出现。
// 尊重「减弱动态效果」设置。
type ScrollRevealProps = {
  children: ReactNode;
  /** 延迟毫秒，用于让多个元素依次出现 */
  delay?: number;
  className?: string;
};

export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 进入视口 → 淡入；离开视口 → 复位，下次进入重新淡入
          setVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
