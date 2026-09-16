"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge, Card, TableShell, Td, Th, inputClass } from "@/components/admin/ui";
import TagInput from "@/components/admin/TagInput";
import type { Resource } from "@/lib/types";

const KINDS = [
  { value: "link", label: "Liên kết" },
  { value: "file", label: "Tệp tải về" },
  { value: "template", label: "Mẫu dùng lại" },
  { value: "course", label: "Khoá học" },
  { value: "tool", label: "Công cụ" },
];

const ICONS = ["📦", "🔗", "📄", "🎓", "🛠️", "📊", "🎨", "🧩", "📚", "⚡", "🗂️", "💡"];

const EMPTY = {
  title: "",
  description: "",
  url: "",
  kind: "link",
  icon: "📦",
  tags: [] as string[],
  published: true,
  sort_order: 0,
};

type Draft = typeof EMPTY;

export default function ResourceManager({ initial }: { initial: Resource[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function set<K extends keyof Draft>(key: K, val: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  function startEdit(r: Resource) {
    setEditingId(r.id);
    setDraft({
      title: r.title,
      description: r.description ?? "",
      url: r.url ?? "",
      kind: r.kind,
      icon: r.icon,
      tags: r.tags,
      published: r.published,
      sort_order: r.sort_order,
    });
    // Form nằm trên cùng ở màn hình hẹp nên phải kéo lên, không thì tưởng không có gì xảy ra
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;

    setSaving(true);
    setError(null);

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      url: draft.url.trim() || null,
      kind: draft.kind,
      icon: draft.icon,
      tags: draft.tags,
      published: draft.published,
      sort_order: Number(draft.sort_order) || 0,
    };

    const supabase = createClient();
    const { data, error: e1 } = editingId
      ? await supabase.from("resources").update(payload).eq("id", editingId).select().single()
      : await supabase.from("resources").insert(payload).select().single();

    if (e1) {
      setError(e1.message);
    } else if (data) {
      const row = data as Resource;
      setRows((prev) =>
        editingId ? prev.map((r) => (r.id === row.id ? row : r)) : [...prev, row]
      );
      reset();
    }

    setSaving(false);
    router.refresh();
  }

  async function remove(r: Resource) {
    setBusy(r.id);
    const { error: e } = await createClient().from("resources").delete().eq("id", r.id);
    if (e) setError(e.message);
    else setRows((prev) => prev.filter((x) => x.id !== r.id));
    setBusy(null);
    setConfirmId(null);
    if (editingId === r.id) reset();
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <Card>
        <h2 className="mb-4 text-sm font-bold text-ink-900">
          {editingId ? "Sửa tài nguyên" : "Thêm tài nguyên"}
        </h2>

        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">Tên *</span>
            <input
              className={inputClass}
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="VD: Bộ icon miễn phí"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">Mô tả</span>
            <textarea
              className={`${inputClass} min-h-[90px] resize-y`}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">
              Đường dẫn
            </span>
            <input
              type="url"
              className={inputClass}
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://…"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">Loại</span>
            <select
              className={inputClass}
              value={draft.kind}
              onChange={(e) => set("kind", e.target.value)}
            >
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">Biểu tượng</span>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => set("icon", ic)}
                  className={`rounded-lg border px-2 py-1 text-lg transition-colors ${
                    draft.icon === ic
                      ? "border-brand-400 bg-brand-50"
                      : "border-line hover:border-brand-300"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">Thẻ</span>
            <TagInput value={draft.tags} onChange={(tags) => set("tags", tags)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-700">
                Thứ tự
              </span>
              <input
                type="number"
                className={inputClass}
                value={draft.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </label>

            <label className="flex cursor-pointer items-end gap-2 pb-2.5">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => set("published", e.target.checked)}
                className="h-5 w-5 accent-brand-500"
              />
              <span className="text-sm text-ink-700">Hiện ngoài web</span>
            </label>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-brand transition-colors hover:bg-brand-300 disabled:opacity-60"
            >
              {saving ? "Đang lưu…" : editingId ? "Lưu thay đổi" : "Thêm"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50"
              >
                Huỷ
              </button>
            )}
          </div>
        </form>
      </Card>

      <div>
        {rows.length === 0 ? (
          <div className="rounded-card border border-dashed border-line-strong bg-surface-soft px-6 py-14 text-center">
            <p className="text-3xl">📚</p>
            <p className="mt-3 font-semibold text-ink-700">Kho tài nguyên còn trống</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
              Thêm mục đầu tiên ở ô bên trái.
            </p>
          </div>
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Tài nguyên</Th>
                <Th className="w-32">Loại</Th>
                <Th className="w-28">Trạng thái</Th>
                <Th className="w-48 text-right">Thao tác</Th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-brand-50/60">
                  <Td>
                    <div className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="text-xl leading-none">
                        {r.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-ink-900">{r.title}</p>
                        {r.url && (
                          <p className="truncate text-xs text-ink-400" title={r.url}>
                            {r.url}
                          </p>
                        )}
                      </div>
                    </div>
                  </Td>

                  <Td>
                    <Badge tone="blue">
                      {KINDS.find((k) => k.value === r.kind)?.label ?? r.kind}
                    </Badge>
                  </Td>

                  <Td>
                    <Badge tone={r.published ? "green" : "slate"}>
                      {r.published ? "Hiện" : "Ẩn"}
                    </Badge>
                  </Td>

                  <Td>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="rounded-lg bg-brand-400 px-2.5 py-1.5 text-xs font-semibold text-ink-900 transition-colors hover:bg-brand-300"
                      >
                        Sửa
                      </button>

                      {confirmId === r.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => remove(r)}
                            disabled={busy === r.id}
                            className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
                          >
                            {busy === r.id ? "…" : "Xoá thật"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-700"
                          >
                            Huỷ
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmId(r.id)}
                          className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
                        >
                          Xoá
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </div>
    </div>
  );
}
