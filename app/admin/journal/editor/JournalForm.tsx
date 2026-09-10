"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveJournalEntry } from "@/lib/actions/journal";
import { JOURNAL_CATEGORIES, JOURNAL_SUBCATEGORIES } from "@/lib/journal";
import type {
  ActionState,
  JournalCategory,
  JournalEntry,
  JournalSubcategory,
} from "@/lib/types";

const initialState: ActionState = {};

export function JournalForm({ initial }: { initial: JournalEntry | null }) {
  const [state, formAction, pending] = useActionState(
    saveJournalEntry,
    initialState,
  );

  const [category, setCategory] = useState<JournalCategory>(
    initial?.category ?? "experience",
  );
  const [subcategory, setSubcategory] = useState<JournalSubcategory>(
    initial?.subcategory ?? "work",
  );

  const subOptions = JOURNAL_SUBCATEGORIES[category] ?? [];

  const inputCls =
    "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {initial ? "编辑手记" : "新增手记"}
        </h1>
        <Link
          href="/admin/journal"
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
            placeholder="标题"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              分类
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => {
                const next = e.target.value as JournalCategory;
                setCategory(next);
                setSubcategory(JOURNAL_SUBCATEGORIES[next][0].value);
              }}
              className={inputCls}
            >
              {JOURNAL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="subcategory"
              className="block text-sm font-medium mb-1"
            >
              子分类
            </label>
            <select
              id="subcategory"
              name="subcategory"
              value={subcategory}
              onChange={(e) =>
                setSubcategory(e.target.value as JournalSubcategory)
              }
              className={inputCls}
            >
              {subOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="published_at"
            className="block text-sm font-medium mb-1"
          >
            日期（留空用今天）
          </label>
          <input
            id="published_at"
            name="published_at"
            type="date"
            defaultValue={
              initial?.published_at ? initial.published_at.slice(0, 10) : ""
            }
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium mb-1">
            一句话摘要
          </label>
          <textarea
            id="summary"
            name="summary"
            defaultValue={initial?.summary ?? ""}
            required
            maxLength={500}
            rows={2}
            className={inputCls}
            placeholder="用于列表卡片和首页滚动条展示的一句话"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            正文
          </label>
          <textarea
            id="content"
            name="content"
            defaultValue={initial?.content ?? ""}
            required
            rows={10}
            className={inputCls}
            placeholder="完整内容（工作/学习经历或干货分享）"
          />
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium mb-1">
            外链（可选）
          </label>
          <input
            id="link"
            name="link"
            defaultValue={initial?.link ?? ""}
            className={inputCls}
            placeholder="https://…"
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
