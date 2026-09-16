"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, TableShell, Td, Th, inputClass } from "@/components/admin/ui";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/types";

type Counts = Record<string, number>;

export default function CategoryManager({
  initial,
  counts,
}: {
  initial: Category[];
  counts: Counts;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function add(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);

    const { data, error: e1 } = await createClient()
      .from("categories")
      .insert({
        name: trimmed,
        slug: slug.trim() || slugify(trimmed),
        sort_order: rows.length + 1,
      })
      .select()
      .single();

    if (e1) {
      setError(
        e1.code === "23505"
          ? "Đường dẫn này đã có chuyên mục khác dùng rồi."
          : e1.message
      );
    } else if (data) {
      setRows((prev) => [...prev, data as Category]);
      setName("");
      setSlug("");
    }

    setSaving(false);
    router.refresh();
  }

  async function rename(c: Category) {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === c.name) {
      setEditing(null);
      return;
    }

    setBusy(c.id);
    const { error: e } = await createClient()
      .from("categories")
      .update({ name: trimmed })
      .eq("id", c.id);

    if (e) setError(e.message);
    else setRows((prev) => prev.map((r) => (r.id === c.id ? { ...r, name: trimmed } : r)));

    setBusy(null);
    setEditing(null);
    router.refresh();
  }

  async function remove(c: Category) {
    setBusy(c.id);
    setError(null);
    const { error: e } = await createClient().from("categories").delete().eq("id", c.id);
    if (e) setError(e.message);
    else setRows((prev) => prev.filter((r) => r.id !== c.id));
    setBusy(null);
    setConfirmId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
      {/* Thêm mới */}
      <Card>
        <h2 className="mb-4 text-sm font-bold text-ink-900">Thêm chuyên mục</h2>

        <form onSubmit={add} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">Tên</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Công nghệ"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-700">
              Đường dẫn
            </span>
            <input
              className={inputClass}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={name ? slugify(name) : "cong-nghe"}
            />
            <span className="mt-1.5 block text-xs leading-relaxed text-ink-400">
              Để trống sẽ tự sinh từ tên.
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-brand transition-colors hover:bg-brand-300 disabled:opacity-60"
          >
            {saving ? "Đang thêm…" : "Thêm chuyên mục"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}
      </Card>

      {/* Danh sách */}
      <div>
        {rows.length === 0 ? (
          <div className="rounded-card border border-dashed border-line-strong bg-surface-soft px-6 py-14 text-center">
            <p className="text-3xl">🗂️</p>
            <p className="mt-3 font-semibold text-ink-700">Chưa có chuyên mục nào</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
              Thêm ở ô bên trái. Chuyên mục dùng để phân loại bài viết ngoài trang web.
            </p>
          </div>
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Tên</Th>
                <Th className="w-48">Đường dẫn</Th>
                <Th className="w-24 text-right">Số bài</Th>
                <Th className="w-52 text-right">Thao tác</Th>
              </tr>
            </thead>

            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-brand-50/60">
                  <Td>
                    {editing === c.id ? (
                      <input
                        autoFocus
                        className={inputClass}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => rename(c)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") rename(c);
                          if (e.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(c.id);
                          setDraft(c.name);
                        }}
                        className="text-left font-semibold text-ink-900 transition-colors hover:text-brand-700"
                        title="Bấm để đổi tên"
                      >
                        {c.name}
                      </button>
                    )}
                  </Td>

                  <Td className="font-mono text-xs text-ink-500">{c.slug}</Td>

                  <Td className="text-right text-xs font-semibold text-ink-700">
                    {counts[c.id] ?? 0}
                  </Td>

                  <Td>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {confirmId === c.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => remove(c)}
                            disabled={busy === c.id}
                            className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
                          >
                            {busy === c.id ? "…" : "Xoá thật"}
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
                          onClick={() => setConfirmId(c.id)}
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

        <p className="mt-4 text-xs leading-relaxed text-ink-400">
          Xoá chuyên mục <strong className="font-semibold text-ink-500">không</strong> xoá
          bài viết trong đó — các bài chỉ chuyển sang trạng thái chưa phân loại.
        </p>
      </div>
    </div>
  );
}
