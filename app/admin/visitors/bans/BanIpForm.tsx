"use client";

import { useActionState } from "react";
import { banIp } from "@/lib/actions/bans";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {};

export function BanIpForm() {
  const [state, formAction, pending] = useActionState(banIp, initialState);
  const inputCls =
    "rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input name="ip" placeholder="例如 1.2.3.4" className={`${inputCls} w-40`} />
      <input
        name="reason"
        placeholder="原因（可选）"
        className={`${inputCls} min-w-40 flex-1`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "屏蔽中…" : "屏蔽 IP"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
