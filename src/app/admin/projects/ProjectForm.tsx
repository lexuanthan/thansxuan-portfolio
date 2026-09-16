"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { COLOR_PRESETS, type Project } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { Card, Field, inputClass } from "@/components/admin/ui";
import TagInput from "@/components/admin/TagInput";
import ImagePicker from "@/components/admin/ImagePicker";

type FormState = {
  title: string;
  slug: string;
  description: string;
  content: string;
  image_url: string | null;
  tags: string[];
  color: string;
  link_url: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
};

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const isEdit = Boolean(project);

  const [form, setForm] = useState<FormState>({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    description: project?.description ?? "",
    content: project?.content ?? "",
    image_url: project?.image_url ?? null,
    tags: project?.tags ?? [],
    color: project?.color ?? COLOR_PRESETS[0].value,
    link_url: project?.link_url ?? "",
    featured: project?.featured ?? false,
    published: project?.published ?? true,
    sort_order: project?.sort_order ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Tiêu đề không được để trống.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      title: form.title.trim(),
      slug: (form.slug.trim() || slugify(form.title)) || null,
      description: form.description.trim(),
      content: form.content.trim(),
      image_url: form.image_url,
      tags: form.tags,
      color: form.color,
      link_url: form.link_url.trim() || null,
      featured: form.featured,
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
    };

    const { error: dbError } = isEdit
      ? await supabase.from("projects").update(payload).eq("id", project!.id)
      : await supabase.from("projects").insert(payload);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "Slug này đã tồn tại, hãy đổi sang slug khác."
          : dbError.message
      );
      setSaving(false);
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="space-y-5">
          <Field label="Tiêu đề *">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="VD: AI Content Generator"
              required
            />
          </Field>

          <Field
            label="Slug"
            hint="Để trống sẽ tự sinh từ tiêu đề. Dùng cho URL."
          >
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder={form.title ? slugify(form.title) : "ai-content-generator"}
            />
          </Field>

          <Field label="Mô tả ngắn" hint="Hiển thị trên card ngoài trang Portfolio.">
            <textarea
              className={`${inputClass} min-h-[110px] resize-y`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <Field
            label="Nội dung chi tiết"
            hint="Tuỳ chọn — mô tả dài, xuống dòng tự do."
          >
            <textarea
              className={`${inputClass} min-h-[160px] resize-y`}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
            />
          </Field>

          <Field label="Link dự án" hint="URL demo, case study hoặc repo.">
            <input
              type="url"
              className={inputClass}
              value={form.link_url}
              onChange={(e) => set("link_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-900">Ảnh đại diện</h3>
          <ImagePicker
            value={form.image_url}
            onChange={(url) => set("image_url", url)}
          />
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-5">
          <h3 className="text-sm font-semibold text-ink-900">Hiển thị</h3>

          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-ink-700">Công khai trên website</span>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="h-5 w-5 accent-brand-500"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-ink-700">Nổi bật (featured)</span>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-5 w-5 accent-brand-500"
            />
          </label>

          <Field label="Thứ tự sắp xếp" hint="Số nhỏ hiện trước.">
            <input
              type="number"
              className={inputClass}
              value={form.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </Field>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-900">Tags</h3>
          <TagInput value={form.tags} onChange={(tags) => set("tags", tags)} />
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-900">Màu card</h3>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set("color", c.value)}
                className={`rounded-lg border p-2 text-left text-[11px] transition ${
                  form.color === c.value
                    ? "border-brand-400 ring-2 ring-brand-300"
                    : "border-line hover:border-brand-300"
                }`}
              >
                <span
                  className={`mb-1.5 block h-6 w-full rounded bg-gradient-to-br ${c.value}`}
                />
                <span className="text-ink-700">{c.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-gradient-to-r from-brand-400 to-brand-300 px-4 py-3 text-sm font-semibold text-ink-900 transition hover:from-brand-300 hover:to-brand-200 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo mục mới"}
          </button>
          <Link
            href="/admin/projects"
            className="rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink-700 transition hover:bg-brand-50"
          >
            Huỷ
          </Link>
        </div>
      </div>
    </form>
  );
}
