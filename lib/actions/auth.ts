"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

// 获取当前站点的完整地址（本地 http://localhost:3000，上线后自动变成 https://你的域名）
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function login(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "请输入邮箱和密码" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "邮箱或密码错误，请重试" };
  }

  // 只允许站内跳转，防止被利用跳转到外部网址
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect(safeNext);
}

export async function register(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  if (!email || !password) return { error: "请输入邮箱和密码" };
  if (password.length < 8) return { error: "密码至少需要 8 位" };
  if (password !== confirm) return { error: "两次输入的密码不一致" };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await getBaseUrl()}/auth/confirm`,
      data: { username },
    },
  });

  if (error) return { error: error.message };

  return {
    success: "注册成功！请去邮箱查收验证邮件，点击链接完成验证后再登录。",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
