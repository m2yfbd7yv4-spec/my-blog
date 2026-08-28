import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ClickParticles } from "@/components/effects/ClickParticles";
import { HomeBackgrounds } from "@/components/effects/HomeBackgrounds";
import { Footer } from "@/components/Footer";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "我的博客";

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "一个个人博客",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <div className="relative flex flex-1 flex-col">
          <HomeBackgrounds />
          <main className="relative z-10 flex-1 w-full">{children}</main>
          <Footer />
        </div>
        <ClickParticles />
      </body>
    </html>
  );
}
