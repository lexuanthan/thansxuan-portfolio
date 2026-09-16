import { createClient } from "@/lib/supabase/server";
import { EmptyState, LinkButton, PageHeader } from "@/components/admin/ui";
import { flattenPost } from "@/lib/queries";
import PostsTable from "./PostsTable";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, categories(name)")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const posts = ((data ?? []) as Record<string, unknown>[]).map(flattenPost);
  const published = posts.filter((p) => p.published).length;

  return (
    <>
      <PageHeader
        title="Bài viết"
        description={
          posts.length > 0
            ? `${posts.length} bài · ${published} đã xuất bản · ${posts.length - published} nháp`
            : "Nơi viết và quản lý toàn bộ bài đăng trên website"
        }
        action={<LinkButton href="/admin/posts/new">+ Viết bài mới</LinkButton>}
      />

      {error && (
        <div className="mb-6 rounded-card border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-700">
          {error.message}
          {error.message.includes("does not exist") && (
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

      {!error && posts.length === 0 ? (
        <EmptyState
          icon="✍️"
          title="Chưa có bài viết nào"
          description="Viết bài đầu tiên. Bài nào đánh dấu nổi bật sẽ hiện ngay trên trang chủ."
          action={<LinkButton href="/admin/posts/new">+ Viết bài mới</LinkButton>}
        />
      ) : (
        posts.length > 0 && <PostsTable initial={posts} />
      )}
    </>
  );
}
