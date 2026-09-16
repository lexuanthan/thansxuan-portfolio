import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import type { Service } from "@/lib/types";
import ServiceManager from "./ServiceManager";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  const services = ((data ?? []) as Service[]).map((s) => ({
    ...s,
    bullets: Array.isArray(s.bullets) ? s.bullets : [],
  }));

  return (
    <>
      <PageHeader
        title="Tư vấn & Hỗ trợ"
        description="Các mảng anh nhận đồng hành, hiện ở trang Tư vấn và tóm tắt ngoài trang chủ."
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

      {!error && <ServiceManager initial={services} />}
    </>
  );
}
