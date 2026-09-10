import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteJournalButton } from "@/components/DeleteJournalButton";
import { formatDate } from "@/lib/utils";
import { journalCategoryLabel } from "@/lib/journal";
import type { JournalEntry } from "@/lib/types";

export default async function JournalAdminPage() {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("journal_entries")
    .select(
      "id, title, category, summary, content, link, published_at, created_at, updated_at",
    )
    .order("published_at", { ascending: false })
    .returns<JournalEntry[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">行路手记管理</h1>
        <Link
          href="/admin/journal/editor"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          + 新增手记
        </Link>
      </div>

      {entries && entries.length > 0 ? (
        <ul className="space-y-4">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {journalCategoryLabel(e.category)}
                    </span>
                    <h2 className="font-semibold text-gray-800">{e.title}</h2>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(e.published_at)}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{e.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <Link
                    href={`/admin/journal/editor?id=${e.id}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    编辑
                  </Link>
                  <DeleteJournalButton id={e.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">
          还没有行路手记，点击右上角「新增手记」发布一条吧。
        </p>
      )}
    </div>
  );
}
