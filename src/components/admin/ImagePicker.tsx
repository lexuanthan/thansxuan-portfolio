"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadMedia } from "@/lib/media";
import type { MediaItem } from "@/lib/types";
import { inputClass } from "./ui";

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
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState<MediaItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  useEffect(() => {
    if (!showLibrary || library.length > 0) return;
    let cancelled = false;
    setLoadingLibrary(true);
    createClient()
      .from("media")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(60)
      .then(({ data }) => {
        if (!cancelled) {
          setLibrary((data ?? []) as MediaItem[]);
          setLoadingLibrary(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [showLibrary, library.length]);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const item = await uploadMedia(createClient(), file);
      setLibrary((prev) => [item, ...prev]);
      onChange(item.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload thất bại.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-900/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Ảnh đã chọn"
            className="h-44 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-md bg-black/70 px-2.5 py-1 text-xs text-white transition hover:bg-red-600"
          >
            Gỡ ảnh
          </button>
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-white/15 bg-slate-900/40 text-sm text-slate-500">
          Chưa có ảnh
        </div>
      )}

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
          className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
        >
          {uploading ? "Đang upload…" : "⬆ Upload ảnh"}
        </button>
        <button
          type="button"
          onClick={() => setShowLibrary((v) => !v)}
          className="rounded-lg border border-white/10 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          {showLibrary ? "Đóng thư viện" : "🖼 Chọn từ thư viện"}
        </button>
      </div>

      <input
        type="url"
        value={value ?? ""}
        placeholder="…hoặc dán URL ảnh trực tiếp"
        className={inputClass}
        onChange={(e) => onChange(e.target.value.trim() || null)}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {showLibrary && (
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
          {loadingLibrary ? (
            <p className="py-6 text-center text-xs text-slate-500">Đang tải…</p>
          ) : library.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">
              Thư viện trống. Upload ảnh đầu tiên đi.
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
                  className={`overflow-hidden rounded-md border transition ${
                    value === m.url
                      ? "border-blue-500 ring-2 ring-blue-500/40"
                      : "border-white/10 hover:border-white/30"
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
