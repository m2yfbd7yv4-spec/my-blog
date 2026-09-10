import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { journalCategoryLabel } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";
import { FeatureParticles } from "@/components/effects/FeatureParticles";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "行路手记" };

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const entry = data as JournalEntry;

  return (
    <PageTransition>
      <div>
        <div className="archive-bg" aria-hidden="true" />
        <FeatureParticles sparkle />
        <div className="panel-rise relative z-10 max-w-3xl mx-auto mt-24 mb-16">
          <div className="ink-panel-bg" aria-hidden="true" />
          <div className="relative z-10 px-6 py-10 md:px-12 md:py-12">
            <Link
              href="/journal"
              className="text-sm text-[#8a8580] transition-colors hover:text-[#1a1a1a]"
            >
              ← 返回行路手记
            </Link>
            <div className="mt-6 flex items-center gap-3 text-xs">
              <span className="rounded-full bg-[#e8d7b5] px-2.5 py-0.5 text-[#7a5c4a]">
                {journalCategoryLabel(entry.category)}
              </span>
              <span className="text-[#8a8580]">
                {formatDate(entry.published_at)}
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl md:text-4xl text-[#1a1a1a]">
              {entry.title}
            </h1>
            <div className="mt-8 whitespace-pre-wrap text-[15px] leading-8 text-[#504f50]">
              {entry.content}
            </div>
            {entry.link && (
              <a
                href={entry.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block text-sm text-[#7a5c4a] underline underline-offset-2 transition-colors hover:text-[#1a1a1a]"
              >
                查看外链 →
              </a>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
