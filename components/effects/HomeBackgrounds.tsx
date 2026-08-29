"use client";

import { usePathname } from "next/navigation";
import { Stars } from "@/components/effects/Stars";
import { SunScatter } from "@/components/effects/SunScatter";

// 首页专用背景层：只在首页渲染，铺满「正文 + 页脚」整段高度。
// 抽到 layout 里，是为了让第二段酒红背景能一直延伸到页面底部的页脚处。
export function HomeBackgrounds() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <>
      {/* 首页静态底：顶部暖色 + 下半段酒红 */}
      <div className="home-bg" />
      <div className="home-bg-2" />
      {/* 发光星星：暖白/金的小星星撒满整屏，一闪一闪，随滚动淡出 */}
      <Stars />
      {/* 酒红区左右两侧：散落的太阳（漂浮 + 光晕） */}
      <SunScatter />
    </>
  );
}
