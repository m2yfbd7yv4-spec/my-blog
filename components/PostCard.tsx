import Link from "next/link";
import { formatDate } from "@/lib/utils";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
  };
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-6 transition hover:shadow-md"
    >
      <h2 className="text-xl font-semibold mb-2 group-hover:text-indigo-600">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
      )}
      <time className="block mt-3 text-sm text-gray-400">
        {formatDate(post.published_at)}
      </time>
    </Link>
  );
}
