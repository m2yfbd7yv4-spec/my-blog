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

const siteName = "echo of eve";

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
  // 两列瀑布流：奇偶拆分。左列放第 1、3、5… 篇，右列放第 2、4、6… 篇（避免 CSS columns 在部分浏览器把右列内容吞掉）
  const leftPosts = testPosts.filter((_, i) => i % 2 === 0);
  const rightPosts = testPosts.filter((_, i) => i % 2 === 1);

  // ==== ⚠️ 临时测试数据：本地预览留言板列表（默认10条 + 展开）用，测试完删除 ====
  const MOCK_MESSAGES: GuestbookMessageDisplay[] = [
    { id: "gm-1", content: "好喜欢这里的排版，留言板变成静态列表清爽多了。", created_at: "2026-08-29T09:20:00Z", profiles: { username: "小雨" } },
    { id: "gm-2", content: "第一篇测试留言，看看显示效果～", created_at: "2026-08-29T08:05:00Z", profiles: { username: "阿哲" } },
    { id: "gm-3", content: "从朋友的博客转过来，这个复古风太好看了。", created_at: "2026-08-29T06:40:00Z", profiles: { username: "林深" } },
    { id: "gm-4", content: "山间午后的咖啡香那篇，读完想去山里住几天。", created_at: "2026-08-28T22:15:00Z", profiles: { username: "山茶" } },
    { id: "gm-5", content: "字体做旧得刚刚好，很有质感。", created_at: "2026-08-28T19:30:00Z", profiles: { username: null } },
    { id: "gm-6", content: "留言板终于不卡了，之前弹幕滚得我头晕哈哈。", created_at: "2026-08-28T16:00:00Z", profiles: { username: "墨白" } },
    { id: "gm-7", content: "期待更多文章更新，会常来逛逛。", created_at: "2026-08-28T12:45:00Z", profiles: { username: "晚风" } },
    { id: "gm-8", content: "关于阅读的那篇写得真好，节奏感像在呼吸。", created_at: "2026-08-28T09:10:00Z", profiles: { username: "一禾" } },
    { id: "gm-9", content: "颜色搭配很舒服，暖色底配酒红下半段。", created_at: "2026-08-27T23:00:00Z", profiles: { username: null } },
    { id: "gm-10", content: "测试一下长一点的留言，看看换行和排版会不会乱掉，希望一切正常。", created_at: "2026-08-27T18:20:00Z", profiles: { username: "北屿" } },
    { id: "gm-11", content: "你好呀，路过留个言，祝博主写作顺利。", created_at: "2026-08-27T14:05:00Z", profiles: { username: "南乔" } },
    { id: "gm-12", content: "城市散步地图那篇，让我想起老家的小巷。", created_at: "2026-08-27T10:30:00Z", profiles: { username: "青栀" } },
    { id: "gm-13", content: "网站加载挺快的，图片也清晰。", created_at: "2026-08-26T21:40:00Z", profiles: { username: null } },
    { id: "gm-14", content: "这个太阳散落的背景动画很有意思，盯着看了好久。", created_at: "2026-08-26T17:55:00Z", profiles: { username: "枕流" } },
    { id: "gm-15", content: "一封信写给十年后的自己，读到那句「记得你为什么出发」有点感动。", created_at: "2026-08-26T12:00:00Z", profiles: { username: "秋拾" } },
    { id: "gm-16", content: "手冲咖啡入门指南很实用，周末照着试了一下。", created_at: "2026-08-26T08:25:00Z", profiles: { username: null } },
    { id: "gm-17", content: "雨天的爵士歌单，正合适今天这种下雨天。", created_at: "2026-08-25T22:50:00Z", profiles: { username: "半夏" } },
    { id: "gm-18", content: "写作是与自己的对话，深有同感，我也是靠写日记整理思绪。", created_at: "2026-08-25T16:15:00Z", profiles: { username: "拾光" } },
    { id: "gm-19", content: "从搜索进来的，收藏了，有空慢慢看。", created_at: "2026-08-25T11:35:00Z", profiles: { username: null } },
    { id: "gm-20", content: "最后一篇测试，凑满二十条，看看「展开全部」按钮长啥样。", created_at: "2026-08-25T07:00:00Z", profiles: { username: "时雨" } },
  ];
  // 只在本地开发环境（npm run dev）强制显示 20 条假留言，方便预览「默认10条 + 展开」效果；线上始终显示真实留言
  const testMessages =
    process.env.NODE_ENV === "development" ? MOCK_MESSAGES : (messages ?? []);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-8">
              {leftPosts.map((post) => (
                <ScrollReveal key={post.id}>
                  <PaperCard floating>
                    <PostCard post={post} />
                  </PaperCard>
                </ScrollReveal>
              ))}
            </div>
            <div className="flex flex-col gap-8">
              {rightPosts.map((post) => (
                <ScrollReveal key={post.id}>
                  <PaperCard floating>
                    <PostCard post={post} />
                  </PaperCard>
                </ScrollReveal>
              ))}
            </div>
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
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#c0a493]">
              留言板
            </span>
            <span className="h-px flex-1 bg-[#a06a66]" />
          </div>
          <GuestbookList messages={testMessages} />
          <GuestbookForm isLoggedIn={!!user} />
        </div>
      </section>
      </div>
    </PageTransition>
  );
}
