"use client";

import { useEffect, useRef, useState } from "react";

// Cloudflare Turnstile 的全局对象（脚本加载后挂到 window.turnstile）
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      remove: (widgetId: string) => void;
      ready: (callback: () => void) => void;
    };
  }
}

// 公开的 site key（安全，可以出现在前端）
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// 人机验证组件：渲染 Turnstile，把拿到的 token 塞进隐藏字段 captchaToken
export function TurnstileField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    let widgetId: string | undefined;
    // 每个组件用唯一回调名，避免全局命名冲突
    const onloadName = `__turnstileOnload_${Math.random().toString(36).slice(2)}`;

    const render = () => {
      if (!containerRef.current || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: "light",
        callback: (token: string) => {
          if (inputRef.current) inputRef.current.value = token;
        },
        "expired-callback": () => {
          if (inputRef.current) inputRef.current.value = "";
        },
        "error-callback": () => setFailed(true),
      });
      // render 返回 undefined = 渲染失败（最常见：Cloudflare 里 hostname 没配当前域名）
      if (!widgetId) setFailed(true);
    };

    if (window.turnstile) {
      // API 已就绪（例如登录页跳注册页的客户端导航）：直接渲染
      render();
    } else {
      // 首次：注入脚本，用 onload 回调保证 API 就绪后再渲染
      (window as any)[onloadName] = render;
      const s = document.createElement("script");
      s.src = `${SCRIPT_URL}&onload=${onloadName}`;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }

    return () => {
      delete (window as any)[onloadName];
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, []);

  // 没配置 site key 时不渲染任何东西，表单照常可用（避免部署后误伤登录）
  if (!SITE_KEY) return null;

  return (
    <div className="min-h-[65px]">
      <div ref={containerRef} />
      <input ref={inputRef} type="hidden" name="captchaToken" value="" />
      {failed && (
        <p className="mt-1 text-xs text-red-600">
          人机验证加载失败，请刷新重试；若仍失败，请检查 Cloudflare 里该 widget 的域名（Hostname）是否包含当前域名。
        </p>
      )}
    </div>
  );
}
