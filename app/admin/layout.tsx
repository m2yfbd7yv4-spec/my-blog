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

  return (
    <>
      {/* 后台背景：桌面 1547 图铺满视口 */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/media/admin-bg.jpg")' }}
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-8">
        {children}
      </div>
    </>
  );
}
