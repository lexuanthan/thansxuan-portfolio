import fs from "fs";
import path from "path";
import { PageHeader, LinkButton } from "@/components/admin/ui";
import { getActiveCareerConfig } from "@/lib/career-guidance/configManager";
import CareerGuidanceAdminClient from "./CareerGuidanceAdminClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quản trị AI Hướng nghiệp — Lê Xuân Thân",
  description: "Trung tâm can thiệp và điều phối công cụ AI Hướng nghiệp & Ra quyết định",
};

export default async function AdminCareerGuidancePage() {
  const config = getActiveCareerConfig();

  // Đọc danh sách leads từ file backup nếu có
  let leads: any[] = [];
  try {
    const leadsPath = path.join(process.cwd(), "src", "data", "career_leads.json");
    if (fs.existsSync(leadsPath)) {
      leads = JSON.parse(fs.readFileSync(leadsPath, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading local leads:", e);
  }

  return (
    <>
      <PageHeader
        title="Quản Trị AI Hướng Nghiệp"
        description="Trung tâm điều phối: Can thiệp trí tuệ AI Coach, tinh chỉnh trọng số thuật toán, ưu tiên nghề nghiệp & theo dõi hồ sơ học sinh"
        action={
          <div className="flex items-center gap-2">
            <LinkButton href="/ai-tools/career-guidance" variant="ghost" external>
              Mở Tool Công Khai ↗
            </LinkButton>
            <LinkButton href="/admin/ai-tools">Quản Lý Danh Mục Tool</LinkButton>
          </div>
        }
      />

      <CareerGuidanceAdminClient initialConfig={config} initialLeads={leads} />
    </>
  );
}
