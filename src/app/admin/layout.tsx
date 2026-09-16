import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Sidebar from "./_components/Sidebar";

export const metadata: Metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-6">
        <div className="max-w-lg rounded-card border border-brand-200 bg-brand-50 p-6">
          <h1 className="mb-2 text-lg font-bold text-ink-900">Chưa cấu hình Supabase</h1>
          <p className="text-sm leading-relaxed text-ink-700">
            Thêm <code className="rounded bg-brand-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            và{" "}
            <code className="rounded bg-brand-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            vào file <code className="rounded bg-brand-100 px-1">.env.local</code> (khi chạy
            ở máy) và vào Environment Variables trên Vercel, sau đó khởi động lại.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  return (
    <div className="min-h-screen bg-page text-ink-900 lg:flex">
      <Sidebar email={user.email ?? "admin"} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
