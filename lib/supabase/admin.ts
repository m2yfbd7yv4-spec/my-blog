import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// 服务端专用客户端：使用 service_role key，绕过 RLS。
// ⚠️ 只能在服务端代码（Server Actions / Route Handlers）里使用，
//    绝不能 import 进任何客户端组件或暴露给浏览器。
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("缺少 SUPABASE_SERVICE_ROLE_KEY，请先在 .env.local 中配置");
  }

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
