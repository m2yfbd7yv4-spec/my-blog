"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import type { ActionState } from "@/lib/types";

// 保存公告：有 id 是更新，没 id 是新增；成功后跳回公告管理页
export async function saveAnnouncement(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title) return { error: "请填写公告标题" };
  if (!content) return { error: "请填写公告内容" };
  if (title.length > 200) return { error: "公告标题过长（最多 200 字）" };
  if (content.length > 2000) return { error: "公告内容过长（最多 2000 字）" };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase
      .from("announcements")
      .update({ title, content })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("announcements")
      .insert({ title, content });
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  redirect("/admin/announcements");
}

// 删除公告
export async function deleteAnnouncement(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id);

  revalidatePath("/");
  redirect("/admin/announcements");
}
