/**
 * Kiểm tra dữ liệu form liên hệ.
 * Tách khỏi route để kiểm thử được mà không cần dựng máy chủ.
 */

export const MAX_NAME = 120;
export const MAX_SUBJECT = 200;
export const MAX_CONTENT = 5000;

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  content: string;
};

export type ContactError = { field: keyof ContactInput; message: string };

function text(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Giữ nguyên xuống dòng cho phần nội dung — người ta viết nhiều đoạn, gộp hết
 * thành một dòng thì đọc rất mệt. Chỉ gom khoảng trắng ngang.
 */
function body(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

/**
 * Cố tình nới lỏng: chỉ cần có phần trước @, có tên miền và có dấu chấm.
 * Regex email "đúng chuẩn" dài mấy trăm ký tự mà vẫn chặn nhầm địa chỉ thật,
 * trong khi địa chỉ sai thì email gửi đi sẽ tự dội lại.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

export function normalizeContact(raw: unknown): ContactInput {
  const src = (raw ?? {}) as Record<string, unknown>;
  return {
    name: text(src.name, MAX_NAME),
    email: text(src.email, 200).toLowerCase(),
    subject: text(src.subject, MAX_SUBJECT),
    content: body(src.content, MAX_CONTENT),
  };
}

export function validateContact(input: ContactInput): ContactError[] {
  const errors: ContactError[] = [];

  if (input.name.length < 2) {
    errors.push({ field: "name", message: "Cho mình xin tên với ạ." });
  }
  if (!EMAIL_RE.test(input.email)) {
    errors.push({ field: "email", message: "Email chưa đúng định dạng." });
  }
  if (input.content.length < 10) {
    errors.push({ field: "content", message: "Nội dung hơi ngắn, viết thêm vài chữ nhé." });
  }

  return errors;
}

/**
 * Bẫy máy tự động: form có một ô ẩn mà người thật không bao giờ nhìn thấy nên
 * để trống. Máy quét form thì điền tất cả. Có chữ trong ô đó là bot.
 */
export function looksLikeBot(honeypot: unknown): boolean {
  return typeof honeypot === "string" && honeypot.trim().length > 0;
}
