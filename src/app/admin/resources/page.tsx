import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import type { Resource } from "@/lib/types";
import ResourceManager from "./ResourceManager";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const resources = ((data ?? []) as Resource[]).map((r) => ({
    ...r,
    tags: Array.isArray(r.tags) ? r.tags : [],
  }));

  return (
    <>
      <PageHeader
        title="Tài nguyên"
        description="Công cụ, mẫu tài liệu và nguồn học chia sẻ ngoài trang Tài nguyên."
      />

      {error && (
        <div className="mb-6 rounded-card border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-700">
          {error.message}
          {error.message.includes("does not exist") && (
            <>
              {" "}
              — chạy file{" "}
              <code className="rounded bg-rose-100 px-1">
                supabase/v2-giao-dien-moi.sql
              </code>{" "}
              trong Supabase SQL Editor là xong.
            </>
          )}
        </div>
      )}

      {!error && <ResourceManager initial={resources} />}
    </>
  );
}
