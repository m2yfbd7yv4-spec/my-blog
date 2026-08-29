"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import type { ActionState } from "@/lib/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 配图上限 5MB

// 添加灵感（仅站长）：可选配图，上传到 Storage 后存公开 URL
export async function addInspiration(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "仅站长可记录灵感" };

  const supabase = await createClient();

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "内容不能为空" };
  if (content.length > 500) return { error: "内容过长（最多 500 字）" };

  // 可选配图：有文件才上传
  let image_url: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) return { error: "只能上传图片文件" };
    if (image.size > MAX_IMAGE_BYTES) return { error: "图片过大（最多 5MB）" };

    const ext = (image.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("inspirations")
      .upload(path, image, { contentType: image.type });
    if (upErr) return { error: "图片上传失败，请稍后再试" };
    image_url = supabase.storage
      .from("inspirations")
      .getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from("inspirations")
    .insert({ author_id: user.id, content, image_url });

  if (error) return { error: "记录失败，请稍后再试" };

  revalidatePath("/inspiration");
  return { success: "已记录" };
}

// 删除灵感（仅站长）
export async function deleteInspiration(formData: FormData): Promise<void> {
  const user = await getAdminUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("inspirations").delete().eq("id", id);
  revalidatePath("/inspiration");
}
