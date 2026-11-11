"use client";

import { useActionState } from "react";
import { deleteCollection } from "@/lib/actions/collections";

export function DeleteCollectionButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionState(deleteCollection, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("确定删除这个合集？合集里的文章不会被删除。")) {
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
