import { createClient } from "@/lib/supabase/server";
import {
  FALLBACK_AI_TOOLS,
  FALLBACK_PROJECTS,
  FALLBACK_SETTINGS,
} from "@/lib/fallback";
import type { AiTool, Project, Settings } from "@/lib/types";
import { PageHeader } from "@/components/admin/ui";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [settingsRes, toolsRes, projectsRes] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("ai_tools")
      .select("id, title, status, link_url, published, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("projects")
      .select("id, title, link_url, published, featured, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const data = settingsRes.data;
  const row = (data ?? {}) as Partial<Settings>;
  const settings: Settings = {
    ...FALLBACK_SETTINGS,
    ...row,
    id: 1,
    social:
      row.social && typeof row.social === "object" ? row.social : {},
  };

  const tools =
    toolsRes.data && toolsRes.data.length > 0
      ? (toolsRes.data as AiTool[])
      : FALLBACK_AI_TOOLS;

  const projects =
    projectsRes.data && projectsRes.data.length > 0
      ? (projectsRes.data as Project[])
      : FALLBACK_PROJECTS;

  return (
    <>
      <PageHeader
        title="Cài đặt chung & Bố cục Trang chủ"
        description="Quản lý đồng bộ nội dung Hero, biểu tượng 3D LXT, 3 thẻ nổi bật, thứ tự các khối Trang chủ, thông tin liên hệ và SEO"
      />
      <SettingsForm
        settings={settings}
        exists={Boolean(data)}
        tools={tools}
        projects={projects}
      />
    </>
  );
}
