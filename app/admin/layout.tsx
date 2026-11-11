import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 后台统一鉴权：未登录跳登录页，非管理员跳首页
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // 未读通知数（通知表还没跑迁移时兜底为 0，不阻断后台）
  let unread = 0;
  try {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    unread = count ?? 0;
  } catch {
    unread = 0;
  }

  return (
    <>
      {/* 后台背景：桌面 1547 图铺满视口 */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/media/admin-bg.jpg")' }}
      />
      {/* 通知铃铛 */}
      <Link
        href="/admin/notifications"
        className="fixed right-4 top-4 z-20 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
      >
        通知{unread > 0 ? `（${unread}）` : ""}
      </Link>
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-8">
        {children}
      </div>
    </>
  );
}
