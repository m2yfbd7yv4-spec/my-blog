"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";
import { isSubcategoryOf } from "@/lib/journal";
import type { ActionState, JournalCategory } from "@/lib/types";

const VALID_CATEGORIES = ["experience", "knowledge"];
const VALID_SUBCATEGORIES = ["work", "study", "methodology", "resource"];

// 保存行路手记：有 id 是更新，没 id 是新增；成功后跳回行路手记管理页
export async function saveJournalEntry(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const subcategory = String(formData.get("subcategory") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  const publishedAt = String(formData.get("published_at") ?? "").trim();

  if (!title) return { error: "请填写标题" };
  if (!VALID_CATEGORIES.includes(category)) return { error: "请选择分类" };
  if (!VALID_SUBCATEGORIES.includes(subcategory))
    return { error: "请选择子分类" };
  if (!isSubcategoryOf(subcategory, category as JournalCategory))
    return { error: "子分类与分类不匹配" };
  if (!summary) return { error: "请填写一句话摘要" };
  if (!content) return { error: "请填写正文内容" };
  if (title.length > 200) return { error: "标题过长（最多 200 字）" };
  if (summary.length > 500) return { error: "摘要过长（最多 500 字）" };

  const payload = {
    title,
    category,
    subcategory,
    summary,
    content,
    link: link || null,
    published_at: publishedAt
      ? new Date(publishedAt).toISOString()
      : new Date().toISOString(),
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase
      .from("journal_entries")
      .update(payload)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("journal_entries").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  redirect("/admin/journal");
}

// 删除行路手记
export async function deleteJournalEntry(
  _prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAdminUser();
  if (!user) return { error: "无权限" };

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("journal_entries").delete().eq("id", id);

  revalidatePath("/");
  redirect("/admin/journal");
}
