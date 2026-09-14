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
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">
          <p className="mb-2 font-semibold">Chưa chạy SQL cài đặt</p>
          <p className="leading-relaxed">
            Mở file <code>supabase/add-logo-flag.sql</code> bằng Notepad, copy toàn
            bộ, dán vào Supabase → SQL Editor → Run. Sau đó tải lại trang này.
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error.message}
        </div>
      ) : (
        <LogoManager initial={(data ?? []) as MediaItem[]} />
      )}
    </>
  );
}
