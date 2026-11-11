import { createClient } from "@/lib/supabase/server";
import {
  markAllNotificationsRead,
  clearNotifications,
} from "@/lib/actions/notifications";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const TYPE_LABEL: Record<Notification["type"], string> = {
  comment: "新评论",
  guestbook: "新留言",
  registration: "新注册",
};

export default async function NotificationsPage() {
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, message, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<Notification[]>();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">通知</h1>
        <div className="flex gap-3 text-sm">
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-100"
            >
              全部标记已读
            </button>
          </form>
          <form action={clearNotifications}>
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-100"
            >
              清空全部
            </button>
          </form>
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <p className="text-gray-400">还没有通知。</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-md border p-4 ${
                n.is_read
                  ? "border-gray-200 bg-white opacity-60"
                  : "border-indigo-200 bg-indigo-50"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    n.is_read
                      ? "bg-gray-100 text-gray-600"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  {TYPE_LABEL[n.type]}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(n.created_at)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
