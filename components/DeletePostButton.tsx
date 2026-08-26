"use client";

import { useActionState } from "react";
import { deletePost } from "@/lib/actions/posts";

export function DeletePostButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionState(deletePost, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("确定删除这篇文章？此操作不可恢复。")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {pending ? "删除中…" : "删除"}
      </button>
    </form>
  );
}
