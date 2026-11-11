"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/server-auth";

// 全部标记已读
export async function markAllNotificationsRead(
  formData: FormData,
): Promise<void> {
  const user = await getAdminUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);
  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
}

// 清空全部通知
export async function clearNotifications(formData: FormData): Promise<void> {
  const user = await getAdminUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .delete()
    .gte("created_at", "1970-01-01T00:00:00Z");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin");
}
