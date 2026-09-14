import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Sidebar from "./_components/Sidebar";

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-200">
          <h1 className="mb-2 text-lg font-bold">Chưa cấu hình Supabase</h1>
          <p className="text-sm leading-relaxed">
            Thêm <code>NEXT_PUBLIC_SUPABASE_URL</code> và{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> vào file{" "}
            <code>.env.local</code> (local) và vào Environment Variables trên
            Vercel, sau đó khởi động lại.
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
    <div className="min-h-screen bg-slate-900 lg:flex">
      <Sidebar email={user.email ?? "admin"} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
