"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/server-auth";
import { slugify } from "@/lib/utils";
import { DEFAULT_CATEGORY } from "@/lib/categories";
import type { ActionState } from "@/lib/types";

const MAX_COVER_BYTES = 8 * 1024 * 1024; // 封面图上限 8MB

export async function savePost(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const category =
    String(formData.get("category") ?? "").trim() || DEFAULT_CATEGORY;
  const action = String(formData.get("action") ?? "draft");

  if (!title) return { error: "请填写标题" };
  if (!content) return { error: "请填写正文" };

  const status = action === "publish" ? "published" : "draft";
  if (!slug) slug = slugify(title);

  // 封面图：优先用从访达上传的文件，否则用填写的链接
  let finalCoverImage = coverImage;
  const coverFile = formData.get("coverImageFile");
  if (coverFile instanceof File && coverFile.size > 0) {
    if (!coverFile.type.startsWith("image/")) {
      return { error: "封面图只能是图片文件" };
    }
    if (coverFile.size > MAX_COVER_BYTES) {
      return { error: "封面图过大（最多 8MB）" };
    }
    const ext = (coverFile.name.split(".").pop() || "jpg").toLowerCase();
    if (!["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return {
        error:
          ext === "heic" || ext === "heif"
            ? "封面图是 HEIC 格式，浏览器打不开。请先转成 JPG 再上传。"
            : "封面图格式不支持，请用 JPG / PNG / WebP / GIF。",
      };
    }
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const admin = createAdminClient();
    const { error: upErr } = await admin.storage
      .from("posts")
      .upload(path, coverFile, { contentType: coverFile.type });
    if (upErr) return { error: "封面图上传失败，请稍后再试" };
    finalCoverImage = admin.storage
      .from("posts")
      .getPublicUrl(path).data.publicUrl;
  }

  const supabase = await createClient();
  const base = {
    title,
    slug,
    excerpt: excerpt || null,
    cover_image: finalCoverImage || null,
    content,
    category,
    status,
  };

  if (id) {
    // 更新：若是首次发布（原来是草稿），记录发布时间
    let publishedAt;
    if (status === "published") {
      const { data: existing } = await supabase
        .from("posts")
        .select("published_at")
        .eq("id", id)
        .single();
      if (!existing?.published_at) {
        publishedAt = new Date().toISOString();
      }
    }
    const { error } = await supabase
      .from("posts")
      .update(publishedAt ? { ...base, published_at: publishedAt } : base)
      .eq("id", id);
    if (error) {
      if (error.code === "23505") {
        return { error: "这个网址(slug)已被占用，请换一个" };
      }
      return { error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("posts")
      .insert({
        ...base,
        author_id: user.id,
        ...(status === "published" ? { published_at: new Date().toISOString() } : {}),
      });
    if (error) {
      if (error.code === "23505") {
        return { error: "这个网址(slug)已被占用，请换一个" };
      }
      return { error: error.message };
    }
  }

  revalidatePath("/");
  redirect("/admin");
}

export async function deletePost(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", id);

  revalidatePath("/");
  redirect("/admin");
}
