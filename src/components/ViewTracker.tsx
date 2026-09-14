"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Ghi nhận lượt xem mỗi khi đổi route (bỏ qua /admin và /login). */
export default function ViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const controller = new AbortController();
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      /* im lặng — tracking không được phép làm hỏng trang */
    });

    return () => controller.abort();
  }, [pathname]);

  return null;
}
