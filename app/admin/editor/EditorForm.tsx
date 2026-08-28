"use client";

import { useRef, useState, useActionState } from "react";
import Link from "next/link";
import { savePost } from "@/lib/actions/posts";
import { slugify } from "@/lib/utils";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import type { ActionState, Post } from "@/lib/types";

const initialState: ActionState = {};

export function EditorForm({ initialPost }: { initialPost: Post | null }) {
  const [state, formAction, pending] = useActionState(savePost, initialState);
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialPost);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [category, setCategory] = useState(
    initialPost?.category ?? DEFAULT_CATEGORY,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  // 在光标处插入 Markdown 语法，若选中文字则包裹
  function insertMarkdown(before: string, after = "", placeholder = "") {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? content.length;
    const end = ta.selectionEnd ?? content.length;
    const selected = content.slice(start, end) || placeholder;
    const next =
      content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  }

  const tools = [
    { label: "H2", run: () => insertMarkdown("\n## ", "") },
    { label: "加粗", run: () => insertMarkdown("**", "**", "加粗文字") },
    { label: "斜体", run: () => insertMarkdown("*", "*", "斜体文字") },
    { label: "引用", run: () => insertMarkdown("\n> ", "") },
    { label: "代码", run: () => insertMarkdown("`", "`", "代码") },
    { label: "链接", run: () => insertMarkdown("[", "](https://)", "链接文字") },
    { label: "图片", run: () => insertMarkdown("![", "](图片地址)", "图片描述") },
    { label: "列表", run: () => insertMarkdown("\n- ", "") },
  ];

  const inputCls =
    "w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {initialPost ? "编辑文章" : "写新文章"}
        </h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-indigo-600">
          返回
        </Link>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={initialPost?.id ?? ""} />

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            标题
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            required
            className={inputCls}
            placeholder="文章标题"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            网址（slug）
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className={`${inputCls} font-mono text-sm`}
            placeholder="留空则根据标题自动生成，如 hello-world"
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
            摘要（可选，显示在首页）
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium mb-1">
            封面图链接（可选）
          </label>
          <input
            id="coverImage"
            name="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className={inputCls}
            placeholder="https://…"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            分类
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="content" className="text-sm font-medium">
              正文（支持 Markdown）
            </label>
            <div className="flex flex-wrap gap-1">
              {tools.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={t.run}
                  className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <textarea
              ref={textareaRef}
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              required
              className={`${inputCls} font-mono text-sm`}
              placeholder={"# 标题\n\n正文…"}
            />
            <div className="max-h-[420px] overflow-y-auto rounded-md border border-gray-200 bg-white p-4">
              <p className="mb-2 text-xs text-gray-400">预览</p>
              {content ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-gray-300">在这里预览…</p>
              )}
            </div>
          </div>
        </div>

        {state?.error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            name="action"
            value="draft"
            disabled={pending}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {pending ? "保存中…" : "保存草稿"}
          </button>
          <button
            type="submit"
            name="action"
            value="publish"
            disabled={pending}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {pending ? "发布中…" : "发布"}
          </button>
        </div>
      </form>
    </div>
  );
}
