import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeletePostButton } from "@/components/DeletePostButton";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, status, updated_at")
    .order("updated_at", { ascending: false });

  const { count: pendingCount } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href="/admin/comments"
            className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-100"
          >
            评论审核{pendingCount ? `（${pendingCount}）` : ""}
          </Link>
          <Link
            href="/admin/editor"
            className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-100"
          >
            + 写新文章
          </Link>
        </div>
      </div>

      {posts && posts.length > 0 ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2 font-medium">标题</th>
              <th className="py-2 font-medium">状态</th>
              <th className="py-2 font-medium">更新时间</th>
              <th className="py-2 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100">
                <td className="py-3 pr-2 font-medium">{post.title}</td>
                <td className="py-3 pr-2">
                  {post.status === "published" ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      已发布
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      草稿
                    </span>
                  )}
                </td>
                <td className="py-3 pr-2 text-gray-500">
                  {formatDate(post.updated_at)}
                </td>
                <td className="py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/editor?slug=${post.slug}`}
                    className="text-indigo-600 hover:text-indigo-700 mr-4"
                  >
                    编辑
                  </Link>
                  <DeletePostButton id={post.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-400">还没有文章，点击右上角「写新文章」开始吧。</p>
      )}
    </div>
  );
}
