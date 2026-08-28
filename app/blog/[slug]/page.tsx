import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentSection } from "@/components/CommentSection";
import { formatDate } from "@/lib/utils";
import type { CommentDisplay } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";

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
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-16">
      <article>
      <header className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-[#1a1a1a] mb-4">
          {post.title}
        </h1>
        <time className="block text-xs uppercase tracking-[0.25em] text-[#8a8580]">
          {formatDate(post.published_at)}
        </time>
      </header>

      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full mb-12"
        />
      )}

      <MarkdownRenderer content={post.content} />

      <CommentSection
        postId={post.id}
        isLoggedIn={!!user}
        comments={comments ?? []}
      />
      </article>
      </div>
    </PageTransition>
  );
}
