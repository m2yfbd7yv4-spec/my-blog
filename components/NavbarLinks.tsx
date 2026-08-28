"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavbarLinksProps = {
  isAdmin: boolean;
  isLoggedIn: boolean;
  signOutAction: () => Promise<void>;
};

// 顶部导航：固定在右上角，不随页面滚动。
// 首页初始在浅色暖图上用深灰字；滚到酒红区后自动切成奶油色字，保证一直可读。
export function NavbarLinks({
  isAdmin,
  isLoggedIn,
  signOutAction,
}: NavbarLinksProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!onHome) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  // 首页且滚过第一屏（进入酒红第二段背景）→ 奶油色；其余场景深灰
  const light = onHome && scrolled;
  const base = light ? "text-[#f4ece4]" : "text-[#504f50]";
  const hover = light ? "hover:text-[#e8b79f]" : "hover:text-[#1a1a1a]";

  return (
    <nav className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-end">
      <div
        className={`pointer-events-auto flex items-center gap-6 text-xs uppercase tracking-[0.15em] transition-colors ${base}`}
      >
        <Link href="/" className={`transition-colors ${hover}`}>
          首页
        </Link>
        <Link href="/#guestbook" className={`transition-colors ${hover}`}>
          留言板
        </Link>
        {isAdmin && (
          <Link href="/admin" className={`transition-colors ${hover}`}>
            管理后台
          </Link>
        )}
        {isLoggedIn ? (
          <form action={signOutAction}>
            <button type="submit" className={`transition-colors ${hover}`}>
              退出登录
            </button>
          </form>
        ) : (
          <Link href="/login" className={`transition-colors ${hover}`}>
            登录
          </Link>
        )}
      </div>
    </nav>
  );
}
