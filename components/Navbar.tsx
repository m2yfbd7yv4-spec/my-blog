import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = data?.role === "admin";
  }

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "我的博客";

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg hover:text-indigo-600">
          {siteName}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-indigo-600">
            首页
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-indigo-600">
              管理后台
            </Link>
          )}
          {user ? (
            <form action={signOut}>
              <button type="submit" className="hover:text-indigo-600">
                退出登录
              </button>
            </form>
          ) : (
            <Link href="/login" className="hover:text-indigo-600">
              登录
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
