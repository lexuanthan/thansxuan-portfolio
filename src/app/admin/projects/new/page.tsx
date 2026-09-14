import { PageHeader } from "@/components/admin/ui";
import ProjectForm from "../ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        title="Thêm project"
        description="Tạo một dự án mới cho trang Portfolio"
      />
      <ProjectForm />
    </>
  );
}
