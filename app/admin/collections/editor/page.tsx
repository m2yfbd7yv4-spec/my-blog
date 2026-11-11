import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CollectionForm } from "./CollectionForm";
import type { Collection } from "@/lib/types";

export default async function CollectionEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const id = typeof sp.id === "string" ? sp.id : undefined;

  const supabase = await createClient();

  let collection: Collection | null = null;
  let initialPostIds: string[] = [];

  if (id) {
    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();
    if (!data) notFound();
    collection = data as Collection;

    const { data: links } = await supabase
      .from("collection_posts")
      .select("post_id")
      .eq("collection_id", id);
    initialPostIds = (links ?? []).map((l) => l.post_id);
  }

  // 已发布文章（供勾选加入合集）
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <CollectionForm
      initial={collection}
      posts={(posts as { id: string; title: string; category: string; published_at: string | null }[]) ?? []}
      initialPostIds={initialPostIds}
    />
  );
}
