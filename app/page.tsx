import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">最新文章</h1>
      {posts && posts.length > 0 ? (
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500">
          还没有文章。
        </div>
      )}
    </div>
  );
}
