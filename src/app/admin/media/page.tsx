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
        title="Media library"
        description="Upload, xem và xoá ảnh dùng cho website"
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error.message}
        </div>
      )}

      <MediaLibrary initial={(data ?? []) as MediaItem[]} />
    </>
  );
}
