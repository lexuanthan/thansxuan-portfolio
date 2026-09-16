"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge, inputClass } from "@/components/admin/ui";
import { formatDate, searchKey } from "@/lib/format";
import type { ContactMessage } from "@/lib/types";

type Filter = "new" | "handled" | "all";

export default function MessagesList({ initial }: { initial: ContactMessage[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<Filter>("new");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const needle = searchKey(query);

  const visible = rows.filter((m) => {
    if (filter === "new" && m.handled) return false;
    if (filter === "handled" && !m.handled) return false;
    if (needle) {
      const hay = searchKey([m.name, m.email, m.subject, m.content].join(" "));
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  const newCount = rows.filter((m) => !m.handled).length;

  async function toggleHandled(m: ContactMessage) {
    setBusy(m.id);
    setError(null);

    const { error: e } = await createClient()
      .from("messages")
      .update({ handled: !m.handled })
      .eq("id", m.id);

    if (e) setError(e.message);
    else
      setRows((prev) =>
        prev.map((r) => (r.id === m.id ? { ...r, handled: !r.handled } : r))
      );

    setBusy(null);
    router.refresh();
  }

  const TABS: { key: Filter; label: string }[] = [
    { key: "new", label: `Chưa xử lý (${newCount})` },
    { key: "handled", label: "Đã xử lý" },
    { key: "all", label: "Tất cả" },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={
                filter === t.key
                  ? "rounded-full bg-brand-300 px-4 py-2 text-sm font-semibold text-ink-900"
                  : "rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, email hoặc nội dung…"
          className={`sm:max-w-xs ${inputClass}`}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-card border border-dashed border-line-strong bg-surface-soft px-6 py-14 text-center">
          <p className="text-3xl">📭</p>
          <p className="mt-3 font-semibold text-ink-700">
            {filter === "new" ? "Không còn lời nhắn nào chờ xử lý" : "Không có lời nhắn nào"}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">
            Lời nhắn gửi từ trang Liên hệ sẽ hiện ở đây.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((m) => {
            const open = openId === m.id;
            return (
              <li
                key={m.id}
                className="overflow-hidden rounded-card border border-line bg-surface shadow-soft"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : m.id)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-brand-50/60"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800"
                  >
                    {m.name.trim().charAt(0).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink-900">{m.name}</span>
                      {!m.handled && <Badge tone="rose">Mới</Badge>}
                    </div>
                    <p className="truncate text-xs text-ink-400">{m.email}</p>
                    <p className="mt-1 text-sm font-medium text-ink-700">
                      {m.subject || "(không có chủ đề)"}
                    </p>
                    {!open && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">{m.content}</p>
                    )}
                  </div>

                  <span className="shrink-0 whitespace-nowrap text-xs text-ink-400">
                    {formatDate(m.created_at)}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-line px-4 py-4">
                    {/* whitespace-pre-line để giữ đúng cách xuống dòng người gửi đã viết */}
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700">
                      {m.content}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(
                          `Trả lời: ${m.subject || "lời nhắn từ website"}`
                        )}`}
                        className="rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-brand transition-colors hover:bg-brand-300"
                      >
                        Trả lời qua email
                      </a>

                      <button
                        type="button"
                        onClick={() => toggleHandled(m)}
                        disabled={busy === m.id}
                        className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
                      >
                        {busy === m.id
                          ? "…"
                          : m.handled
                            ? "Đánh dấu chưa xử lý"
                            : "Đánh dấu đã xử lý"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-400">
        Lời nhắn không có nút xoá — chỉ đánh dấu đã xử lý, để về sau còn tra lại được.
      </p>
    </div>
  );
}
