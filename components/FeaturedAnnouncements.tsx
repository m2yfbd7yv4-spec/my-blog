import Link from "next/link";
import { PaperCard } from "@/components/effects/PaperCard";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { Stars } from "@/components/effects/Stars";
import { formatDate } from "@/lib/utils";

type FeaturedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
};

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

// 首页「推荐文章 + 公告」横带：暖棕背景图 + 上下渐变过渡，桌面左右并排、手机上下叠
export function FeaturedAnnouncements({
  featured,
  announcements,
}: {
  featured: FeaturedPost[];
  announcements: AnnouncementItem[];
}) {
  const headerCls = "text-xs uppercase tracking-[0.3em] font-bold text-[#c0a493]";
  const lineCls = "h-px flex-1 bg-[#8a5a4e]";

  return (
    <section className="relative">
      {/* 横带背景：IMG_1606 + 和 hero 一样的闪烁星星，上下渐变淡出融入四周 */}
      <div className="featured-band-bg" aria-hidden>
        <Stars contained />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-10">
          {/* 推荐文章 */}
          <div>
            <div className="flex items-baseline gap-4 mb-8">
              <span className={headerCls}>推薦文章</span>
              <span className={lineCls} />
            </div>
            {featured.length > 0 ? (
              <div className="flex flex-col gap-6">
                {featured.map((post) => (
                  <ScrollReveal key={post.id}>
                    <PaperCard floating>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block"
                      >
                        <h3 className="font-display text-lg leading-snug text-[#241209] transition-colors group-hover:text-[#5a1f1c]">
                          {post.title}
                        </h3>
                        <time className="mt-2 block text-xs tracking-[0.15em] text-[#7a3f2a]">
                          {formatDate(post.published_at)}
                        </time>
                        {post.excerpt && (
                          <p className="mt-2 text-sm text-[#46281a] line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                      </Link>
                    </PaperCard>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <PaperCard>
                <p className="text-sm text-[#8a5a4e]">還沒有推薦文章。</p>
              </PaperCard>
            )}
          </div>

          {/* 公告 */}
          <div>
            <div className="flex items-baseline gap-4 mb-8">
              <span className={headerCls}>公告</span>
              <span className={lineCls} />
            </div>
            {announcements.length > 0 ? (
              <div className="flex flex-col gap-6">
                {announcements.map((a) => (
                  <ScrollReveal key={a.id}>
                    <PaperCard>
                      <h3 className="font-display text-lg leading-snug text-[#241209]">
                        {a.title}
                      </h3>
                      <time className="mt-2 block text-xs tracking-[0.15em] text-[#7a3f2a]">
                        {formatDate(a.created_at)}
                      </time>
                      <p className="mt-2 text-sm text-[#46281a] whitespace-pre-wrap">
                        {a.content}
                      </p>
                    </PaperCard>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <PaperCard>
                <p className="text-sm text-[#8a5a4e]">還沒有公告。</p>
              </PaperCard>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
