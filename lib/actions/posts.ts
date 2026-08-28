"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import { slugify } from "@/lib/utils";
import { DEFAULT_CATEGORY } from "@/lib/categories";
import type { ActionState } from "@/lib/types";

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

  const supabase = await createClient();
  const base = {
    title,
    slug,
    excerpt: excerpt || null,
    cover_image: coverImage || null,
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
