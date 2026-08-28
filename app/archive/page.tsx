import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArchiveView } from "@/components/ArchiveView";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";
import type { ArchivePost } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";
import { FeatureParticles } from "@/components/effects/FeatureParticles";

export const metadata = { title: "文章归档" };

// ⚠️ 临时测试数据：没有真实文章时用这些假数据预览布局/分类筛选（测试完删除）
const MOCK_POSTS: ArchivePost[] = [
  {
    id: "mock-1",
    title: "山間午後的咖啡香",
    slug: "coffee",
    excerpt: "第一次在海拔兩千米的茶園旁喝到手沖，山嵐和咖啡香混在一起。",
    cover_image: "/test/cover-1.png",
    published_at: "2026-08-26T10:00:00Z",
    category: "essays",
    content: `# 山間午後的咖啡香

第一次在海拔兩千米的茶園旁喝到手沖，山嵐和咖啡香混在一起。

那家小店藏在茶園的盡頭，老闆是位退休的茶農。他磨豆子的速度很慢，慢到像在等一壺水慢慢燒開。

> 咖啡和茶其實是同一種東西——都是對時間的耐心。

喝完最後一口，山嵐剛好漫過茶園。`,
  },
  {
    id: "mock-2",
    title: "關於閱讀的幾件小事",
    slug: "reading",
    excerpt: "讀一本書的節奏，其實和呼吸一樣，急不得。",
    cover_image: null,
    published_at: "2026-08-24T10:00:00Z",
    category: "notes",
    content: `# 關於閱讀的幾件小事

讀一本書的節奏，其實和呼吸一樣，急不得。

- 有些書要快讀，像翻報紙
- 有些書要慢讀，像喝一碗熱湯
- 有些書不必讀完

真正重要的，是你在讀的那一刻，心裡有沒有聲音。`,
  },
  {
    id: "mock-3",
    title: "城市散步地圖",
    slug: "city-walk",
    excerpt: "沿著舊城牆走，每一條巷子都藏著一段被遺忘的故事。",
    cover_image: "/test/cover-3.png",
    published_at: "2026-08-21T10:00:00Z",
    category: "journal",
    content: `# 城市散步地圖

沿著舊城牆走，每一條巷子都藏著一段被遺忘的故事。

午後的陽光斜斜地照在石板路上，一個賣豆花的老伯坐在巷口打盹。我沒有叫醒他，只是輕輕走過。

地圖上沒有標記的地方，往往最值得去。`,
  },
  {
    id: "mock-4",
    title: "一封信，寫給十年後的自己",
    slug: "letter",
    excerpt: "如果只能留下一句話，我會寫：請記得你為什麼出發。",
    cover_image: null,
    published_at: "2026-08-18T10:00:00Z",
    category: "essays",
    content: `# 一封信，寫給十年後的自己

如果只能留下一句話，我會寫：請記得你為什麼出發。

親愛的十年後的自己：

我不知道你現在在哪裡、過得好不好。但我希望你還記得那個在茶園裡喝咖啡的下午，記得那份不急不躁的心情。

別忘了給自己留一點慢下來的時間。`,
  },
  {
    id: "mock-5",
    title: "手沖咖啡的入門指南",
    slug: "pour-over",
    excerpt: "從磨豆的粗細到水溫，幾個小步驟，讓你在家也能沖出一杯好咖啡。",
    cover_image: "/test/cover-2.png",
    published_at: "2026-08-15T10:00:00Z",
    category: "general",
    content: `# 手沖咖啡的入門指南

從磨豆的粗細到水溫，幾個小步驟，讓你在家也能沖出一杯好咖啡。

## 你需要準備

- 手沖壺
- 濾杯與濾紙
- 新鮮的咖啡豆
- 一個電子秤

## 步驟

1. 磨豆：中等粗細
2. 水溫：90 到 93 度
3. 悶蒸：注水後等 30 秒
4. 慢慢繞圈注水

熟練之後，你甚至能閉著眼睛沖。`,
  },
  {
    id: "mock-6",
    title: "雨天的爵士樂歌單",
    slug: "jazz",
    excerpt: "窗外下著雨，配上這幾首爵士，整個房間都慢了下來。",
    cover_image: "/test/cover-4.png",
    published_at: "2026-08-12T10:00:00Z",
    category: "reviews",
    content: `# 雨天的爵士樂歌單

窗外下著雨，配上這幾首爵士，整個房間都慢了下來。

## 歌單

1. Bill Evans — Peace Piece
2. Chet Baker — Almost Blue
3. Miles Davis — Blue in Green

雨天的爵士，最好是黑膠，其次是耳機。`,
  },
  {
    id: "mock-7",
    title: "寫作是與自己的對話",
    slug: "writing",
    excerpt: "每一次落筆，都是一次誠實的自我整理。",
    cover_image: null,
    published_at: "2026-08-08T10:00:00Z",
    category: "notes",
    content: `# 寫作是與自己的對話

每一次落筆，都是一次誠實的自我整理。

寫作不需要靈感，只需要坐下來。靈感是寫著寫著才出現的。

就像現在，我也不知道自己會寫到哪裡。但寫到這裡，忽然覺得挺好的。`,
  },
  {
    id: "mock-8",
    title: "讀《百年孤獨》的片段",
    slug: "hundred-years",
    excerpt: "馬康多的雨下了四年十一個月零兩天，而我讀到那頁時，窗外剛好也在下雨。",
    cover_image: "/test/cover-5.png",
    published_at: "2026-07-20T10:00:00Z",
    category: "reviews",
    content: `# 讀《百年孤獨》的片段

馬康多的雨下了四年十一個月零兩天，而我讀到那頁時，窗外剛好也在下雨。

「多年以後，面對行刑隊，奧雷里亞諾·布恩迪亞上校將會回想起父親帶他去見識冰塊的那個遙遠的下午。」

有些句子，你讀過一次，就再也忘不掉。`,
  },
  {
    id: "mock-9",
    title: "京都的舊書店",
    slug: "kyoto-bookshop",
    excerpt: "在四条附近的小巷裡，藏著一間只賣舊書的小店。",
    cover_image: "/test/cover-6.png",
    published_at: "2025-12-05T10:00:00Z",
    category: "journal",
    content: `# 京都的舊書店

在四条附近的小巷裡，藏著一間只賣舊書的小店。

店裡有股淡淡的霉味和木頭香。老闆坐在櫃檯後看報紙，聽到門鈴響也不抬頭。

我買了一本昭和年間出版的詩集，扉頁上還有前任主人的名字。`,
  },
  {
    id: "mock-10",
    title: "關於這個博客",
    slug: "about-blog",
    excerpt: "這裡記錄一些雜七雜八的念頭，隨手寫下，不趕時間。",
    cover_image: null,
    published_at: "2025-11-30T10:00:00Z",
    category: "general",
    content: `# 關於這個博客

這裡記錄一些雜七雜八的念頭，隨手寫下，不趕時間。

沒有固定的主題，也沒有更新的壓力。想寫就寫，不想寫就停一停。

如果你偶爾路過，歡迎進來坐坐。`,
  },
];

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const selected = typeof sp.category === "string" ? sp.category : null;

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, cover_image, published_at, category, content")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<ArchivePost[]>();

  const allPosts = posts && posts.length > 0 ? posts : MOCK_POSTS;
  // general 就是「全部」：默认或选了 general 都显示所有文章
  const filtered =
    selected && selected !== DEFAULT_CATEGORY
      ? allPosts.filter((p) => p.category === selected)
      : allPosts;

  return (
    <PageTransition>
      <div>
      {/* 背景：桌面截图铺满 + 流动粒子 */}
      <div className="archive-bg" aria-hidden="true" />
      <FeatureParticles sparkle />
      <div className="panel-rise relative z-10 max-w-3xl mx-auto mt-24 mb-16">
        <div className="ink-panel-bg" aria-hidden="true" />
        <div className="relative z-10 px-6 py-10 md:px-12 md:py-12">
        <div className="md:grid md:grid-cols-[200px_1fr] md:gap-12">
        {/* 左侧：Archive 标题 + 分类栏 */}
        <aside className="mb-10 md:mb-0">
          <p className="font-display text-5xl md:text-6xl text-[#1a1a1a]">
            Archive
          </p>
          <h1 className="mt-4 font-display text-xs uppercase tracking-[0.35em] text-[#8a8580]">
            文章归档
          </h1>
          <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-3 md:block">
            {CATEGORIES.map((c) => {
              // general 就是「全部」：默认（无分类参数）时高亮
              const isGeneral = c.slug === DEFAULT_CATEGORY;
              const active = isGeneral ? !selected : selected === c.slug;
              const href = isGeneral
                ? "/archive"
                : `/archive?category=${c.slug}`;
              return (
                <Link
                  key={c.slug}
                  href={href}
                  className={`block font-typewriter text-base transition-colors ${
                    active
                      ? "text-[#7a3f2a] font-semibold"
                      : "text-[#504f50] hover:text-[#1a1a1a]"
                  }`}
                >
                  {c.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 右侧：列表/方格切换 + 内容 */}
        <ArchiveView posts={filtered} />
        </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
