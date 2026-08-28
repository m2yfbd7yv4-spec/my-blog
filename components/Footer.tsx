"use client";

import { usePathname } from "next/navigation";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "我的博客";

// 页脚：首页时坐落在酒红背景上（浅色文字），其它页维持白底深灰。
export function Footer() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <footer
      className={`relative z-10 border-t py-12 text-center ${
        onHome ? "border-[#8a5a4a]" : "border-[#e8e6e1]"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.3em] ${
          onHome ? "text-[#c0a493]" : "text-[#8a8580]"
        }`}
      >
        {siteName}
      </p>
      <p className={`mt-3 text-xs ${onHome ? "text-[#c0a493]" : "text-[#b3aea8]"}`}>
        © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
