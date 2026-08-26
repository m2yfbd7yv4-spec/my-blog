import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

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
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {siteName}
        </footer>
      </body>
    </html>
  );
}
