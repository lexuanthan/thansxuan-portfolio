import { createClient } from "@/lib/supabase/server";
import type { AiTool } from "@/lib/types";
import { EmptyState, LinkButton, PageHeader } from "@/components/admin/ui";
import ToolsTable from "./ToolsTable";

export const dynamic = "force-dynamic";

export default async function AdminAiToolsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_tools")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const tools = (data ?? []) as AiTool[];

  return (
    <>
      <PageHeader
        title="Tool AI"
        description={`${tools.length} tool trong danh mục`}
        action={<LinkButton href="/admin/ai-tools/new">+ Thêm công cụ</LinkButton>}
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error.message}
        </div>
      )}

      {tools.length === 0 ? (
        <EmptyState
          icon="🤖"
          title="Chưa có công cụ nào"
          description="Thêm công cụ đầu tiên để hiển thị ngoài trang AI Tools."
          action={<LinkButton href="/admin/ai-tools/new">+ Thêm công cụ</LinkButton>}
        />
      ) : (
        <ToolsTable initial={tools} />
      )}
    </>
  );
}
