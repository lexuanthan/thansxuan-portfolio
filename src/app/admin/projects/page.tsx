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
        title="Projects"
        description={`${projects.length} dự án trong portfolio`}
        action={<LinkButton href="/admin/projects/new">+ Thêm project</LinkButton>}
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error.message}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon="📂"
          title="Chưa có project nào"
          description="Thêm dự án đầu tiên để hiển thị ngoài trang Portfolio."
          action={<LinkButton href="/admin/projects/new">+ Thêm project</LinkButton>}
        />
      ) : (
        <ProjectsTable initial={projects} />
      )}
    </>
  );
}
