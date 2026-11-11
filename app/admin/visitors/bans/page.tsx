import { createClient } from "@/lib/supabase/server";
import { unbanIp, unbanUser } from "@/lib/actions/bans";
import { BanIpForm } from "./BanIpForm";
import { BanUserForm } from "./BanUserForm";
import { formatDate } from "@/lib/utils";
import type { BannedIp, BannedUser } from "@/lib/types";

export default async function BansPage() {
  const supabase = await createClient();

  const { data: bannedIps } = await supabase
    .from("banned_ips")
    .select("id, ip, reason, created_at")
    .order("created_at", { ascending: false })
    .returns<BannedIp[]>();

  const { data: bannedUsers } = await supabase
    .from("banned_users")
    .select("id, user_id, reason, created_at, profiles(username)")
    .order("created_at", { ascending: false })
    .returns<BannedUser[]>();

  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, username, role")
    .order("created_at", { ascending: false });

  const bannedIds = new Set((bannedUsers ?? []).map((b) => b.user_id));
  const bannableUsers = (allUsers ?? []).filter(
    (u) => u.role !== "admin" && !bannedIds.has(u.id),
  );

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">屏蔽管理</h1>
      <p className="mb-8 text-sm text-gray-500">
        ⚠️ 别屏蔽自己的 IP，否则你自己也会打不开网站。
      </p>

      {/* 屏蔽 IP */}
      <h2 className="mb-3 font-semibold text-gray-800">屏蔽 IP（整站拦截）</h2>
      <BanIpForm />

      {bannedIps && bannedIps.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {bannedIps.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <span className="font-mono">{b.ip}</span>
                <span className="ml-3 text-xs text-gray-400">
                  {formatDate(b.created_at)}
                </span>
                {b.reason && (
                  <p className="mt-0.5 text-xs text-gray-500">{b.reason}</p>
                )}
              </div>
              <form action={unbanIp}>
                <input type="hidden" name="id" value={b.id} />
                <button
                  type="submit"
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  解除
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-400">还没有屏蔽任何 IP。</p>
      )}

      {/* 拉黑用户 */}
      <h2 className="mb-3 mt-10 font-semibold text-gray-800">
        拉黑用户（禁止评论/留言）
      </h2>
      <BanUserForm
        users={bannableUsers.map((u) => ({
          id: u.id,
          username: u.username ?? "（未设置）",
        }))}
      />

      {bannedUsers && bannedUsers.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {bannedUsers.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <span className="font-medium">
                  {b.profiles?.username ?? "（未设置）"}
                </span>
                <span className="ml-3 text-xs text-gray-400">
                  {formatDate(b.created_at)}
                </span>
                {b.reason && (
                  <p className="mt-0.5 text-xs text-gray-500">{b.reason}</p>
                )}
              </div>
              <form action={unbanUser}>
                <input type="hidden" name="id" value={b.id} />
                <button
                  type="submit"
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  解除
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-400">还没有拉黑任何用户。</p>
      )}
    </div>
  );
}
