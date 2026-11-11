import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteCollectionButton } from "@/components/DeleteCollectionButton";
import { formatDate } from "@/lib/utils";
import type { Collection } from "@/lib/types";

export default async function CollectionsPage() {
  const supabase = await createClient();

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, description, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<Collection[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">合集管理</h1>
        <Link
          href="/admin/collections/editor"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          + 新增合集
        </Link>
      </div>

      {collections && collections.length > 0 ? (
        <ul className="space-y-4">
          {collections.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-800">{c.name}</h2>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(c.created_at)}
                  </p>
                  {c.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                      {c.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <Link
                    href={`/admin/collections/editor?id=${c.id}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    编辑
                  </Link>
                  <DeleteCollectionButton id={c.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">
          还没有合集，点击右上角「新增合集」创建一个吧。
        </p>
      )}
    </div>
  );
}
