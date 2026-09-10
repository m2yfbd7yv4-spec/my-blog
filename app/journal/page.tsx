import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOURNAL_CATEGORIES, journalSubcategoryLabel } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";
import { FeatureParticles } from "@/components/effects/FeatureParticles";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "行路手记" };

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const selected = typeof sp.category === "string" ? sp.category : null;

  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("journal_entries")
    .select(
      "id, title, category, subcategory, summary, content, link, published_at, created_at, updated_at",
    )
    .order("published_at", { ascending: false })
    .returns<JournalEntry[]>();

  const all = entries ?? [];
  const filtered =
    selected && selected !== "all"
      ? all.filter((e) => e.category === selected)
      : all;

  return (
    <PageTransition>
      <div>
        <div className="archive-bg" aria-hidden="true" />
        <FeatureParticles sparkle />
        <div className="panel-rise relative z-10 max-w-3xl mx-auto mt-24 mb-16">
          <div className="ink-panel-bg" aria-hidden="true" />
          <div className="relative z-10 px-6 py-10 md:px-12 md:py-12">
            <div className="md:grid md:grid-cols-[200px_1fr] md:gap-12">
              <aside className="mb-10 md:mb-0">
                <p className="font-display text-5xl md:text-6xl text-[#1a1a1a]">
                  Journal
                </p>
                <h1 className="mt-4 font-display text-xs uppercase tracking-[0.35em] text-[#8a8580]">
                  行路手记
                </h1>
                <p className="mt-4 text-sm leading-6 text-[#8a8580]">
                  工作与学习经历、干货分享。
                </p>
                <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-3 md:block">
                  <Link
                    href="/journal"
                    className={`block font-typewriter text-base transition-colors ${
                      !selected || selected === "all"
                        ? "text-[#7a3f2a] font-semibold"
                        : "text-[#504f50] hover:text-[#1a1a1a]"
                    }`}
                  >
                    全部
                  </Link>
                  {JOURNAL_CATEGORIES.map((c) => (
                    <Link
                      key={c.value}
                      href={`/journal?category=${c.value}`}
                      className={`block font-typewriter text-base transition-colors ${
                        selected === c.value
                          ? "text-[#7a3f2a] font-semibold"
                          : "text-[#504f50] hover:text-[#1a1a1a]"
                      }`}
                    >
                      {c.label}
                    </Link>
                  ))}
                </nav>
              </aside>

              <div>
                {filtered.length > 0 ? (
                  <ul className="space-y-5">
                    {filtered.map((e) => (
                      <li key={e.id}>
                        <Link
                          href={`/journal/${e.id}`}
                          className="block rounded-sm border border-[#e0d8ca] bg-[#fbf7ef] p-5 transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-center gap-3 text-xs">
                            <span className="rounded-full bg-[#e8d7b5] px-2.5 py-0.5 text-[#7a5c4a]">
                              {journalSubcategoryLabel(e.subcategory)}
                            </span>
                            <span className="text-[#8a8580]">
                              {formatDate(e.published_at)}
                            </span>
                          </div>
                          <h2 className="mt-3 font-display text-xl text-[#241209]">
                            {e.title}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-[#46281a]">
                            {e.summary}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-16 text-center text-sm text-[#8a8580]">
                    还没有内容，敬请期待。
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
