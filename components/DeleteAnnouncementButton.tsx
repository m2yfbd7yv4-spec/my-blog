"use client";

import { useActionState } from "react";
import { deleteAnnouncement } from "@/lib/actions/announcements";

export function DeleteAnnouncementButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionState(deleteAnnouncement, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("确定删除这条公告？此操作不可恢复。")) {
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
