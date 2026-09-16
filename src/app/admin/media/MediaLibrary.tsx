"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteMedia, formatBytes, uploadMedia, MAX_UPLOAD_BYTES } from "@/lib/media";
import type { MediaItem } from "@/lib/types";

export default function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setErrors([]);
    setUploading(true);
    const supabase = createClient();
    const failed: string[] = [];
    const added: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      setProgress(`Đang upload ${i + 1}/${files.length}: ${files[i].name}`);
      try {
        added.push(await uploadMedia(supabase, files[i]));
      } catch (err) {
        failed.push(err instanceof Error ? err.message : `Lỗi với ${files[i].name}`);
      }
    }

    if (added.length) setItems((prev) => [...added, ...prev]);
    setErrors(failed);
    setUploading(false);
    setProgress("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function remove(item: MediaItem) {
    setBusy(item.id);
    try {
      await deleteMedia(createClient(), item);
      setItems((prev) => prev.filter((m) => m.id !== item.id));
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Xoá thất bại."]);
    }
    setBusy(null);
    setConfirmId(null);
    router.refresh();
  }

  async function toggleLogo(item: MediaItem) {
    setBusy(item.id);
    const next = !item.is_logo;
    const { error } = await createClient()
      .from("media")
      .update({ is_logo: next })
      .eq("id", item.id);

    if (error) setErrors([error.message]);
    else
      setItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_logo: next } : m))
      );
    setBusy(null);
    router.refresh();
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setErrors(["Trình duyệt không cho phép copy tự động."]);
    }
  }

  const totalSize = items.reduce((sum, m) => sum + (m.size || 0), 0);

  return (
    <div>
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`mb-6 cursor-pointer rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragging
            ? "border-brand-400 bg-brand-50"
            : "border-line-strong bg-surface-soft hover:border-brand-300"
        }`}
      >
        <div className="mb-2 text-4xl">{uploading ? "⏳" : "⬆️"}</div>
        <p className="font-medium text-ink-900">
          {uploading ? progress : "Kéo thả ảnh vào đây hoặc bấm để chọn file"}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          PNG, JPG, WEBP, GIF, SVG · tối đa {formatBytes(MAX_UPLOAD_BYTES)} mỗi file
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
      </div>

      {errors.length > 0 && (
        <div className="mb-6 space-y-1 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errors.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}

      <p className="mb-4 text-sm text-ink-500">
        {items.length} ảnh · tổng {formatBytes(totalSize)}
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface-soft px-6 py-16 text-center">
          <div className="mb-3 text-4xl">🖼️</div>
          <h3 className="text-lg font-semibold text-ink-900">Thư viện trống</h3>
          <p className="mt-1.5 text-sm text-ink-500">
            Upload ảnh đầu tiên để dùng cho project và trang About.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <div
              key={m.id}
              className="group overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="relative aspect-[4/3] bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {m.is_logo && (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-400 px-2 py-0.5 text-[10px] font-bold text-ink-900">
                    LOGO
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-ink-900" title={m.name}>
                  {m.name}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-400">
                  {formatBytes(m.size)} ·{" "}
                  {new Date(m.created_at).toLocaleDateString("vi-VN")}
                </p>

                <button
                  onClick={() => toggleLogo(m)}
                  disabled={busy === m.id}
                  className={`mt-2 w-full rounded-md border px-2 py-1.5 text-[11px] transition disabled:opacity-50 ${
                    m.is_logo
                      ? "border-brand-400 bg-brand-100 text-brand-800"
                      : "border-line text-ink-500 hover:bg-brand-50"
                  }`}
                  title="Logo được đánh dấu sẽ hiện trong tool ghép ảnh"
                >
                  {m.is_logo ? "✓ Là logo" : "Đánh dấu là logo"}
                </button>

                <div className="mt-2 flex gap-1.5">
                  <button
                    onClick={() => copyUrl(m.url)}
                    className="flex-1 rounded-md border border-line px-2 py-1.5 text-[11px] text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    {copied === m.url ? "✓ Đã copy" : "Copy URL"}
                  </button>
                  {confirmId === m.id ? (
                    <>
                      <button
                        onClick={() => remove(m)}
                        disabled={busy === m.id}
                        className="rounded-md bg-rose-600 px-2 py-1.5 text-[11px] font-medium text-ink-900 transition hover:bg-rose-500 disabled:opacity-50"
                      >
                        {busy === m.id ? "…" : "Xoá"}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-md border border-line px-2 py-1.5 text-[11px] text-ink-700"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmId(m.id)}
                      className="rounded-md border border-rose-200 px-2 py-1.5 text-[11px] text-rose-700 transition hover:bg-rose-50"
                    >
                      Xoá
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
