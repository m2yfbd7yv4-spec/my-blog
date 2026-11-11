import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

// 在 proxy.ts 里调用，负责：①拦截被屏蔽的 IP ②刷新登录会话 ③记录访问
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // 无 cookie 依赖的客户端：用于屏蔽检查 + 记录访问（anon key，走 RLS）
  const anonClient = createSupabaseClient(url, anon);

  // —— ① 屏蔽检查：被拉黑的 IP 直接拦截 ——
  try {
    const { data: banned } = await anonClient
      .from("banned_ips")
      .select("id")
      .eq("ip", getClientIp(request))
      .maybeSingle();
    if (banned) {
      return new NextResponse("访问被拒绝：你的 IP 已被屏蔽", {
        status: 403,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  } catch {
    // 屏蔽表尚未创建或查询失败 → 放行，不影响正常访问
  }

  // —— ② 刷新会话 ——
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // 注意：不要在 createServerClient 和 getUser 之间写其他代码
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // —— ③ 记录访问（只记 GET 页面浏览，避免 POST/RSC 重复；失败静默忽略）——
  if (request.method === "GET") {
    try {
      await anonClient.from("visitor_logs").insert({
        ip: getClientIp(request),
        user_agent: request.headers.get("user-agent") ?? null,
        path: request.nextUrl.pathname,
        referrer: request.headers.get("referer") ?? null,
        user_id: user?.id ?? null,
      });
    } catch {
      // 忽略日志写入失败
    }
  }

  return supabaseResponse;
}
