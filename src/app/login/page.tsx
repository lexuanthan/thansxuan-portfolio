import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { BrandMark } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Đăng nhập · Quản trị",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-100 via-page to-brand-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex">
            <BrandMark className="h-14 w-14" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Khu vực quản trị</h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Đăng nhập để quản lý nội dung website
          </p>
        </div>

        <div className="rounded-card-lg border border-line bg-surface p-6 shadow-soft sm:p-8">
          <Suspense
            fallback={
              <div className="h-64 animate-pulse rounded-xl bg-surface-soft" />
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-ink-400">
          Quên mật khẩu? Đổi trực tiếp trong Supabase Dashboard → Authentication → Users
        </p>
      </div>
    </div>
  );
}
