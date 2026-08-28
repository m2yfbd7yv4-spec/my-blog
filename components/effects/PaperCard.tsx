import type { ReactNode } from "react";

// 截图纸卡：直接用桌面截图作为纸卡背景，毛边用 CSS mask（public/paper-mask.svg）裁出。
// 背景用 background-size: cover 铺满不变形；毛边遮罩保留不规则边缘。
// floating：是否启用「阴影 + 悬停上浮」的悬浮效果（首页最新文章用，归档不用）。
export function PaperCard({
  children,
  floating = false,
}: {
  children: ReactNode;
  floating?: boolean;
}) {
  return (
    <div className={`relative${floating ? " paper-card-root" : ""}`}>
      <div className="paper-texture-bg" aria-hidden="true" />
      <div className="relative z-10 p-5">{children}</div>
    </div>
  );
}
