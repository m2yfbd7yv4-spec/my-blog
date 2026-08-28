"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import type { ActionState } from "@/lib/types";

// 提交留言板留言（需登录、30 秒限频、审核通过后显示）
export async function submitGuestbookMessage(
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
    return { error: "请先登录后再留言" };
  }

  const content = String(formData.get("content") ?? "").trim();

  if (!content) return { error: "留言内容不能为空" };
  if (content.length > 200) return { error: "留言过长（最多 200 字）" };

  // 频率限制：同一用户 30 秒内最多发一条
  const { data: recent } = await supabase
    .from("guestbook_messages")
    .select("created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (recent && recent.length > 0) {
    const last = new Date(recent[0].created_at).getTime();
    if (Date.now() - last < 30_000) {
      return { error: "留言太频繁，请稍后再试" };
    }
  }

  const { error } = await supabase
    .from("guestbook_messages")
    .insert({ author_id: user.id, content, status: "pending" });

  if (error) {
    return { error: "留言提交失败，请稍后再试" };
  }

  revalidatePath("/guestbook");
  return { success: "留言已提交，审核通过后会飘上屏幕" };
}

// 管理员审核留言板留言（通过 / 拒绝 / 删除）
export async function moderateGuestbookMessage(
  formData: FormData,
): Promise<void> {
  const user = await getAdminUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  const supabase = await createClient();

  if (action === "delete") {
    await supabase.from("guestbook_messages").delete().eq("id", id);
  } else if (action === "approve") {
    await supabase
      .from("guestbook_messages")
      .update({ status: "approved" })
      .eq("id", id);
  } else if (action === "reject") {
    await supabase
      .from("guestbook_messages")
      .update({ status: "rejected" })
      .eq("id", id);
  }

  revalidatePath("/admin/comments");
  revalidatePath("/guestbook");
}
