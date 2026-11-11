import { createClient } from "@/lib/supabase/server";
import { BanIpButton } from "@/components/BanIpButton";
import { formatDate, beijingDayStart } from "@/lib/utils";
import type { VisitorLog } from "@/lib/types";

export default async function VisitorsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("visitor_logs")
    .select(
      "id, ip, user_agent, path, referrer, user_id, created_at, profiles(username)",
    )
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<VisitorLog[]>();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, role, created_at")
    .order("created_at", { ascending: false });

  const { count: totalVisits } = await supabase
    .from("visitor_logs")
    .select("id", { count: "exact", head: true });

  const { count: todayVisits } = await supabase
    .from("visitor_logs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", beijingDayStart().toISOString());

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">访客记录</h1>

      {/* 概览 */}
      <div className="mb-8 grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-gray-500">总访问</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            {totalVisits ?? 0}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-gray-500">今日访问</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            {todayVisits ?? 0}
          </p>
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4">
          <p className="text-gray-500">注册用户</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            {users?.length ?? 0}
          </p>
        </div>
      </div>

      {/* 最近访问 */}
      <h2 className="mb-3 font-semibold text-gray-800">最近访问</h2>
      {logs && logs.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-2 font-medium">IP</th>
                <th className="px-3 py-2 font-medium">页面</th>
                <th className="px-3 py-2 font-medium">用户</th>
                <th className="px-3 py-2 font-medium">时间</th>
                <th className="px-3 py-2 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-mono text-xs">{l.ip}</td>
                  <td className="px-3 py-2 text-gray-700">{l.path}</td>
                  <td className="px-3 py-2 text-gray-500">
                    {l.profiles?.username ?? "匿名"}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {formatDate(l.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <BanIpButton ip={l.ip} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-400">
          还没有访问记录。
        </p>
      )}

      {/* 注册用户 */}
      <h2 className="mb-3 mt-10 font-semibold text-gray-800">注册用户</h2>
      {users && users.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-2 font-medium">用户名</th>
                <th className="px-3 py-2 font-medium">角色</th>
                <th className="px-3 py-2 font-medium">注册时间</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">
                    {u.username ?? "（未设置）"}
                  </td>
                  <td className="px-3 py-2">
                    {u.role === "admin" ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        管理员
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        用户
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {formatDate(u.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-400">
          还没有注册用户。
        </p>
      )}
    </div>
  );
}
