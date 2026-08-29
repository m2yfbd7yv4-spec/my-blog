"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitComment } from "@/lib/actions/comments";
import { formatDate } from "@/lib/utils";
import type { ActionState, CommentDisplay } from "@/lib/types";
import { PaperCard } from "@/components/effects/PaperCard";

const initialState: ActionState = {};

export function CommentSection({
  postId,
  isLoggedIn,
  comments,
}: {
  postId: string;
  isLoggedIn: boolean;
  comments: CommentDisplay[];
}) {
  const [state, formAction, pending] = useActionState(
    submitComment,
    initialState,
  );

  return (
    <section className="mt-10 max-w-xl mx-auto">
      <h2 className="text-lg font-semibold mb-5 text-[#3d2b1f]">
        评论（{comments.length}）
      </h2>

      {isLoggedIn ? (
        <div className="relative mb-8">
          <div className="washi-tape-bg" aria-hidden="true" />
          <div className="relative z-10 p-5 md:p-6">
            <form action={formAction} className="space-y-3">
              <input type="hidden" name="postId" value={postId} />
              {/* 蜜罐字段：对用户隐藏，机器人会填写 */}
              <div className="hidden" aria-hidden="true">
                <label>
                  网站
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <textarea
                name="content"
                required
                maxLength={2000}
                rows={4}
                placeholder="写下你的评论…"
                className="w-full bg-transparent px-3 py-2 text-sm focus:outline-none"
              />
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              {state?.success && (
                <p className="text-sm text-green-600">{state.success}</p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="paper-btn px-4 py-2 text-sm text-[#3d2b1f] hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "提交中…" : "发表评论"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p className="mb-8 text-sm text-[#8a8580]">
          <Link href="/login" className="text-[#7a5b3a] underline underline-offset-4">
            登录
          </Link>{" "}
          后即可发表评论。
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-[#8a8580]">还没有评论，来抢沙发吧。</p>
      ) : (
        <ul className="space-y-5">
          {comments.map((c) => (
            <li key={c.id}>
              <PaperCard>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#3d2b1f]">
                    {c.profiles?.username || "用户"}
                  </span>
                  <time className="text-[#a98a86]">{formatDate(c.created_at)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[#2b1a10]">{c.content}</p>
              </PaperCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
