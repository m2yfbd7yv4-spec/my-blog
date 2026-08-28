import { createClient } from "@/lib/supabase/server";
import { InspirationForm } from "@/components/InspirationForm";
import { deleteInspiration } from "@/lib/actions/inspirations";
import { formatDate } from "@/lib/utils";
import type { Inspiration } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";
import { InspirationScatter } from "@/components/InspirationScatter";
import { ParticleWave } from "@/components/effects/ParticleWave";

export const metadata = { title: "灵感源泉" };

// ⚠️ 临时测试数据：没有真实灵感时用这些假数据预览布局（测试完删除）
const MOCK_INSPIRATIONS: Inspiration[] = [
  {
    id: "test-insp-1",
    content: "山间的晨雾，配一杯手冲咖啡，突然明白「慢」也是一种力量。",
    image_url: "/test/cover-1.png",
    created_at: "2026-08-27T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-2",
    content: "旧书店里翻到一本泛黄的杂志，某页的排版让我想重新设计自己的博客。",
    image_url: "/test/cover-2.png",
    created_at: "2026-08-26T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-3",
    content: "雨天的爵士乐，窗外的水汽模糊了街灯，灵感就藏在这种氛围里。",
    image_url: "/test/cover-3.png",
    created_at: "2026-08-25T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-4",
    content: "一张老照片里的胶卷颗粒，让我想起胶片相机独有的温度。",
    image_url: "/test/cover-4.png",
    created_at: "2026-08-24T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-5",
    content: "黄昏时分的海边，天空从橙红一路渐变到靛蓝。",
    image_url: "/test/cover-5.png",
    created_at: "2026-08-23T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-6",
    content: "博物馆里的一件青铜器，斑驳的绿锈是最耐看的配色。",
    image_url: "/test/cover-6.png",
    created_at: "2026-08-22T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-7",
    content: "一句关于光的笔记：正午的光太硬，黄昏的光才有故事。",
    image_url: null,
    created_at: "2026-08-21T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-8",
    content: "听见雨声时，写作的欲望会突然冒出来。",
    image_url: null,
    created_at: "2026-08-20T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-9",
    content: "想把博客的字体换成更有手感的衬线。",
    image_url: null,
    created_at: "2026-08-19T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-10",
    content: "旅行中拍下的一张车窗倒影，虚虚实实。",
    image_url: null,
    created_at: "2026-08-18T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-11",
    content: "夜里三点，脑海里的旋律挥之不去。",
    image_url: null,
    created_at: "2026-08-17T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-12",
    content: "旧杂志里剪下的一段文字，贴在墙上很久了。",
    image_url: null,
    created_at: "2026-08-16T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-13",
    content: "在二手市场淘到一个黄铜书签，握在手里沉甸甸的。",
    image_url: null,
    created_at: "2026-08-15T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-14",
    content: "想把「灵感」这个词本身也设计成一张海报。",
    image_url: null,
    created_at: "2026-08-14T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-15",
    content: "窗台上的一盆薄荷，在阳光下绿得发亮。",
    image_url: null,
    created_at: "2026-08-13T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-16",
    content: "地铁里看到有人读诗，突然觉得纸质书不会死。",
    image_url: null,
    created_at: "2026-08-12T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-17",
    content: "深夜的便利店里，收银台的暖光最治愈。",
    image_url: null,
    created_at: "2026-08-11T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-18",
    content: "翻到大学时的笔记本，字迹乱得可爱。",
    image_url: null,
    created_at: "2026-08-10T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-19",
    content: "想把每年读过的书做成一排小图标。",
    image_url: null,
    created_at: "2026-08-09T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-20",
    content: "清晨五点的城市，还没有醒来的样子最安静。",
    image_url: null,
    created_at: "2026-08-08T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-21",
    content: "煮一壶茶，等它慢慢凉下来，节奏就对了。",
    image_url: null,
    created_at: "2026-08-07T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-22",
    content: "旧毛衣起球了，却比新衣服更想穿。",
    image_url: null,
    created_at: "2026-08-06T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-23",
    content: "一首歌的前奏响起，整个人就回到了某个夏天。",
    image_url: null,
    created_at: "2026-08-05T10:00:00Z",
    profiles: null,
  },
  {
    id: "test-insp-24",
    content: "把喜欢的句子抄下来，贴在抬眼就能看到的地方。",
    image_url: null,
    created_at: "2026-08-04T10:00:00Z",
    profiles: null,
  },
];

export default async function InspirationPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("inspirations")
    .select("id, content, image_url, created_at, profiles(username)")
    .order("created_at", { ascending: false })
    .returns<Inspiration[]>();

  // 真实数据为空（或迁移未跑）时，退回 mock 预览
  const allItems = items && items.length > 0 ? items : MOCK_INSPIRATIONS;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <PageTransition>
      <div className="relative">
        {/* 背景：桌面截图 IMG_1562 固定铺满视口（滚动时也盖住页脚，不露白） */}
        <div
          aria-hidden
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/inspiration-bg.jpg")' }}
        />

        {/* 灵感图散布在页面上，点击拉远，逐层看到更大范围的灵感 */}
        <div className="relative h-screen w-full overflow-hidden">
          <ParticleWave />

          <InspirationScatter items={allItems} />
        </div>

        {/* 站长管理区：记录表单 + 删除列表 */}
        {isAdmin && (
          <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-8">
            <div className="rounded-2xl bg-[#fffdf8]/90 p-6 shadow-[0_14px_34px_-16px_rgba(60,45,30,0.45)] md:p-8">
              <InspirationForm />

              {items && items.length > 0 && (
                <ul className="mt-12 border-t border-[#e8e6e1]">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-center justify-between gap-4 border-b border-[#e8e6e1] py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[#504f50]">
                          {it.content}
                        </p>
                        <time className="text-xs tracking-[0.15em] text-[#b3aea8]">
                          {formatDate(it.created_at)}
                        </time>
                      </div>
                      <form action={deleteInspiration}>
                        <input type="hidden" name="id" value={it.id} />
                        <button
                          type="submit"
                          className="shrink-0 text-xs text-[#b3aea8] transition-colors hover:text-red-600"
                        >
                          删除
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
