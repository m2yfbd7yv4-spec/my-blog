import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteTagButton } from "@/components/DeleteTagButton";
import { formatDate } from "@/lib/utils";
import type { Tag } from "@/lib/types";

export default async function TagsPage() {
  const supabase = await createClient();

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .returns<Tag[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">标签管理</h1>
        <Link
          href="/admin/tags/editor"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          + 新增标签
        </Link>
      </div>

      {tags && tags.length > 0 ? (
        <ul className="space-y-4">
          {tags.map((t) => (
            <li
              key={t.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                    {t.name}
                  </span>
                  <p className="mt-2 text-xs text-gray-400">
                    {formatDate(t.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <Link
                    href={`/admin/tags/editor?id=${t.id}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    编辑
                  </Link>
                  <DeleteTagButton id={t.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">
          还没有标签，点击右上角「新增标签」创建一个吧。
        </p>
      )}
    </div>
  );
}
