"use client";

import { useActionState } from "react";
import { deleteTag } from "@/lib/actions/tags";

export function DeleteTagButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionState(deleteTag, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("确定删除这个标签？文章不会被删除。")) {
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
