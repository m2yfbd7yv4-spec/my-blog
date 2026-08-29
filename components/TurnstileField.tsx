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

let scriptPromise: Promise<void> | null = null;

// 只加载一次 Turnstile 脚本（登录/注册页跳转时复用）
function loadTurnstile(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // 脚本加载失败也不阻塞表单提交
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// 人机验证组件：渲染 Turnstile，把拿到的 token 塞进隐藏字段 captchaToken
export function TurnstileField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    let widgetId: string | undefined;
    let cancelled = false;

    loadTurnstile().then(() => {
      if (cancelled || !containerRef.current) return;
      window.turnstile?.ready(() => {
        if (cancelled || !containerRef.current) return;
        widgetId = window.turnstile!.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: "light",
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      });
    });

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, []);

  // 没配置 site key 时不渲染任何东西，表单照常可用（避免部署后误伤登录）
  if (!SITE_KEY) return null;

  return (
    <div className="min-h-[65px]">
      <div ref={containerRef} />
      <input type="hidden" name="captchaToken" value={token} />
    </div>
  );
}
