import SiteShell from "@/components/SiteShell";
import { AiToolsDirectory } from "@/components/tools/AiToolsDirectory";
import { Container, EmptyState, PageHeading } from "@/components/ui";
import { getAiTools } from "@/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Kho tiện ích & Công cụ AI",
  description:
    "Bộ công cụ số, ứng dụng AI hỗ trợ hướng nghiệp, tra cứu đại học, thiết kế và sáng tạo nội dung.",
};

export default async function AiToolsPage() {
  const tools = await getAiTools();

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="Kho tiện ích"
          title="Công cụ nhỏ. Giá trị thiết thực."
          description="Tập hợp các ứng dụng AI và tiện ích số được thiết kế để hỗ trợ trực tiếp cho việc học tập, hướng nghiệp, thiết kế thương hiệu và tổ chức hoạt động."
        />

        {tools.length > 0 ? (
          <AiToolsDirectory tools={tools} />
        ) : (
          <EmptyState
            icon="✨"
            title="Kho tiện ích đang được cập nhật"
            hint="Các công cụ mới đang được hoàn thiện và sẽ sớm mở truy cập tại đây."
          />
        )}
      </Container>
    </SiteShell>
  );
}
