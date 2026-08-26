"use client";

import { createBrowserClient } from "@supabase/ssr";

// 浏览器客户端：用于客户端组件
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
