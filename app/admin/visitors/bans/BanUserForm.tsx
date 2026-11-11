"use client";

import { useActionState } from "react";
import { banUser } from "@/lib/actions/bans";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export function BanUserForm({
  users,
}: {
  users: { id: string; username: string }[];
}) {
  const [state, formAction, pending] = useActionState(banUser, initialState);
  const inputCls =
    "rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <select name="user_id" className={inputCls} defaultValue="">
        <option value="" disabled>
          选择要拉黑的用户…
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>
      <input
        name="reason"
        placeholder="原因（可选）"
        className={`${inputCls} min-w-40 flex-1`}
      />
      <button
        type="submit"
        disabled={pending || users.length === 0}
        className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "拉黑中…" : "拉黑用户"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
      {users.length === 0 && (
        <p className="w-full text-sm text-gray-400">
          没有可拉黑的用户（都在列表里了）。
        </p>
      )}
    </form>
  );
}
