import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import type { Category } from "@/lib/types";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const [catRes, postRes] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("posts").select("category_id"),
  ]);

  const categories = (catRes.data ?? []) as Category[];

  /**
   * Đếm ở đây thay vì gọi count riêng cho từng chuyên mục: một truy vấn nhẹ
   * vẫn nhanh hơn nhiều so với mười lượt đi về database.
   */
  const counts: Record<string, number> = {};
  for (const row of (postRes.data ?? []) as { category_id: string | null }[]) {
    if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }

  return (
    <>
      <PageHeader
        title="Chuyên mục"
        description="Phân loại bài viết. Bấm thẳng vào tên để đổi."
      />

      {catRes.error && (
        <div className="mb-6 rounded-card border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-700">
          {catRes.error.message}
          {catRes.error.message.includes("does not exist") && (
            <>
              {" "}
              — chạy file{" "}
              <code className="rounded bg-rose-100 px-1">
                supabase/v2-giao-dien-moi.sql
              </code>{" "}
              trong Supabase SQL Editor là xong.
            </>
          )}
        </div>
      )}

      {!catRes.error && <CategoryManager initial={categories} counts={counts} />}
    </>
  );
}
