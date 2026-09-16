"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge, TableShell, Td, Th, inputClass } from "@/components/admin/ui";
import { formatCount, formatDate, searchKey } from "@/lib/format";
import type { Post } from "@/lib/types";

export default function PostsTable({ initial }: { initial: Post[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Tìm không phân biệt dấu: gõ "cong nghe" vẫn ra "công nghệ".
  const needle = searchKey(query);
  const filtered = needle
    ? rows.filter((p) =>
        searchKey(
          [p.title, p.excerpt, p.category_name, p.tags.join(" ")].join(" ")
        ).includes(needle)
      )
    : rows;

  async function togglePublished(p: Post) {
    setBusy(p.id);
    setError(null);

    const next = !p.published;
    // Xuất bản lần đầu mà chưa có ngày đăng thì đóng dấu luôn thời điểm này.
    const patch: Record<string, unknown> = { published: next };
    if (next && !p.published_at) patch.published_at = new Date().toISOString();

    const { error: e } = await createClient().from("posts").update(patch).eq("id", p.id);

    if (e) {
      setError(e.message);
    } else {
      setRows((prev) =>
        prev.map((r) =>
          r.id === p.id
            ? {
                ...r,
                published: next,
                published_at: (patch.published_at as string) ?? r.published_at,
              }
            : r
        )
      );
    }

    setBusy(null);
    router.refresh();
  }

  async function remove(p: Post) {
    setBusy(p.id);
    setError(null);
    const { error: e } = await createClient().from("posts").delete().eq("id", p.id);
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
        placeholder="Tìm theo tiêu đề, tóm tắt, chuyên mục hoặc thẻ…"
        className={`mb-4 sm:max-w-md ${inputClass}`}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <TableShell>
        <thead>
          <tr>
            <Th>Tiêu đề</Th>
            <Th className="w-40">Chuyên mục</Th>
            <Th className="w-32">Trạng thái</Th>
            <Th className="w-32">Ngày đăng</Th>
            <Th className="w-20 text-right">Lượt xem</Th>
            <Th className="w-56 text-right">Thao tác</Th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-brand-50/60">
              <Td>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink-900">{p.title}</span>
                  {p.featured && <Badge tone="amber">★ Nổi bật</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-ink-400">/bai-viet/{p.slug}</p>
              </Td>

              <Td>
                {p.category_name ? (
                  <Badge tone="blue">{p.category_name}</Badge>
                ) : (
                  <span className="text-xs text-ink-400">—</span>
                )}
              </Td>

              <Td>
                <Badge tone={p.published ? "green" : "slate"}>
                  {p.published ? "Đã xuất bản" : "Nháp"}
                </Badge>
              </Td>

              <Td className="whitespace-nowrap text-xs text-ink-500">
                {formatDate(p.published_at ?? p.created_at) || "—"}
              </Td>

              <Td className="text-right text-xs font-semibold text-ink-700">
                {formatCount(p.views)}
              </Td>

              <Td>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => togglePublished(p)}
                    disabled={busy === p.id}
                    className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
                  >
                    {p.published ? "Ẩn" : "Đăng"}
                  </button>

                  <Link
                    href={`/admin/posts/${p.id}`}
                    className="rounded-lg bg-brand-400 px-2.5 py-1.5 text-xs font-semibold text-ink-900 transition-colors hover:bg-brand-300"
                  >
                    Sửa
                  </Link>

                  {confirmId === p.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        disabled={busy === p.id}
                        className="rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
                      >
                        {busy === p.id ? "…" : "Xoá thật"}
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
                      onClick={() => setConfirmId(p.id)}
                      className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
                    >
                      Xoá
                    </button>
                  )}
                </div>
              </Td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-400">
                Không có bài nào khớp “{query}”.
              </td>
            </tr>
          )}
        </tbody>
      </TableShell>
    </div>
  );
}
