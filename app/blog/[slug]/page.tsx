import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CommentSection } from "@/components/CommentSection";
import { formatDate } from "@/lib/utils";
import type { CommentDisplay } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";
import { FeatureParticles } from "@/components/effects/FeatureParticles";

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

  const article = (
    <article>
      <header className="mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-[#1a1a1a] mb-4">
          {post.title}
        </h1>
        <time className="block text-xs uppercase tracking-[0.25em] text-[#8a8580]">
          {formatDate(post.published_at)}
        </time>
      </header>

      <MarkdownRenderer content={post.content} />

      <CommentSection
        postId={post.id}
        isLoggedIn={!!user}
        comments={comments ?? []}
      />
    </article>
  );

  return (
    <PageTransition>
      <div>
      <div className="post-bg" aria-hidden="true" />
      <FeatureParticles sparkle />
      <div
        className={`panel-rise relative z-10 mx-auto mt-24 mb-16 ${
          post.cover_image ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
      {post.cover_image ? (
        // 有封面图：左侧图片（无面板）+ 右侧文章（有面板 + 评论区）
        <div className="grid grid-cols-1 md:grid-cols-3 md:items-start">
          <div className="relative h-[50vh] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="relative md:col-span-2">
            <div className="ink-panel-bg" aria-hidden="true" />
            <div className="relative z-10 px-6 py-10 md:px-10 md:py-12">
              {article}
            </div>
          </div>
        </div>
      ) : (
        // 无封面图：单栏居中
        <div className="relative">
          <div className="ink-panel-bg" aria-hidden="true" />
          <div className="relative z-10 px-6 py-10 md:px-12 md:py-12">
            {article}
          </div>
        </div>
      )}
      </div>
      </div>
    </PageTransition>
  );
}
