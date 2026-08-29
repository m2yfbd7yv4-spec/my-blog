"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { TurnstileField } from "@/components/TurnstileField";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export function LoginForm({
  next,
  verified,
}: {
  next: string;
  verified: boolean;
}) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div>
      <p className="font-display text-4xl md:text-5xl text-[#1a1a1a]">Login</p>
      <h1 className="mt-4 text-xs uppercase tracking-[0.35em] text-[#8a8580]">
        账号登录
      </h1>

      {verified && (
        <p className="mt-6 rounded-md border border-[#cfe0d0] bg-[#eef5ee] p-3 text-sm text-[#3a6b4a]">
          邮箱验证成功，请登录。
        </p>
      )}

      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={next} />
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[#504f50]"
          >
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-[#e0d8ca] bg-[#fffdf8] px-3 py-2.5 text-[#1a1a1a] placeholder:text-[#b3aea8] focus:border-[#7a5c4a] focus:outline-none focus:ring-2 focus:ring-[#c0a493]/40"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[#504f50]"
          >
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-[#e0d8ca] bg-[#fffdf8] px-3 py-2.5 text-[#1a1a1a] placeholder:text-[#b3aea8] focus:border-[#7a5c4a] focus:outline-none focus:ring-2 focus:ring-[#c0a493]/40"
          />
        </div>

        {state?.error && (
          <p className="rounded-md border border-[#e8cdc0] bg-[#faf0ec] p-3 text-sm text-[#9a4a3a]">
            {state.error}
          </p>
        )}

        <TurnstileField />

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#7a3f2a] px-4 py-2.5 text-white transition-colors hover:bg-[#5e2f1f] disabled:opacity-50"
        >
          {pending ? "登录中…" : "登录"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#8a8580]">
        还没有账号？{" "}
        <Link href="/register" className="text-[#7a3f2a] underline underline-offset-2 hover:text-[#1a1a1a]">
          去注册
        </Link>
      </p>
    </div>
  );
}
