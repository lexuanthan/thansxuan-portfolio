"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadMedia } from "@/lib/media";
import { looksLikeHtml } from "@/lib/html";

/* =============================================================
   Trình soạn thảo cho nội dung bài viết.

   Dùng contentEditable của trình duyệt thay vì nạp thư viện ngoài: nhẹ hơn
   vài trăm KB, không phụ thuộc CDN nào, và HTML sinh ra do mình kiểm soát nên
   khớp đúng với bộ lọc ở lib/html.ts.
   ============================================================= */

const FONTS = [
  { label: "Mặc định", value: "" },
  { label: "Be Vietnam Pro", value: "'Be Vietnam Pro', sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

const SIZES = [
  { label: "Nhỏ", value: "13px" },
  { label: "Thường", value: "15px" },
  { label: "Vừa", value: "18px" },
  { label: "Lớn", value: "22px" },
  { label: "Rất lớn", value: "28px" },
];

const COLORS = [
  "#1c1917", "#44403c", "#78716c",
  "#b45309", "#d97d06", "#f5a524",
  "#dc2626", "#e11d48", "#db2777",
  "#7c3aed", "#2563eb", "#0891b2",
  "#059669", "#65a30d",
];

const BLOCKS = [
  { label: "Đoạn văn", value: "p" },
  { label: "Tiêu đề lớn", value: "h2" },
  { label: "Tiêu đề vừa", value: "h3" },
  { label: "Tiêu đề nhỏ", value: "h4" },
  { label: "Trích dẫn", value: "blockquote" },
  { label: "Khối mã", value: "pre" },
];

/** Cỡ chữ đặc biệt của execCommand — dùng làm mốc rồi đổi lại thành px. */
const SIZE_MARKER = "7";

const btn =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700";
const sel =
  "h-8 rounded-lg border border-line bg-surface px-2 text-xs font-medium text-ink-700 outline-none focus:border-brand-400";

export default function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showColors, setShowColors] = useState(false);

  /**
   * Chỉ nạp nội dung vào ô soạn thảo ĐÚNG MỘT LẦN.
   * Nếu đồng bộ innerHTML theo mỗi lần render, con trỏ sẽ nhảy về đầu bài sau
   * mỗi ký tự gõ vào — lỗi kinh điển của contentEditable trong React.
   */
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !ref.current) return;
    loaded.current = true;

    if (!value) {
      ref.current.innerHTML = "<p><br></p>";
      return;
    }

    // Bài cũ lưu chữ thuần: đổi mỗi đoạn thành một thẻ p để soạn tiếp được
    ref.current.innerHTML = looksLikeHtml(value)
      ? value
      : value
          .split(/\n{2,}/)
          .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, "<br>")}</p>`)
          .join("");
  }, [value]);

  const emit = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  /** Mọi lệnh định dạng đều đi qua đây để giữ đúng thứ tự: focus → chạy → báo thay đổi. */
  const run = useCallback(
    (command: string, arg?: string) => {
      ref.current?.focus();
      try {
        // styleWithCSS: sinh <span style> thay vì thẻ <font> đã lỗi thời
        document.execCommand("styleWithCSS", false, "true");
        document.execCommand(command, false, arg);
      } catch {
        /* trình duyệt quá cũ — bỏ qua lệnh đó thay vì làm sập trang */
      }
      emit();
    },
    [emit]
  );

  /**
   * execCommand("fontSize") chỉ nhận 7 mức cố định chứ không nhận px.
   * Mẹo: đánh dấu vùng chọn bằng mức 7, rồi đổi các thẻ vừa sinh ra thành
   * span có cỡ chữ thật.
   */
  const setFontSize = useCallback(
    (px: string) => {
      const host = ref.current;
      if (!host) return;

      host.focus();
      try {
        document.execCommand("styleWithCSS", false, "false");
        document.execCommand("fontSize", false, SIZE_MARKER);
      } catch {
        return;
      }

      host.querySelectorAll(`font[size="${SIZE_MARKER}"]`).forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = px;
        span.innerHTML = el.innerHTML;
        el.replaceWith(span);
      });

      emit();
    },
    [emit]
  );

  function addLink() {
    const url = window.prompt("Dán đường dẫn vào đây:", "https://");
    if (!url || url.trim() === "" || url.trim() === "https://") return;
    run("createLink", url.trim());
  }

  async function insertImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const item = await uploadMedia(createClient(), file);
      run("insertImage", item.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được ảnh lên.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  /**
   * Dán từ Word hoặc trang web khác kéo theo cả rừng thẻ và style.
   * Chỉ lấy phần chữ, để người viết định dạng lại bằng thanh công cụ.
   */
  function handlePaste(e: ReactClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emit();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {/* ---------- Thanh công cụ ---------- */}
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-surface-soft p-2">
        <select
          className={sel}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) run("formatBlock", e.target.value);
            e.target.value = "";
          }}
          aria-label="Kiểu đoạn"
        >
          <option value="">Kiểu đoạn</option>
          {BLOCKS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        <select
          className={sel}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) run("fontName", e.target.value);
            e.target.value = "";
          }}
          aria-label="Phông chữ"
        >
          <option value="">Phông chữ</option>
          {FONTS.filter((f) => f.value).map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          className={sel}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) setFontSize(e.target.value);
            e.target.value = "";
          }}
          aria-label="Cỡ chữ"
        >
          <option value="">Cỡ chữ</option>
          {SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <Divider />

        <button type="button" className={`${btn} font-black`} onClick={() => run("bold")} title="In đậm">
          B
        </button>
        <button type="button" className={`${btn} italic`} onClick={() => run("italic")} title="In nghiêng">
          I
        </button>
        <button type="button" className={`${btn} underline`} onClick={() => run("underline")} title="Gạch chân">
          U
        </button>
        <button type="button" className={`${btn} line-through`} onClick={() => run("strikeThrough")} title="Gạch ngang">
          S
        </button>

        <Divider />

        {/* Bảng màu */}
        <div className="relative">
          <button
            type="button"
            className={btn}
            onClick={() => setShowColors((v) => !v)}
            aria-expanded={showColors}
            title="Màu chữ"
          >
            <span className="mr-1">A</span>
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-brand-500" />
          </button>

          {showColors && (
            <div className="absolute left-0 top-9 z-20 w-44 rounded-xl border border-line bg-surface p-2 shadow-lift">
              <div className="grid grid-cols-7 gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => {
                      run("foreColor", c);
                      setShowColors(false);
                    }}
                    className="h-5 w-5 rounded border border-line"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  run("removeFormat");
                  setShowColors(false);
                }}
                className="mt-2 w-full rounded-lg border border-line px-2 py-1.5 text-[11px] font-semibold text-ink-700 hover:bg-brand-50"
              >
                Xoá định dạng
              </button>
            </div>
          )}
        </div>

        <Divider />

        <button type="button" className={btn} onClick={() => run("insertUnorderedList")} title="Danh sách chấm">
          • ≡
        </button>
        <button type="button" className={btn} onClick={() => run("insertOrderedList")} title="Danh sách số">
          1. ≡
        </button>

        <Divider />

        <button type="button" className={btn} onClick={() => run("justifyLeft")} title="Căn trái">
          ⇤
        </button>
        <button type="button" className={btn} onClick={() => run("justifyCenter")} title="Căn giữa">
          ↔
        </button>
        <button type="button" className={btn} onClick={() => run("justifyRight")} title="Căn phải">
          ⇥
        </button>

        <Divider />

        <button type="button" className={btn} onClick={addLink} title="Chèn liên kết">
          🔗 Link
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Chèn ảnh"
        >
          {uploading ? "Đang tải…" : "🖼️ Ảnh"}
        </button>
        <button type="button" className={btn} onClick={() => run("insertHorizontalRule")} title="Đường kẻ ngang">
          ―
        </button>

        <Divider />

        <button type="button" className={btn} onClick={() => run("undo")} title="Hoàn tác">
          ↶
        </button>
        <button type="button" className={btn} onClick={() => run("redo")} title="Làm lại">
          ↷
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void insertImage(file);
          }}
        />
      </div>

      {error && (
        <p className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      {/* ---------- Vùng soạn thảo ---------- */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={handlePaste}
        role="textbox"
        aria-multiline="true"
        aria-label="Nội dung bài viết"
        className="admin-editor min-h-[420px] px-5 py-4 text-[15px] leading-[1.9] text-ink-900 outline-none"
      />
    </div>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-line-strong" />;
}

/** Chữ thuần đưa vào HTML phải thoát trước, nếu không dấu < sẽ thành thẻ. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
