import { createClient } from "@/lib/supabase/server";
import { moderateComment } from "@/lib/actions/comments";
import { formatDate } from "@/lib/utils";
import type { ModerationComment } from "@/lib/types";

export default async function CommentsPage() {
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("comments")
    .select("id, content, created_at, profiles(username), posts(title)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .returns<ModerationComment[]>();

  const { data: approved } = await supabase
    .from("comments")
    .select("id, content, created_at, profiles(username), posts(title)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<ModerationComment[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">评论审核</h1>

      <h2 className="text-lg font-semibold mb-3">
        待审核（{pending?.length ?? 0}）
      </h2>
      {!pending || pending.length === 0 ? (
        <p className="mb-10 text-gray-400">没有待审核的评论。</p>
      ) : (
        <ul className="mb-10 space-y-3">
          {pending.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="mb-1 text-xs text-gray-400">
                {c.profiles?.username || "用户"} · 评论于《
                {c.posts?.title || "已删除文章"}》 · {formatDate(c.created_at)}
              </div>
              <p className="mb-3 whitespace-pre-wrap text-gray-700">{c.content}</p>
              <form action={moderateComment} className="flex gap-2">
                <input type="hidden" name="id" value={c.id} />
                <button
                  name="action"
                  value="approve"
                  className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                >
                  通过
                </button>
                <button
                  name="action"
                  value="reject"
                  className="rounded-md bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                >
                  拒绝
                </button>
                <button
                  name="action"
                  value="delete"
                  className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                >
                  删除
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-semibold mb-3">已通过（最近 20 条）</h2>
      {!approved || approved.length === 0 ? (
        <p className="text-gray-400">还没有已通过的评论。</p>
      ) : (
        <ul className="space-y-3">
          {approved.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="mb-1 text-xs text-gray-400">
                {c.profiles?.username || "用户"} · 评论于《
                {c.posts?.title || "已删除文章"}》 · {formatDate(c.created_at)}
              </div>
              <p className="whitespace-pre-wrap text-gray-700">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
