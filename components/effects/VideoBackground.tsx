"use client";

import { useEffect, useRef } from "react";

// 视频背景：铺满全屏、拉低透明度，保留影片自身的动态效果。
// 视频已离线处理成「正放+倒放」无缝素材（首尾是同一帧），用原生 loop 全程正放，
// 不依赖浏览器倒放，播放顺滑、无卡顿、无接缝。
export function VideoBackground({
  src,
  opacity = 1,
}: {
  src: string;
  opacity?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React 的 muted 属性有时不落到 DOM，导致自动播放被拦截，这里强制补一次
    video.muted = true;
    video.defaultMuted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    const p = video.play();
    if (p !== undefined) p.catch(() => {});
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity }}
    >
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={src}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
