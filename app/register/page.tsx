"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/types";
import { PageTransition } from "@/components/PageTransition";
import { FeatureParticles } from "@/components/effects/FeatureParticles";
import { TurnstileField } from "@/components/TurnstileField";

const initialState: ActionState = {};

const inputCls =
  "w-full rounded-md border border-[#e0d8ca] bg-[#fffdf8] px-3 py-2.5 text-[#1a1a1a] placeholder:text-[#b3aea8] focus:border-[#7a5c4a] focus:outline-none focus:ring-2 focus:ring-[#c0a493]/40";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <PageTransition>
      <div>
        {/* 背景：桌面截图铺满 + 流动粒子（与登录页一致） */}
        <div className="login-bg" aria-hidden="true" />
        <FeatureParticles sparkle />

        <div className="panel-rise relative z-10 max-w-md mx-auto mt-24 mb-16">
          <div className="ink-panel-bg" aria-hidden="true" />
          <div className="relative z-10 px-8 py-10 md:px-12 md:py-12">
            <p className="font-display text-4xl md:text-5xl text-[#1a1a1a]">
              Register
            </p>
            <h1 className="mt-4 text-xs uppercase tracking-[0.35em] text-[#8a8580]">
              注册账号
            </h1>

            {state?.success ? (
              <p className="mt-6 rounded-md border border-[#cfe0d0] bg-[#eef5ee] p-3 text-sm text-[#3a6b4a]">
                {state.success}
              </p>
            ) : (
              <form action={formAction} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-medium text-[#504f50]"
                  >
                    昵称（可选）
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className={inputCls}
                  />
                </div>
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
                    className={inputCls}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#504f50]"
                  >
                    密码（至少 8 位）
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm"
                    className="mb-2 block text-sm font-medium text-[#504f50]"
                  >
                    确认密码
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    className={inputCls}
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
                  {pending ? "注册中…" : "注册"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-[#8a8580]">
              已有账号？{" "}
              <Link
                href="/login"
                className="text-[#7a3f2a] underline underline-offset-2 hover:text-[#1a1a1a]"
              >
                去登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
