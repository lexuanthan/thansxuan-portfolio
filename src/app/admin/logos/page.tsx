import { createClient } from "@/lib/supabase/server";
import type { MediaItem } from "@/lib/types";
import { PageHeader } from "@/components/admin/ui";
import LogoManager from "./LogoManager";

export const dynamic = "force-dynamic";

export default async function AdminLogosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("is_logo", true)
    .order("name", { ascending: true });

  const missingColumn = error?.message?.includes("is_logo");

  return (
    <>
      <PageHeader
        title="Logo có sẵn"
        description="Bộ logo hiện trong tool Ghép logo & chữ lên ảnh"
      />

      {missingColumn ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-800">
          <p className="mb-2 font-semibold">Chưa chạy SQL cài đặt</p>
          <p className="leading-relaxed">
            Mở file <code>supabase/add-logo-flag.sql</code> bằng Notepad, copy toàn
            bộ, dán vào Supabase → SQL Editor → Run. Sau đó tải lại trang này.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error.message}
        </div>
      ) : (
        <LogoManager initial={(data ?? []) as MediaItem[]} />
      )}
    </>
  );
}
