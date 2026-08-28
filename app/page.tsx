import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/PostCard";
import { ScrollRotate } from "@/components/effects/ScrollRotate";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { FeatureParticles } from "@/components/effects/FeatureParticles";
import { WatercolorWash } from "@/components/effects/WatercolorWash";
import { PaperCard } from "@/components/effects/PaperCard";
import { GuestbookList } from "@/components/effects/GuestbookList";
import { GuestbookForm } from "@/components/GuestbookForm";
import type { GuestbookMessageDisplay } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";
import { FishSchool } from "@/components/effects/FishSchool";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "我的博客";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, cover_image, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const { data: messages } = await supabase
    .from("guestbook_messages")
    .select("id, content, created_at, profiles(username)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .returns<GuestbookMessageDisplay[]>();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ==== ⚠️ 临时测试数据：没有真实文章时，用这些假数据预览瀑布流效果（测试完删除）====
  const MOCK_POSTS = [
    {
      id: "mock-1",
      title: "山間午後的咖啡香",
      slug: "coffee",
      excerpt: "第一次在海拔兩千米的茶園旁喝到手沖，山嵐和咖啡香混在一起。",
      cover_image: "/test/cover-1.png",
      published_at: "2026-08-26T10:00:00Z",
    },
    {
      id: "mock-2",
      title: "關於閱讀的幾件小事",
      slug: "reading",
      excerpt: "讀一本書的節奏，其實和呼吸一樣，急不得。",
      cover_image: null,
      published_at: "2026-08-24T10:00:00Z",
    },
    {
      id: "mock-3",
      title: "城市散步地圖",
      slug: "city-walk",
      excerpt: "沿著舊城牆走，每一條巷子都藏著一段被遺忘的故事。",
      cover_image: "/test/cover-3.png",
      published_at: "2026-08-21T10:00:00Z",
    },
    {
      id: "mock-4",
      title: "一封信，寫給十年後的自己",
      slug: "letter",
      excerpt: "如果只能留下一句話，我會寫：請記得你為什麼出發。",
      cover_image: null,
      published_at: "2026-08-18T10:00:00Z",
    },
    {
      id: "mock-5",
      title: "手沖咖啡的入門指南",
      slug: "pour-over",
      excerpt: "從磨豆的粗細到水溫，幾個小步驟，讓你在家也能沖出一杯好咖啡。",
      cover_image: "/test/cover-2.png",
      published_at: "2026-08-15T10:00:00Z",
    },
    {
      id: "mock-6",
      title: "雨天的爵士樂歌單",
      slug: "jazz",
      excerpt: "窗外下著雨，配上這幾首爵士，整個房間都慢了下來。",
      cover_image: "/test/cover-4.png",
      published_at: "2026-08-12T10:00:00Z",
    },
    {
      id: "mock-7",
      title: "寫作是與自己的對話",
      slug: "writing",
      excerpt: "每一次落筆，都是一次誠實的自我整理。",
      cover_image: null,
      published_at: "2026-08-08T10:00:00Z",
    },
  ];
  const testPosts = posts && posts.length > 0 ? posts : MOCK_POSTS;

  return (
    <PageTransition>
      {/* 鱼群（跟鼠标）：固定铺满，位于内容之下 */}
      <FishSchool />
      <div className="relative z-10">
      {/* Hero：站名 + 全出血主视觉 */}
        <section className="pt-20 pb-10">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="font-display text-5xl md:text-7xl tracking-[0.05em] text-[#1a1a1a] [text-shadow:0_2px_8px_rgba(0,0,0,0.22)]">
              {siteName}
            </h1>
            <p className="mt-5 text-xs tracking-[0.35em] text-[#8a8580]">
              By Eve Chen
            </p>
          </div>
          <div className="mt-14 flex justify-center">
            <ScrollRotate className="w-full max-w-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-cutout.png"
                alt={siteName}
                className="w-full hero-float"
              />
            </ScrollRotate>
          </div>
        </section>

      {/* 三个功能入口：错落排列 + 悬浮泛光 + 滚动浮现 */}
      <section className="relative max-w-3xl mx-auto px-4 py-16">
        <FeatureParticles />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <ScrollReveal delay={0} className="md:mt-16">
            <Link href="/archive" className="feature-link block">
              <span className="block font-script text-3xl md:text-4xl text-[#f4ece4]">
                Archive
              </span>
              <span className="mt-3 block text-xs tracking-[0.3em] text-[#c0a493]">
                文章歸檔
              </span>
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <Link href="/about" className="feature-link block">
              <span className="block font-script text-3xl md:text-4xl text-[#f4ece4]">
                About
              </span>
              <span className="mt-3 block text-xs tracking-[0.3em] text-[#c0a493]">
                關於我
              </span>
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={240} className="md:mt-32">
            <Link href="/inspiration" className="feature-link block">
              <span className="block font-script text-3xl md:text-4xl text-[#f4ece4]">
                Inspiration
              </span>
              <span className="mt-3 block text-xs tracking-[0.3em] text-[#c0a493]">
                靈感源泉
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 文章列表 */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-baseline gap-4 mb-10">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#c0a493]">
            最新動態
          </span>
          <span className="h-px flex-1 bg-[#8a5a4e]" />
        </div>
        {testPosts.length > 0 ? (
          <div className="columns-1 md:columns-2 gap-8">
            {testPosts.map((post) => (
              <ScrollReveal key={post.id} className="mb-8 break-inside-avoid">
                <PaperCard floating>
                  <PostCard post={post} />
                </PaperCard>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-[#c0a493]">
            還沒有動態。
          </div>
        )}
      </section>

      {/* 留言板：淡粉水彩蔓延背景 + 不规则边缘 */}
      <section id="guestbook" className="relative max-w-3xl mx-auto px-4 py-16">
        <WatercolorWash />
        <div className="relative z-10">
          <div className="flex items-baseline gap-4 mb-10">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#3d1f1f]">
              留言板
            </span>
            <span className="h-px flex-1 bg-[#a06a66]" />
          </div>
          <GuestbookList messages={messages ?? []} />
          <GuestbookForm isLoggedIn={!!user} />
        </div>
      </section>
      </div>
    </PageTransition>
  );
}
