"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";

export default function ProjectsTable({ initial }: { initial: Project[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = rows.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  async function togglePublished(p: Project) {
    setBusy(p.id);
    setError(null);
    const { error: e } = await createClient()
      .from("projects")
      .update({ published: !p.published })
      .eq("id", p.id);
    if (e) setError(e.message);
    else
      setRows((prev) =>
        prev.map((r) => (r.id === p.id ? { ...r, published: !r.published } : r))
      );
    setBusy(null);
    router.refresh();
  }

  async function remove(p: Project) {
    setBusy(p.id);
    setError(null);
    const { error: e } = await createClient().from("projects").delete().eq("id", p.id);
    if (e) setError(e.message);
    else setRows((prev) => prev.filter((r) => r.id !== p.id));
    setBusy(null);
    setConfirmId(null);
    router.refresh();
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm theo tiêu đề, mô tả hoặc tag…"
        className="mb-4 w-full rounded-lg border border-white/10 bg-slate-900/70 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 sm:max-w-sm"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="divide-y divide-white/5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 bg-slate-800/40 p-4 transition hover:bg-slate-800/70 sm:flex-row sm:items-center"
            >
              {/* Thumb */}
              <div className="shrink-0">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt=""
                    className="h-14 w-20 rounded-md object-cover"
                  />
                ) : (
                  <div
                    className={`h-14 w-20 rounded-md bg-gradient-to-br ${p.color}`}
                  />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold text-white">{p.title}</h3>
                  {p.featured && (
                    <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium text-purple-300">
                      ★ Featured
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      p.published
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-slate-600/40 text-slate-400"
                    }`}
                  >
                    {p.published ? "Hiển thị" : "Nháp"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-slate-400">
                  {p.description || "—"}
                </p>
                {p.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-slate-500">#{p.sort_order}</span>
                <button
                  onClick={() => togglePublished(p)}
                  disabled={busy === p.id}
                  className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  {p.published ? "Ẩn" : "Hiện"}
                </button>
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="rounded-md bg-blue-600/80 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600"
                >
                  Sửa
                </Link>
                {confirmId === p.id ? (
                  <>
                    <button
                      onClick={() => remove(p)}
                      disabled={busy === p.id}
                      className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                      {busy === p.id ? "…" : "Xoá thật"}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-slate-300"
                    >
                      Huỷ
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmId(p.id)}
                    className="rounded-md border border-red-500/30 px-2.5 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10"
                  >
                    Xoá
                  </button>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-slate-800/40 px-4 py-10 text-center text-sm text-slate-500">
              Không tìm thấy project nào khớp “{query}”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
