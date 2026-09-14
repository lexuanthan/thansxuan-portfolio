import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập · Admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl shadow-lg shadow-purple-900/40">
            🔐
          </div>
          <h1 className="mt-5 text-3xl font-bold text-white">Admin Panel</h1>
          <p className="mt-2 text-sm text-slate-400">
            Thế giới của Thân LX — khu vực quản trị
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur">
          <Suspense
            fallback={<div className="h-64 animate-pulse rounded-lg bg-white/5" />}
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Quên mật khẩu? Đổi trực tiếp trong Supabase Dashboard → Authentication → Users
        </p>
      </div>
    </div>
  );
}
