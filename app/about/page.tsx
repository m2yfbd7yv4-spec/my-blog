import { WaterRipple } from "@/components/effects/WaterRipple";
import { PageTransition } from "@/components/PageTransition";

export const metadata = { title: "关于我" };

export default function AboutPage() {
  return (
    <PageTransition>
      <div>
      {/* 背景：桌面截图做成会泛涟漪的「水面」，鼠标移动/点击处荡开波纹 */}
      <WaterRipple photo="/ripple-bg.jpg" saturate={1.3} />
      {/* 轻遮罩：让文字在照片上保持可读，同时保留波纹可见 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[#f3ece0]/30"
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-20 pb-24">
        <p className="font-script text-5xl md:text-6xl text-[#1a1a1a]">About</p>
        <h1 className="mt-4 text-xs uppercase tracking-[0.35em] text-[#8a8580]">
          关于我
        </h1>

        <div className="mt-12 max-w-2xl space-y-6 text-[15px] leading-8 text-[#504f50]">
          <p>你好，我是 evechen。</p>
          <p>
            该博客用于记录我的生存痕迹，欢迎你的阅读和留言。我很高兴能与你一起见证
            echo of eve 的成长。
          </p>
          <p>
            邮箱：
            <a
              href="mailto:chy19883580787@qq.com"
              className="text-[#7a5c4a] underline underline-offset-2 transition-colors hover:text-[#1a1a1a]"
            >
              chy19883580787@qq.com
            </a>
          </p>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
