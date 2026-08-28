import { LoginForm } from "./LoginForm";
import { PageTransition } from "@/components/PageTransition";
import { FeatureParticles } from "@/components/effects/FeatureParticles";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/";
  const verified = sp.verified === "1";

  return (
    <PageTransition>
      <div>
        {/* 背景：桌面截图铺满 + 流动粒子 */}
        <div className="login-bg" aria-hidden="true" />
        <FeatureParticles sparkle />

        {/* 登录面板：与文章归档同款水墨毛边面板 */}
        <div className="panel-rise relative z-10 max-w-md mx-auto mt-24 mb-16">
          <div className="ink-panel-bg" aria-hidden="true" />
          <div className="relative z-10 px-8 py-10 md:px-12 md:py-12">
            <LoginForm next={next} verified={verified} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
