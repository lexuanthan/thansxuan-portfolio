"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Xử lý điều hướng phía client cho các liên kết cũ dùng fragment `/#tra-cuu-dai-hoc`.
 * Vì URL hash (#...) không được trình duyệt gửi lên server trong HTTP request,
 * việc chuyển hướng phải thực hiện ở client và bảo toàn nguyên vẹn query string.
 */
export default function HashRedirectListener() {
  const router = useRouter();

  useEffect(() => {
    function checkHash() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.toLowerCase();
      if (hash === "#tra-cuu-dai-hoc" || hash.startsWith("#tra-cuu-dai-hoc?")) {
        const search = window.location.search || "";
        router.replace(`/ai-tools/tra-cuu-dai-hoc${search}`);
      }
    }

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [router]);

  return null;
}
