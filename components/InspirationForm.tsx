"use client";

import { useActionState, useEffect, useRef } from "react";
import { addInspiration } from "@/lib/actions/inspirations";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

// 灵感记录表单（仅站长可见）：下划线文字输入 + 可选配图上传 + 记录按钮
export function InspirationForm() {
  const [state, formAction, pending] = useActionState(
    addInspiration,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // 记录成功后清空表单（含已选的图片）
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-12 border-t border-[#e8e6e1] pt-8">
      <div className="flex items-end gap-4">
        <input
          name="content"
          required
          maxLength={500}
          placeholder="记录此刻的灵感…"
          className="flex-1 bg-transparent border-b border-[#e8e6e1] py-2 text-[#1a1a1a] placeholder-[#b3aea8] outline-none focus:border-[#7a5c4a]"
        />
        <button
          type="submit"
          disabled={pending}
          className="font-display shrink-0 text-sm uppercase tracking-[0.15em] text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 hover:text-[#7a5c4a] hover:border-[#7a5c4a] disabled:opacity-50"
        >
          {pending ? "记录中…" : "记录"}
        </button>
      </div>

      <label className="mt-4 flex items-center gap-3 text-sm text-[#8a8580]">
        <span className="shrink-0">配图（可选）</span>
        <input
          type="file"
          name="image"
          accept="image/*"
          className="text-xs text-[#8a8580] file:mr-3 file:rounded-full file:border-0 file:bg-[#efe9de] file:px-3 file:py-1 file:text-xs file:text-[#7a5c4a]"
        />
      </label>

      {state?.error && (
        <p className="mt-3 text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="mt-3 text-sm text-[#7a5c4a]">{state.success}</p>
      )}
    </form>
  );
}
