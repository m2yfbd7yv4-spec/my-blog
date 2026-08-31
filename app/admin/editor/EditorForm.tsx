"use client";

import { useRef, useState, useActionState, useMemo } from "react";
import Link from "next/link";
import { savePost } from "@/lib/actions/posts";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import type { ActionState, Post } from "@/lib/types";

const initialState: ActionState = {};

// —— 封面图压缩：浏览器端把大图压小，减小首页加载体积与存储/带宽占用 ——
const MAX_COVER_EDGE = 1600; // 最长边
const COMPRESS_QUALITY = 0.85;
const MAX_COVER_BYTES = 4 * 1024 * 1024; // 压缩目标：体积超过 4MB 就压
const MAX_SOURCE_BYTES = 30 * 1024 * 1024; // 原图兜底：超过 30MB 才拦，其余交给自动压缩

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片读取失败"));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function extFromType(type: string, fallback: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[type] || fallback;
}

// GIF 动图不压（会丢动画）；压缩失败或没变小就用原图，绝不阻断上传
async function compressImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("图片读取失败"));
      r.readAsDataURL(file);
    });
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, MAX_COVER_EDGE / Math.max(img.width, img.height));
    // 触发压缩：尺寸超长边，或体积超过 4MB（如大 PNG 截图）
    if (scale >= 1 && file.size <= MAX_COVER_BYTES) return file;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await canvasToBlob(canvas, "image/jpeg", COMPRESS_QUALITY);
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function EditorForm({ initialPost }: { initialPost: Post | null }) {
  const [state, formAction, pending] = useActionState(savePost, initialState);
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialPost);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initialPost?.cover_image ?? "");
  const [coverFilePreview, setCoverFilePreview] = useState<string | null>(null);
  const [coverFileError, setCoverFileError] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [category, setCategory] = useState(
    initialPost?.category ?? DEFAULT_CATEGORY,
  );
  const [featured, setFeatured] = useState(initialPost?.featured ?? false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // 封面图直传 Supabase Storage：绕过 Vercel 请求体 4.5MB 上限，大图不再 500
  async function uploadCover(file: File) {
    setCoverUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("登录已过期，请重新登录");
      const toUpload = await compressImage(file);
      const ext = extFromType(
        toUpload.type,
        (file.name.split(".").pop() || "jpg").toLowerCase(),
      );
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("posts")
        .upload(path, toUpload, { contentType: toUpload.type });
      if (upErr) throw upErr;
      const url = supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
      setCoverImage(url);
    } catch (err) {
      setCoverFileError(
        "封面图上传失败：" + (err instanceof Error ? err.message : "未知错误"),
      );
      setCoverFilePreview(null);
      setCoverFileName(null);
    } finally {
      setCoverUploading(false);
    }
  }

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
            封面图（可选）
          </label>
          <input
            id="coverImage"
            name="coverImage"
            value={coverImage}
            onChange={(e) => {
              setCoverImage(e.target.value);
              setCoverFilePreview(null);
              setCoverFileError(null);
              setCoverFileName(null);
              if (coverFileRef.current) coverFileRef.current.value = "";
            }}
            className={inputCls}
            placeholder="粘贴图片链接，或点下方「从访达选择」上传"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
              从访达选择图片
              <input
                ref={coverFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={coverUploading}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) {
                    setCoverFilePreview(null);
                    setCoverFileError(null);
                    setCoverFileName(null);
                    return;
                  }
                  const ok = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                  ];
                  if (!ok.includes(f.type)) {
                    setCoverImage("");
                    setCoverFilePreview(null);
                    setCoverFileName(null);
                    setCoverFileError(
                      f.type === "image/heic" ||
                        f.type === "image/heif" ||
                        /\.heic$/i.test(f.name)
                        ? "这是 HEIC 格式，多数浏览器（如 Chrome）打不开。请用「预览」把照片导出为 JPG 后再上传。"
                        : `不支持的图片格式（${f.type || f.name}），请改用 JPG / PNG / WebP / GIF。`,
                    );
                    if (coverFileRef.current) coverFileRef.current.value = "";
                    return;
                  }
                  // 超大兜底（30MB）：正常照片都交给自动压缩，只有异常大的文件才拦
                  if (f.size > MAX_SOURCE_BYTES) {
                    setCoverFileError("图片过大（超过 30MB），请换一张图。");
                    setCoverFilePreview(null);
                    setCoverFileName(null);
                    if (coverFileRef.current) coverFileRef.current.value = "";
                    return;
                  }
                  setCoverFileError(null);
                  setCoverFileName(f.name);
                  setCoverFilePreview(URL.createObjectURL(f));
                  setCoverImage("");
                  void uploadCover(f);
                }}
              />
            </label>
            {coverFileError && (
              <span className="text-xs text-red-600">{coverFileError}</span>
            )}
            {coverUploading && (
              <span className="text-xs text-indigo-600">封面图上传中…</span>
            )}
            {!coverUploading && !coverFileError && coverFilePreview && (
              <span className="text-xs text-gray-500">
                已上传：{coverFileName}，提交后会用这张图作封面
              </span>
            )}
          </div>
          {coverFilePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverFilePreview}
              alt="封面预览"
              className="mt-2 h-32 w-auto rounded-md border border-gray-200 object-cover"
            />
          )}
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
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            推荐（在首页推荐板块展示）
          </label>
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
            disabled={pending || coverUploading}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {pending ? "保存中…" : "保存草稿"}
          </button>
          <button
            type="submit"
            name="action"
            value="publish"
            disabled={pending || coverUploading}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            {pending ? "发布中…" : "发布"}
          </button>
        </div>
      </form>
    </div>
  );
}
