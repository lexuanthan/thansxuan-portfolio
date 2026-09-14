"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  COLOR_PRESETS,
  STATUS_COLORS,
  statusClassName,
  type AiTool,
} from "@/lib/types";
import { Card, Field, inputClass } from "@/components/admin/ui";

const ICON_SUGGESTIONS = [
  "🤖", "✍️", "🎨", "🎬", "📊", "💡", "🔍", "📝", "🧠", "⚡",
  "🚀", "🎯", "📈", "🗂️", "🔮", "🛠️", "📣", "🎧", "🧩", "💬",
];

const STATUS_SUGGESTIONS = ["Live", "Beta", "Coming Soon", "Đang phát triển", "Tạm dừng"];

type FormState = {
  title: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  status_color: string;
  link_url: string;
  published: boolean;
  sort_order: number;
};

export default function ToolForm({ tool }: { tool?: AiTool }) {
  const router = useRouter();
  const isEdit = Boolean(tool);

  const [form, setForm] = useState<FormState>({
    title: tool?.title ?? "",
    description: tool?.description ?? "",
    icon: tool?.icon ?? "🤖",
    color: tool?.color ?? COLOR_PRESETS[0].value,
    status: tool?.status ?? "Coming Soon",
    status_color: tool?.status_color ?? "yellow",
    link_url: tool?.link_url ?? "",
    published: tool?.published ?? true,
    sort_order: tool?.sort_order ?? 0,
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
      setError("Tên tool không được để trống.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon || "🤖",
      color: form.color,
      status: form.status.trim() || "Coming Soon",
      status_color: form.status_color,
      link_url: form.link_url.trim() || null,
      published: form.published,
      sort_order: Number(form.sort_order) || 0,
    };

    const { error: dbError } = isEdit
      ? await supabase.from("ai_tools").update(payload).eq("id", tool!.id)
      : await supabase.from("ai_tools").insert(payload);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/ai-tools");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="space-y-5">
          <Field label="Tên tool *">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="VD: Content Generator"
              required
            />
          </Field>

          <Field label="Mô tả">
            <textarea
              className={`${inputClass} min-h-[110px] resize-y`}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tool này làm được gì?"
            />
          </Field>

          <Field label="Link tới tool" hint="Để trống nếu tool chưa sẵn sàng.">
            <input
              type="url"
              className={inputClass}
              value={form.link_url}
              onChange={(e) => set("link_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>

          <Field label="Icon" hint="Dán emoji bất kỳ hoặc chọn gợi ý bên dưới.">
            <input
              className={`${inputClass} text-2xl`}
              value={form.icon}
              onChange={(e) => set("icon", e.target.value)}
              maxLength={8}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ICON_SUGGESTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => set("icon", ic)}
                  className={`rounded-md border px-2 py-1 text-lg transition ${
                    form.icon === ic
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </Field>
        </Card>

        {/* Preview */}
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-white">Xem trước card</h3>
          <div
            className={`relative rounded-lg border border-gray-300 bg-gradient-to-br ${form.color} p-8`}
          >
            <div className="absolute right-4 top-4">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClassName(
                  form.status_color
                )}`}
              >
                {form.status || "Coming Soon"}
              </span>
            </div>
            <div className="mb-4 text-5xl">{form.icon}</div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">
              {form.title || "Tên tool"}
            </h3>
            <p className="text-base leading-relaxed text-gray-700">
              {form.description || "Mô tả tool sẽ hiển thị ở đây."}
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-5">
          <h3 className="text-sm font-semibold text-white">Trạng thái</h3>

          <Field label="Nhãn trạng thái">
            <input
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {STATUS_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-slate-300 transition hover:border-white/30 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Màu nhãn">
            <div className="grid grid-cols-3 gap-2">
              {STATUS_COLORS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("status_color", s.value)}
                  className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition ${
                    s.className
                  } ${
                    form.status_color === s.value
                      ? "ring-2 ring-white/60"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>
        </Card>

        <Card className="space-y-5">
          <h3 className="text-sm font-semibold text-white">Hiển thị</h3>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm text-slate-300">Công khai trên website</span>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="h-5 w-5 accent-blue-600"
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
          <h3 className="mb-4 text-sm font-semibold text-white">Màu card</h3>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => set("color", c.value)}
                className={`rounded-lg border p-2 text-left text-[11px] transition ${
                  form.color === c.value
                    ? "border-blue-500 ring-2 ring-blue-500/40"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <span
                  className={`mb-1.5 block h-6 w-full rounded bg-gradient-to-br ${c.value}`}
                />
                <span className="text-slate-300">{c.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-purple-500 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo tool"}
          </button>
          <Link
            href="/admin/ai-tools"
            className="rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
          >
            Huỷ
          </Link>
        </div>
      </div>
    </form>
  );
}
