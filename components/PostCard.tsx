import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { postMetaLabel } from "@/lib/categories";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    published_at: string | null;
    // 归档方格视图会带分类/合集，首页精简对象不传则无徽章
    category?: string;
    collections?: { id: string; name: string }[];
  };
  // 归档方格视图传了 onOpen：点卡片弹浮层，而不是跳转到独立文章页
  onOpen?: () => void;
};

export function PostCard({ post, onOpen }: PostCardProps) {
  const inner = (
    <>
      {post.cover_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full mb-4 object-cover"
        />
      )}
      <h2 className="font-display text-lg md:text-xl leading-snug text-[#241209] transition-colors group-hover:text-[#5a1f1c]">
        {post.title}
      </h2>
      {post.category && (
        <p className="mt-1.5 text-xs tracking-[0.1em] text-[#b3aea8]">
          {postMetaLabel(post.category, post.collections)}
        </p>
      )}
      <time className="mt-2 block text-xs tracking-[0.15em] text-[#7a3f2a]">
        {formatDate(post.published_at)}
      </time>
      {post.excerpt && (
        <p className="mt-2 text-sm text-[#46281a] line-clamp-3">{post.excerpt}</p>
      )}
    </>
  );

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className="group block w-full text-left">
        {inner}
      </button>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      {inner}
    </Link>
  );
}
