import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { postMetaLabel } from "@/lib/categories";
import { PageTransition } from "@/components/PageTransition";
import { FeatureParticles } from "@/components/effects/FeatureParticles";

export const metadata = { title: "站内搜索" };

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  category: string;
};

const RESULT_SELECT =
  "id, title, slug, excerpt, cover_image, published_at, category";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim();

  let results: SearchResult[] = [];
  if (q) {
    // 转义 ilike 通配符，避免用户输入 % / _ 破坏查询
    const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
    const supabase = await createClient();

    // 标题命中 + 正文命中，分别查再按 id 去重（标题命中排前）
    const [titleRes, contentRes] = await Promise.all([
      supabase
        .from("posts")
        .select(RESULT_SELECT)
        .eq("status", "published")
        .ilike("title", pattern)
        .order("published_at", { ascending: false })
        .limit(50)
        .returns<SearchResult[]>(),
      supabase
        .from("posts")
        .select(RESULT_SELECT)
        .eq("status", "published")
        .ilike("content", pattern)
        .order("published_at", { ascending: false })
        .limit(50)
        .returns<SearchResult[]>(),
    ]);

    const seen = new Set<string>();
    const merged: SearchResult[] = [];
    for (const row of [...(titleRes.data ?? []), ...(contentRes.data ?? [])]) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      merged.push(row);
    }
    results = merged;
  }

  return (
    <PageTransition>
      <div>
        <div className="archive-bg" aria-hidden="true" />
        <FeatureParticles sparkle />
        <div className="panel-rise relative z-10 max-w-3xl mx-auto mt-24 mb-16">
          <div className="ink-panel-bg" aria-hidden="true" />
          <div className="relative z-10 px-6 py-10 md:px-12 md:py-12">
            <p className="font-display text-5xl md:text-6xl text-[#1a1a1a]">
              Search
            </p>
            <h1 className="mt-4 font-display text-xs uppercase tracking-[0.35em] text-[#8a8580]">
              站内搜索
            </h1>

            <form action="/search" method="get" className="mt-8 flex gap-3">
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="输入关键词，搜索标题和正文"
                className="w-full rounded-md border border-[#d8d4cd] bg-[#fffdf8] px-4 py-2 text-sm text-[#241209] focus:outline-none focus:ring-2 focus:ring-[#7a5c4a]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-[#7a3f2a] px-5 py-2 text-sm text-[#f4ece4] hover:bg-[#5a2c1d]"
              >
                搜索
              </button>
            </form>

            {q && (
              <div className="mt-10">
                <p className="mb-6 text-sm text-[#8a8580]">
                  「{q}」找到 {results.length} 篇
                </p>
                {results.length === 0 ? (
                  <p className="py-12 text-center text-sm text-[#8a8580]">
                    没有找到相关文章。
                  </p>
                ) : (
                  <ul>
                    {results.map((p) => (
                      <li key={p.id} className="border-b border-[#e8e6e1]">
                        <Link
                          href={`/blog/${p.slug}`}
                          className="group flex items-start justify-between gap-4 py-4"
                        >
                          <span className="min-w-0">
                            <span className="block font-display text-[#1a1a1a] transition-colors group-hover:text-[#7a5c4a]">
                              {p.title}
                            </span>
                            <span className="mt-1 block text-xs tracking-[0.1em] text-[#b3aea8]">
                              {postMetaLabel(p.category)}
                            </span>
                            {p.excerpt && (
                              <span className="mt-1 block text-sm text-[#46281a] line-clamp-2">
                                {p.excerpt}
                              </span>
                            )}
                          </span>
                          <time className="shrink-0 text-xs tracking-[0.15em] text-[#b3aea8]">
                            {formatDate(p.published_at)}
                          </time>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
