import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TagForm } from "./TagForm";
import type { Tag } from "@/lib/types";

export default async function TagEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const id = typeof sp.id === "string" ? sp.id : undefined;

  const supabase = await createClient();

  let tag: Tag | null = null;
  let initialPostIds: string[] = [];

  if (id) {
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("id", id)
      .single();
    if (!data) notFound();
    tag = data as Tag;

    const { data: links } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", id);
    initialPostIds = (links ?? []).map((l) => l.post_id);
  }

  // 已发布文章（供勾选打标签）
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <TagForm
      initial={tag}
      posts={
        (posts as {
          id: string;
          title: string;
          category: string;
          published_at: string | null;
        }[]) ?? []
      }
      initialPostIds={initialPostIds}
    />
  );
}
