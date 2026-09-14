import { PageHeader } from "@/components/admin/ui";
import ToolForm from "../ToolForm";

export default function NewToolPage() {
  return (
    <>
      <PageHeader title="Thêm AI Tool" description="Tạo một tool mới cho trang AI Tools" />
      <ToolForm />
    </>
  );
}
