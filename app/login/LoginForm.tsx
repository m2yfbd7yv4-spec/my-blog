"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
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
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>

      {verified && (
        <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          邮箱验证成功，请登录。
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "登录中…" : "登录"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        还没有账号？{" "}
        <Link href="/register" className="text-indigo-600">
          去注册
        </Link>
      </p>
    </div>
  );
}
