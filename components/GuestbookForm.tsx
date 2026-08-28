"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitGuestbookMessage } from "@/lib/actions/guestbook";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

// 留言板发送表单：内嵌在首页留言板区块，极简编辑风
export function GuestbookForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [state, formAction, pending] = useActionState(
    submitGuestbookMessage,
    initialState,
  );

  return (
    <section className="mt-10 border-t border-[#a06a66] pt-8">
      <div className="max-w-2xl mx-auto">
        {isLoggedIn ? (
          <form action={formAction} className="flex items-end gap-4">
            {/* 蜜罐字段：对用户隐藏，机器人会填 */}
            <div className="hidden" aria-hidden="true">
              <label>
                网站
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>
            <input
              name="content"
              required
              maxLength={200}
              placeholder="說點什麼，飄上屏幕…"
              className="flex-1 bg-transparent border-b border-[#a06a66] py-2 text-[#2b1414] placeholder-[#6b3b38] outline-none focus:border-[#7a3533]"
            />
            <button
              type="submit"
              disabled={pending}
              className="font-display shrink-0 text-sm uppercase tracking-[0.15em] text-[#2b1414] border-b border-[#2b1414] pb-1 hover:text-[#7a3533] hover:border-[#7a3533] disabled:opacity-50"
            >
              {pending ? "發送中…" : "發送"}
            </button>
          </form>
        ) : (
          <p className="text-center text-sm text-[#6b3b38]">
            <Link
              href="/login"
              className="text-[#7a3533] underline underline-offset-4"
            >
              登錄
            </Link>{" "}
            後即可留言
          </p>
        )}
        {state?.error && (
          <p className="mt-3 text-sm text-red-800">{state.error}</p>
        )}
        {state?.success && (
          <p className="mt-3 text-sm text-[#7a3533]">{state.success}</p>
        )}
      </div>
    </section>
  );
}
