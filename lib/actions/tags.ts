"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import type { ActionState } from "@/lib/types";

// 保存标签：有 id 是更新，没 id 是新增；整体替换该标签关联的文章
export async function saveTag(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const postIds = formData.getAll("post_ids").map((v) => String(v));

  if (!name) return { error: "请填写标签名称" };
  if (name.length > 30) return { error: "标签名称过长（最多 30 字）" };

  const supabase = await createClient();

  let tagId = id;
  if (id) {
    const { error } = await supabase.from("tags").update({ name }).eq("id", id);
    if (error) {
      return {
        error: /duplicate/i.test(error.message)
          ? "这个标签已经存在了"
          : error.message,
      };
    }
  } else {
    const { data, error } = await supabase
      .from("tags")
      .insert({ name })
      .select("id")
      .single();
    if (error) {
      return {
        error: /duplicate/i.test(error.message)
          ? "这个标签已经存在了"
          : error.message,
      };
    }
    tagId = data.id;
  }

  // 整体替换关联
  await supabase.from("post_tags").delete().eq("tag_id", tagId);
  if (postIds.length > 0) {
    const { error } = await supabase
      .from("post_tags")
      .insert(postIds.map((post_id) => ({ tag_id: tagId, post_id })));
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  redirect("/admin/tags");
}

// 删除标签（关联行由 on delete cascade 一并删除，文章不受影响）
export async function deleteTag(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", id);

  revalidatePath("/");
  redirect("/admin/tags");
}
