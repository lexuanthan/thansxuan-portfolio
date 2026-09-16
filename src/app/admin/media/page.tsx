import { createClient } from "@/lib/supabase/server";
import type { MediaItem } from "@/lib/types";
import { PageHeader } from "@/components/admin/ui";
import MediaLibrary from "./MediaLibrary";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Hình ảnh & Media"
        description="Upload, xem và xoá ảnh dùng cho website"
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error.message}
        </div>
      )}

      <MediaLibrary initial={(data ?? []) as MediaItem[]} />
    </>
  );
}
