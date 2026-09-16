"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteMedia, formatBytes, uploadMedia, MAX_UPLOAD_BYTES } from "@/lib/media";
import type { MediaItem } from "@/lib/types";

export default function LogoManager({ initial }: { initial: MediaItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setErrors([]);
    setUploading(true);
    const supabase = createClient();
    const failed: string[] = [];
    const added: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      setProgress(`Đang tải lên ${i + 1}/${files.length}: ${files[i].name}`);
      try {
        added.push(await uploadMedia(supabase, files[i], { isLogo: true }));
      } catch (err) {
        failed.push(err instanceof Error ? err.message : `Lỗi với ${files[i].name}`);
      }
    }

    if (added.length) {
      setItems((prev) =>
        [...added, ...prev].sort((a, b) => a.name.localeCompare(b.name, "vi"))
      );
    }
    setErrors(failed);
    setUploading(false);
    setProgress("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function rename(item: MediaItem) {
    const name = draftName.trim();
    setEditingId(null);
    if (!name || name === item.name) return;

    setBusy(item.id);
    const { error } = await createClient()
      .from("media")
      .update({ name })
      .eq("id", item.id);

    if (error) setErrors([error.message]);
    else
      setItems((prev) =>
        prev
          .map((m) => (m.id === item.id ? { ...m, name } : m))
          .sort((a, b) => a.name.localeCompare(b.name, "vi"))
      );
    setBusy(null);
    router.refresh();
  }

  /** Bỏ khỏi danh sách logo nhưng giữ file trong thư viện ảnh. */
  async function unmark(item: MediaItem) {
    setBusy(item.id);
    const { error } = await createClient()
      .from("media")
      .update({ is_logo: false })
      .eq("id", item.id);

    if (error) setErrors([error.message]);
    else setItems((prev) => prev.filter((m) => m.id !== item.id));
    setBusy(null);
    router.refresh();
  }

  /** Xoá hẳn file khỏi storage. */
  async function removeForever(item: MediaItem) {
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

  return (
    <div>
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
        className={`mb-6 cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-brand-400 bg-brand-50"
            : "border-line-strong bg-surface-soft hover:border-brand-300"
        }`}
      >
        <div className="mb-2 text-4xl">{uploading ? "⏳" : "🏛️"}</div>
        <p className="font-medium text-ink-900">
          {uploading ? progress : "Kéo thả logo vào đây hoặc bấm để chọn file"}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          Nên dùng PNG nền trong suốt hoặc SVG · tối đa {formatBytes(MAX_UPLOAD_BYTES)}
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

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <span>{items.length} logo</span>
        <span className="text-ink-400">·</span>
        <span>Sắp xếp theo tên — thêm số vào đầu tên để đổi thứ tự</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface-soft px-6 py-16 text-center">
          <div className="mb-3 text-4xl">🏛️</div>
          <h3 className="text-lg font-semibold text-ink-900">Chưa có logo nào</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">
            Tải logo trường lên đây, nó sẽ hiện ngay trong ô{" "}
            <span className="text-ink-700">Logo có sẵn</span> của tool ghép ảnh —
            người dùng bấm một phát là chèn được, không phải tự tải lên nữa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((m) => (
            <div
              key={m.id}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              {/* Nền ca-rô để thấy rõ phần trong suốt của logo */}
              <div
                className="flex aspect-[4/3] items-center justify-center p-4"
                style={{
                  backgroundColor: "#ffffff",
                  backgroundImage:
                    "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.name}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>

              <div className="p-3">
                {editingId === m.id ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={() => rename(m)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") rename(m);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-full rounded border border-brand-400 bg-surface px-2 py-1 text-xs text-ink-900 outline-none"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(m.id);
                      setDraftName(m.name);
                    }}
                    title="Bấm để đổi tên"
                    className="block w-full truncate text-left text-xs font-medium text-ink-900 hover:text-brand-700"
                  >
                    {m.name}
                  </button>
                )}

                <p className="mt-0.5 text-[11px] text-ink-400">
                  {formatBytes(m.size)}
                </p>

                <div className="mt-3 flex gap-1.5">
                  <button
                    onClick={() => unmark(m)}
                    disabled={busy === m.id}
                    title="Giữ file trong thư viện ảnh, chỉ bỏ khỏi tool ghép ảnh"
                    className="flex-1 rounded-md border border-line px-2 py-1.5 text-[11px] text-ink-700 transition hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
                  >
                    Bỏ khỏi tool
                  </button>

                  {confirmId === m.id ? (
                    <>
                      <button
                        onClick={() => removeForever(m)}
                        disabled={busy === m.id}
                        className="rounded-md bg-rose-600 px-2 py-1.5 text-[11px] font-medium text-ink-900 transition hover:bg-rose-500 disabled:opacity-50"
                      >
                        {busy === m.id ? "…" : "Xoá hẳn"}
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
                      title="Xoá vĩnh viễn khỏi kho lưu trữ"
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
