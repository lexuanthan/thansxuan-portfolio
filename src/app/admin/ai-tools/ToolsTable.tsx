"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { statusClassName, type AiTool } from "@/lib/types";

export default function ToolsTable({ initial }: { initial: AiTool[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function togglePublished(t: AiTool) {
    setBusy(t.id);
    setError(null);
    const { error: e } = await createClient()
      .from("ai_tools")
      .update({ published: !t.published })
      .eq("id", t.id);
    if (e) setError(e.message);
    else
      setRows((prev) =>
        prev.map((r) => (r.id === t.id ? { ...r, published: !r.published } : r))
      );
    setBusy(null);
    router.refresh();
  }

  async function remove(t: AiTool) {
    setBusy(t.id);
    setError(null);
    const { error: e } = await createClient().from("ai_tools").delete().eq("id", t.id);
    if (e) setError(e.message);
    else setRows((prev) => prev.filter((r) => r.id !== t.id));
    setBusy(null);
    setConfirmId(null);
    router.refresh();
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((t) => (
          <div
            key={t.id}
            className="flex flex-col rounded-xl border border-white/10 bg-slate-800/40 p-5 transition hover:border-white/20"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${t.color} text-2xl`}
              >
                {t.icon}
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusClassName(
                  t.status_color
                )}`}
              >
                {t.status}
              </span>
            </div>

            <h3 className="font-semibold text-white">{t.title}</h3>
            <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-400">
              {t.description || "—"}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
              <span className="mr-auto text-xs text-slate-500">
                #{t.sort_order} · {t.published ? "Hiển thị" : "Nháp"}
              </span>
              <button
                onClick={() => togglePublished(t)}
                disabled={busy === t.id}
                className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                {t.published ? "Ẩn" : "Hiện"}
              </button>
              <Link
                href={`/admin/ai-tools/${t.id}`}
                className="rounded-md bg-blue-600/80 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600"
              >
                Sửa
              </Link>
              {confirmId === t.id ? (
                <>
                  <button
                    onClick={() => remove(t)}
                    disabled={busy === t.id}
                    className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                  >
                    {busy === t.id ? "…" : "Xoá thật"}
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
                  onClick={() => setConfirmId(t.id)}
                  className="rounded-md border border-red-500/30 px-2.5 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10"
                >
                  Xoá
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
