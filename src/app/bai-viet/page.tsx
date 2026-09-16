import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { PostCard } from "@/components/content/PostCard";
import { Container, EmptyState, PageHeading } from "@/components/ui";
import { getCategories, getPosts } from "@/lib/queries";
import { searchKey } from "@/lib/format";

/** Trang có lọc theo tham số URL nên phải dựng theo từng lượt truy cập. */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bài viết",
  description: "Những bài viết về công nghệ, AI, sáng tạo nội dung và truyền thông.",
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function BaiVietPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = first(params.q).trim();
  const categorySlug = first(params["chuyen-muc"]).trim();

  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  const activeCategory = categories.find((c) => c.slug === categorySlug) ?? null;

  const filtered = posts.filter((post) => {
    if (activeCategory && post.category_name !== activeCategory.name) return false;

    if (q) {
      const needle = searchKey(q);
      const haystack = searchKey(
        [post.title, post.excerpt, post.category_name, post.tags.join(" ")].join(" ")
      );
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });

  const description = q
    ? `Kết quả tìm cho “${q}” — ${filtered.length} bài.`
    : "Những ghi chép về công nghệ, AI, sáng tạo nội dung và cách áp dụng chúng vào công việc.";

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading eyebrow="Bài viết" title="Tất cả bài viết" description={description} />

        {/* Bộ lọc chuyên mục */}
        {categories.length > 0 && (
          <nav aria-label="Lọc theo chuyên mục" className="mb-7 flex flex-wrap gap-2">
            <Link
              href="/bai-viet"
              className={
                activeCategory === null
                  ? "rounded-full bg-brand-300 px-4 py-2 text-sm font-semibold text-ink-900"
                  : "rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
              }
            >
              Tất cả
            </Link>

            {categories.map((c) => {
              const active = activeCategory?.id === c.id;
              return (
                <Link
                  key={c.id}
                  href={`/bai-viet?chuyen-muc=${encodeURIComponent(c.slug)}`}
                  className={
                    active
                      ? "rounded-full bg-brand-300 px-4 py-2 text-sm font-semibold text-ink-900"
                      : "rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
                  }
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
        )}

        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon="✍️"
            title="Chưa có bài viết nào"
            hint="Vào Quản trị → Bài viết để đăng bài đầu tiên."
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="Không tìm thấy bài nào khớp"
            hint={
              q
                ? `Không có bài nào chứa “${q}”. Thử từ khoá ngắn hơn, hoặc bỏ dấu cũng được.`
                : "Chuyên mục này chưa có bài viết."
            }
            action={
              <Link
                href="/bai-viet"
                className="inline-flex items-center rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-ink-900"
              >
                Xem tất cả bài viết
              </Link>
            }
          />
        )}
      </Container>
    </SiteShell>
  );
}
