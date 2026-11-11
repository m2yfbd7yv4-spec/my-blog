"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import type { ActionState } from "@/lib/types";

// 屏蔽 IP（整站拦截）
export async function banIp(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const ip = String(formData.get("ip") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!ip) return { error: "请填写 IP 地址" };
  if (ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
    return { error: "这是本机/无效地址，不能屏蔽" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("banned_ips")
    .insert({ ip, reason: reason || null });

  if (error) {
    return {
      error: /duplicate/i.test(error.message)
        ? "这个 IP 已经在屏蔽列表里了"
        : error.message,
    };
  }

  revalidatePath("/admin/visitors");
  redirect("/admin/visitors/bans");
}

// 解除 IP 屏蔽
export async function unbanIp(formData: FormData): Promise<void> {
  const user = await getAdminUser();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("banned_ips").delete().eq("id", id);
  revalidatePath("/admin/visitors");
}

// 拉黑用户（禁止评论/留言）
export async function banUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const userId = String(formData.get("user_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!userId) return { error: "请选择要拉黑的用户" };
  if (userId === user.id) return { error: "不能拉黑自己" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("banned_users")
    .insert({ user_id: userId, reason: reason || null });

  if (error) {
    return {
      error: /duplicate/i.test(error.message)
        ? "这个用户已经被拉黑了"
        : error.message,
    };
  }

  revalidatePath("/admin/visitors");
  redirect("/admin/visitors/bans");
}

// 解除用户拉黑
export async function unbanUser(formData: FormData): Promise<void> {
  const user = await getAdminUser();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("banned_users").delete().eq("id", id);
  revalidatePath("/admin/visitors");
}
