import { htmlToText, looksLikeHtml } from "@/lib/html";

/**
 * Định dạng hiển thị dùng chung.
 *
 * Cố tình KHÔNG dùng toLocaleDateString: máy chủ và trình duyệt có thể chạy
 * múi giờ khác nhau, khiến Next.js báo lỗi "hydration mismatch" và ngày nhảy
 * một đơn vị. Tự tách chuỗi ISO thì kết quả giống hệt nhau ở cả hai phía.
 */

const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return "";

  const [, year, month, day] = match;
  const index = Number(month) - 1;
  if (index < 0 || index > 11) return "";

  return `${Number(day)} ${MONTHS[index]}, ${year}`;
}

/** 2500 → "2.5k". Giữ cho dòng thông tin phụ luôn gọn trên một dòng. */
export function formatCount(value: number | null | undefined): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}k`;
  }
  const m = n / 1_000_000;
  return `${m < 10 ? m.toFixed(1).replace(/\.0$/, "") : Math.round(m)}m`;
}

/**
 * Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu — gõ "cong nghe" vẫn ra
 * "công nghệ". Chữ đ/Đ phải xử lý riêng vì nó là một chữ cái độc lập chứ
 * không phải d có dấu, nên NFD không tách ra được.
 */
export function stripDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Chuẩn hoá một chuỗi về dạng dùng để so khớp khi tìm kiếm. */
export function searchKey(text: string | null | undefined): string {
  return stripDiacritics((text ?? "").toLowerCase()).replace(/\s+/g, " ").trim();
}

/**
 * Gỡ đánh dấu in đậm khi hiển thị đoạn xem trước dưới dạng chữ thuần.
 * Nội dung trong database viết theo kiểu **in đậm**; chỗ nào render bằng
 * RichText thì nó thành chữ đậm thật, còn chỗ tóm tắt chỉ in chữ trơn nên
 * người đọc sẽ thấy nguyên hai dấu sao nếu không bóc ra.
 */
export function plainText(text: string | null | undefined): string {
  return (text ?? "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Rút phần chữ thuần để làm đoạn xem trước, bất kể nội dung lưu kiểu nào.
 *
 * Cùng một trường trong database giờ có thể chứa hai dạng: bài cũ lưu chữ thuần
 * với **hai dấu sao**, bài mới lưu HTML từ trình soạn thảo. Chỗ nào chỉ in chữ
 * trơn — thẻ bài viết, ô "Về tôi" ngoài trang chủ — đều phải đi qua đây, nếu
 * không người đọc sẽ thấy nguyên đống thẻ hoặc dấu sao lòi ra.
 */
export function previewText(content: string | null | undefined): string {
  const raw = content ?? "";
  if (!raw) return "";
  return looksLikeHtml(raw) ? htmlToText(raw) : plainText(raw);
}

/** Cắt bớt phần mô tả dài mà không chặt ngang giữa một từ. */
export function truncate(text: string | null | undefined, max = 140): string {
  const raw = (text ?? "").trim();
  if (raw.length <= max) return raw;

  const cut = raw.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
