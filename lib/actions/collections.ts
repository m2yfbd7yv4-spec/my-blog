"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import type { ActionState } from "@/lib/types";

// 保存合集：有 id 是更新，没 id 是新增；
// 同时用勾选的文章列表「整体替换」该合集的关联（先清空再插入）。
export async function saveCollection(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const postIds = formData.getAll("post_ids").map((v) => String(v));

  if (!name) return { error: "请填写合集名称" };
  if (name.length > 60) return { error: "合集名称过长（最多 60 字）" };

  const supabase = await createClient();

  let collectionId = id;
  if (id) {
    const { error } = await supabase
      .from("collections")
      .update({ name, description: description || null })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("collections")
      .insert({ name, description: description || null })
      .select("id")
      .single();
    if (error) return { error: error.message };
    collectionId = data.id;
  }

  // 整体替换关联
  await supabase
    .from("collection_posts")
    .delete()
    .eq("collection_id", collectionId);
  if (postIds.length > 0) {
    const { error } = await supabase
      .from("collection_posts")
      .insert(postIds.map((post_id) => ({ collection_id: collectionId, post_id })));
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  redirect("/admin/collections");
}

// 删除合集（关联行由 on delete cascade 一并删除，文章本身不受影响）
export async function deleteCollection(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("collections").delete().eq("id", id);

  revalidatePath("/");
  redirect("/admin/collections");
}
