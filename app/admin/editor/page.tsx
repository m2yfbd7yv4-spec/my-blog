import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditorForm } from "./EditorForm";
import type { Post } from "@/lib/types";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const slug = typeof sp.slug === "string" ? sp.slug : undefined;

  let post: Post | null = null;
  if (slug) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single();
    if (!data) notFound();
    post = data as Post;
  }

  return <EditorForm initialPost={post} />;
}
