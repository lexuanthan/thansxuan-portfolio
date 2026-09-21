"use client";

import { useRef, useState, type DragEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadMedia } from "@/lib/media";
import type { MediaItem } from "@/lib/types";
import { inputClass } from "./styles";

export default function ImagePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  /**
   * Trình duyệt bắn dragenter/dragleave cho từng phần tử con bên trong khung.
   * Đếm số lần vào - ra thay vì bật tắt theo từng sự kiện, nếu không viền sáng
   * sẽ nhấp nháy loạn xạ mỗi khi con trỏ lướt qua tấm ảnh bên trong.
   */
  const dragDepth = useRef(0);

  async function toggleLibrary() {
    const next = !showLibrary;
    setShowLibrary(next);
    if (next && library.length === 0 && !loadingLibrary) {
      setLoadingLibrary(true);
      try {
        const { data } = await createClient()
          .from("media")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(60);
        setLibrary((data ?? []) as MediaItem[]);
      } finally {
        setLoadingLibrary(false);
      }
    }
  }

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const item = await uploadMedia(createClient(), file);
      setLibrary((prev) => [item, ...prev]);
      onChange(item.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh lên thất bại.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );

    if (files.length === 0) {
      setError("Chỉ thả được file ảnh thôi nhé.");
      return;
    }
    // Ô này chỉ giữ một ảnh, thả nhiều thì lấy tấm đầu
    void handleFile(files[0]);
  }

  const dropZoneClass = dragging
    ? "border-brand-400 bg-brand-50"
    : "border-line-strong bg-surface-soft hover:border-brand-300";

  return (
    <div className="space-y-3">
      {/* Khung ảnh kiêm vùng thả — bấm vào cũng mở hộp chọn file */}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setDragging(false);
          }
        }}
        onDrop={onDrop}
        onClick={() => {
          if (!value && !uploading) fileRef.current?.click();
        }}
        className={
          value
            ? "relative overflow-hidden rounded-xl border-2 border-dashed transition-colors " +
              dropZoneClass
            : "flex h-44 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 text-center transition-colors " +
              dropZoneClass
        }
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Ảnh đã chọn" className="h-44 w-full object-cover" />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-2 top-2 rounded-lg bg-ink-900/70 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Gỡ ảnh
            </button>

            {dragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-brand-50/90 text-sm font-semibold text-brand-700">
                Thả để thay ảnh khác
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="text-2xl" aria-hidden="true">
              🖼️
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-700">
              {uploading
                ? "Đang tải lên…"
                : dragging
                  ? "Thả ảnh vào đây"
                  : "Kéo thả ảnh vào đây"}
            </p>
            <p className="mt-1 text-xs text-ink-400">hoặc bấm để chọn từ máy</p>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="rounded-lg bg-brand-400 px-3.5 py-2 text-xs font-semibold text-ink-900 transition-colors hover:bg-brand-300 disabled:opacity-60"
        >
          {uploading ? "Đang tải lên…" : "⬆ Tải ảnh từ máy"}
        </button>
        <button
          type="button"
          onClick={toggleLibrary}
          className="rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          {showLibrary ? "Đóng thư viện" : "🖼 Chọn từ thư viện"}
        </button>
      </div>

      <input
        type="url"
        value={value ?? ""}
        placeholder="…hoặc dán đường dẫn ảnh trực tiếp"
        className={inputClass}
        onChange={(e) => onChange(e.target.value.trim() || null)}
      />

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      {showLibrary && (
        <div className="rounded-xl border border-line bg-surface-soft p-3">
          {loadingLibrary ? (
            <p className="py-6 text-center text-xs text-ink-400">Đang tải…</p>
          ) : library.length === 0 ? (
            <p className="py-6 text-center text-xs text-ink-400">
              Thư viện chưa có ảnh nào. Tải tấm đầu tiên lên đi.
            </p>
          ) : (
            <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
              {library.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange(m.url);
                    setShowLibrary(false);
                  }}
                  className={`overflow-hidden rounded-lg border transition-colors ${
                    value === m.url
                      ? "border-brand-400 ring-2 ring-brand-300"
                      : "border-line hover:border-brand-300"
                  }`}
                  title={m.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.name} className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
