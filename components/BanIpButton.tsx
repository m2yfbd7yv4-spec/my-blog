"use client";

import { useActionState } from "react";
import { banIp } from "@/lib/actions/bans";

// 访客记录里每个 IP 旁边的「拉黑」快捷按钮
export function BanIpButton({ ip }: { ip: string }) {
  const [, formAction, pending] = useActionState(banIp, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`拉黑 IP「${ip}」？该 IP 将无法访问全站。`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="ip" value={ip} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {pending ? "拉黑中…" : "拉黑"}
      </button>
    </form>
  );
}
