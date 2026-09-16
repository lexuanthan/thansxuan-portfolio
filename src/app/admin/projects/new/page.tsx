import { PageHeader } from "@/components/admin/ui";
import ProjectForm from "../ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        title="Thêm ứng dụng / dự án"
        description="Tạo một dự án mới cho trang Portfolio"
      />
      <ProjectForm />
    </>
  );
}
