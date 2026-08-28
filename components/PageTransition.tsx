"use client";

import { ViewTransition } from "react";
import type { ReactNode } from "react";

// 页面转场：跳转时仅淡入淡出（去掉放大纵深）
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-fade" exit="page-fade">
      {children}
    </ViewTransition>
  );
}
