import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteAnnouncementButton } from "@/components/DeleteAnnouncementButton";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/lib/types";

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, content, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<Announcement[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">公告管理</h1>
        <Link
          href="/admin/announcements/editor"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          + 新增公告
        </Link>
      </div>

      {announcements && announcements.length > 0 ? (
        <ul className="space-y-4">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-800">{a.title}</h2>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(a.created_at)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {a.content}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm">
                  <Link
                    href={`/admin/announcements/editor?id=${a.id}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    编辑
                  </Link>
                  <DeleteAnnouncementButton id={a.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">
          还没有公告，点击右上角「新增公告」发布一条吧。
        </p>
      )}
    </div>
  );
}
