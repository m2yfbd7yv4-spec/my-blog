"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveAnnouncement } from "@/lib/actions/announcements";
import type { ActionState, Announcement } from "@/lib/types";

const initialState: ActionState = {};

export function AnnouncementForm({
  initial,
}: {
  initial: Announcement | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveAnnouncement,
    initialState,
  );

  const inputCls =
    "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {initial ? "编辑公告" : "新增公告"}
        </h1>
        <Link
          href="/admin/announcements"
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          返回
        </Link>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={initial?.id ?? ""} />

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            标题
          </label>
          <input
            id="title"
            name="title"
            defaultValue={initial?.title ?? ""}
            required
            maxLength={200}
            className={inputCls}
            placeholder="公告标题"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            内容
          </label>
          <textarea
            id="content"
            name="content"
            defaultValue={initial?.content ?? ""}
            required
            maxLength={2000}
            rows={6}
            className={inputCls}
            placeholder="公告内容"
          />
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "保存中…" : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
