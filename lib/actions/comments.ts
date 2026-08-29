"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import { beijingDayStart } from "@/lib/utils";
import type { ActionState } from "@/lib/types";

export async function submitComment(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 蜜罐字段：正常人看不见，机器人会填；填了就拒绝
  const website = String(formData.get("website") ?? "");
  if (website) {
    return { error: "提交失败，请稍后再试" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "请先登录后再评论" };
  }

  const postId = String(formData.get("postId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!content) return { error: "评论内容不能为空" };
  if (content.length > 500) return { error: "评论过长（最多 500 字）" };

  // 频率限制：同一用户 30 秒内最多发一条
  const { data: recent } = await supabase
    .from("comments")
    .select("created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (recent && recent.length > 0) {
    const last = new Date(recent[0].created_at).getTime();
    if (Date.now() - last < 30_000) {
      return { error: "评论太频繁，请稍后再试" };
    }
  }

  // 每日限额：同一用户每天最多 10 条评论（按北京时间凌晨 12 点重置）
  const startOfDay = beijingDayStart();
  const { count: dailyCount } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .gte("created_at", startOfDay.toISOString());
  if ((dailyCount ?? 0) >= 10) {
    return { error: "今天评论已达上限（每天最多 10 条），明天再来吧" };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, content, status: "pending" });

  if (error) {
    return { error: "评论提交失败，请稍后再试" };
  }

  return { success: "评论已提交，审核通过后会显示" };
}

// 管理员审核评论（通过 / 拒绝 / 删除），用于后台审核页面
export async function moderateComment(formData: FormData): Promise<void> {
  const user = await getAdminUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  const supabase = await createClient();

  if (action === "delete") {
    await supabase.from("comments").delete().eq("id", id);
  } else if (action === "approve") {
    await supabase.from("comments").update({ status: "approved" }).eq("id", id);
  } else if (action === "reject") {
    await supabase.from("comments").update({ status: "rejected" }).eq("id", id);
  }

  revalidatePath("/admin/comments");
  revalidatePath("/");
}
