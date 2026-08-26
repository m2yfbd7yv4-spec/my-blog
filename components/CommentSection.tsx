"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitComment } from "@/lib/actions/comments";
import { formatDate } from "@/lib/utils";
import type { ActionState, CommentDisplay } from "@/lib/types";

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
    <section className="mt-12">
      <h2 className="text-xl font-bold mb-4">评论（{comments.length}）</h2>

      {isLoggedIn ? (
        <form action={formAction} className="mb-8 space-y-3">
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "提交中…" : "发表评论"}
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-gray-500">
          <Link href="/login" className="text-indigo-600">
            登录
          </Link>{" "}
          后即可发表评论。
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-gray-400">还没有评论，来抢沙发吧。</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-800">
                  {c.profiles?.username || "用户"}
                </span>
                <time className="text-gray-400">{formatDate(c.created_at)}</time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-gray-700">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
