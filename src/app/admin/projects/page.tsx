import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { EmptyState, LinkButton, PageHeader } from "@/components/admin/ui";
import ProjectsTable from "./ProjectsTable";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const projects = (data ?? []) as Project[];

  return (
    <>
      <PageHeader
        title="Ứng dụng & Dự án"
        description={`${projects.length} dự án trong portfolio`}
        action={<LinkButton href="/admin/projects/new">+ Thêm mục mới</LinkButton>}
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error.message}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon="📂"
          title="Chưa có ứng dụng nào"
          description="Thêm dự án đầu tiên để hiển thị ngoài trang Portfolio."
          action={<LinkButton href="/admin/projects/new">+ Thêm mục mới</LinkButton>}
        />
      ) : (
        <ProjectsTable initial={projects} />
      )}
    </>
  );
}
