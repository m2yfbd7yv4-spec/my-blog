import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentSection } from "@/components/CommentSection";
import { formatDate } from "@/lib/utils";
import type { CommentDisplay } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  return { title: post?.title ?? "文章" };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    notFound();
  }

  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, created_at, profiles(username)")
    .eq("post_id", post.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .returns<CommentDisplay[]>();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <time className="block text-sm text-gray-400 mb-8">
        {formatDate(post.published_at)}
      </time>

      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full rounded-lg mb-8"
        />
      )}

      <MarkdownRenderer content={post.content} />

      <CommentSection
        postId={post.id}
        isLoggedIn={!!user}
        comments={comments ?? []}
      />
    </article>
  );
}
