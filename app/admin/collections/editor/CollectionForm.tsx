"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveCollection } from "@/lib/actions/collections";
import { categoryLabel } from "@/lib/categories";
import type { ActionState, Collection } from "@/lib/types";

const initialState: ActionState = {};

type PickerPost = {
  id: string;
  title: string;
  category: string;
  published_at: string | null;
};

export function CollectionForm({
  initial,
  posts,
  initialPostIds,
}: {
  initial: Collection | null;
  posts: PickerPost[];
  initialPostIds: string[];
}) {
  const [state, formAction, pending] = useActionState(
    saveCollection,
    initialState,
  );

  const inputCls =
    "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const initialSet = new Set(initialPostIds);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {initial ? "编辑合集" : "新增合集"}
        </h1>
        <Link
          href="/admin/collections"
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          返回
        </Link>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={initial?.id ?? ""} />

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            名称
          </label>
          <input
            id="name"
            name="name"
            defaultValue={initial?.name ?? ""}
            required
            maxLength={60}
            className={inputCls}
            placeholder="例如：读书合集"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            简介（可选）
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={initial?.description ?? ""}
            rows={3}
            className={inputCls}
            placeholder="一句话说明这个合集"
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">加入合集的文章</p>
          {posts.length > 0 ? (
            <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border border-gray-200 p-3">
              {posts.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    name="post_ids"
                    value={p.id}
                    defaultChecked={initialSet.has(p.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {categoryLabel(p.category)}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-gray-200 p-3 text-sm text-gray-400">
              还没有已发布的文章，先去写文章吧。
            </p>
          )}
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
