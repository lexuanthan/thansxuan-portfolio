"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import { Card, Field, inputClass } from "@/components/admin/ui";
import TagInput from "@/components/admin/TagInput";
import ImagePicker from "@/components/admin/ImagePicker";
import RichEditor from "@/components/admin/RichEditor";
import type { Category, Post } from "@/lib/types";

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  category_id: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  published_at: string;
};

/** Ô datetime-local cần đúng dạng YYYY-MM-DDTHH:mm, không có giây và múi giờ. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function PostForm({
  post,
  categories,
}: {
  post?: Post;
  categories: Category[];
}) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [form, setForm] = useState<FormState>({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    cover_url: post?.cover_url ?? null,
    category_id: post?.category_id ?? "",
    tags: post?.tags ?? [],
    featured: post?.featured ?? false,
    published: post?.published ?? false,
    published_at: toLocalInput(post?.published_at ?? null),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Tiêu đề không được để trống.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    /**
     * Bấm xuất bản mà chưa chọn ngày thì lấy luôn thời điểm hiện tại — nếu để
     * trống, bài sẽ tụt xuống cuối danh sách vì sắp xếp theo ngày đăng.
     */
    const publishedAt =
      form.published_at.trim() !== ""
        ? new Date(form.published_at).toISOString()
        : form.published
          ? new Date().toISOString()
          : null;

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover_url: form.cover_url,
      category_id: form.category_id || null,
      tags: form.tags,
      featured: form.featured,
      published: form.published,
      published_at: publishedAt,
    };

    const { error: dbError } = isEdit
      ? await supabase.from("posts").update(payload).eq("id", post!.id)
      : await supabase.from("posts").insert(payload);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "Đường dẫn (slug) này đã có bài khác dùng rồi, đổi sang chữ khác nhé."
          : dbError.message
      );
      setSaving(false);
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card className="space-y-5">
          <Field label="Tiêu đề *">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="VD: 10 công cụ AI miễn phí hữu ích nhất"
              required
            />
          </Field>

          <Field
            label="Đường dẫn"
            hint="Để trống sẽ tự sinh từ tiêu đề. Đây là phần sau /bai-viet/ trên thanh địa chỉ."
          >
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder={form.title ? slugify(form.title) : "cong-cu-ai-mien-phi"}
            />
          </Field>

          <Field
            label="Tóm tắt"
            hint="Vài dòng hiện trên thẻ bài viết ngoài trang chủ và đầu bài."
          >
            <textarea
              className={`${inputClass} min-h-[90px] resize-y`}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">
              Nội dung
            </span>
            <RichEditor
              value={form.content}
              onChange={(html) => set("content", html)}
            />
            <span className="mt-1.5 block text-xs leading-relaxed text-ink-400">
              Bôi đen phần chữ rồi chọn định dạng ở thanh trên. Ảnh chèn vào được
              tải thẳng lên thư viện, không cần tải trước.
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold text-ink-900">Ảnh bìa</h2>
          <ImagePicker value={form.cover_url} onChange={(url) => set("cover_url", url)} />
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Bỏ trống cũng được — web sẽ tự vẽ một mảng màu kèm chữ cái đầu của tiêu đề.
          </p>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="space-y-5">
          <h2 className="text-sm font-bold text-ink-900">Xuất bản</h2>

          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-ink-700">Hiện ngoài website</span>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="h-5 w-5 accent-brand-500"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-ink-700">Đánh dấu nổi bật</span>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-5 w-5 accent-brand-500"
            />
          </label>

          <Field label="Ngày đăng" hint="Bỏ trống thì lấy thời điểm bấm xuất bản.">
            <input
              type="datetime-local"
              className={inputClass}
              value={form.published_at}
              onChange={(e) => set("published_at", e.target.value)}
            />
          </Field>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold text-ink-900">Chuyên mục</h2>
          {categories.length === 0 ? (
            <p className="text-xs leading-relaxed text-ink-400">
              Chưa có chuyên mục nào.{" "}
              <Link href="/admin/categories" className="font-semibold text-brand-700">
                Tạo chuyên mục
              </Link>{" "}
              trước rồi quay lại.
            </p>
          ) : (
            <select
              className={inputClass}
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
            >
              <option value="">— Chưa phân loại —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold text-ink-900">Thẻ</h2>
          <TagInput value={form.tags} onChange={(tags) => set("tags", tags)} />
        </Card>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-brand-400 px-4 py-3 text-sm font-semibold text-ink-900 shadow-brand transition-colors hover:bg-brand-300 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo bài viết"}
          </button>
          <Link
            href="/admin/posts"
            className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50"
          >
            Huỷ
          </Link>
        </div>
      </div>
    </form>
  );
}
