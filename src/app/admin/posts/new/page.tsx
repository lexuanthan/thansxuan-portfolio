import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import type { Category } from "@/lib/types";
import PostForm from "../PostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <>
      <PageHeader
        title="Viết bài mới"
        description="Lưu dạng nháp trước cũng được, khi nào ưng thì bật xuất bản."
      />
      <PostForm categories={(data ?? []) as Category[]} />
    </>
  );
}
