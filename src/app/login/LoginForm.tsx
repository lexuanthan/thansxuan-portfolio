"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Chưa cấu hình Supabase. Kiểm tra NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Email hoặc mật khẩu không đúng."
            : signInError.message
        );
        setLoading(false);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-ink-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ban@example.com"
          className="w-full rounded-lg border border-line bg-surface-soft px-4 py-3 text-ink-900 placeholder-ink-400 outline-none transition focus:border-brand-400 focus:bg-surface"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-ink-700"
        >
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-line bg-surface-soft px-4 py-3 pr-20 text-ink-900 placeholder-ink-400 outline-none transition focus:border-brand-400 focus:bg-surface"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-500 hover:text-brand-700"
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-400 px-4 py-3 font-semibold text-ink-900 shadow-brand transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>

      <Link
        href="/"
        className="block text-center text-sm text-ink-500 transition hover:text-brand-700"
      >
        ← Về trang chủ
      </Link>
    </form>
  );
}
