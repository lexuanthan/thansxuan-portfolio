/**
 * CHUẨN HOÁ ĐẦU VÀO — tầng L0/L1 lên L3.
 *
 * Mọi số liệu vào hệ thống đều đi qua đây trước khi đụng tới thuật toán.
 * Sau bước này, mọi thứ nằm trên cùng một thang 0–100, cùng một chiều nghĩa,
 * và thiếu dữ liệu được biểu diễn bằng null chứ không phải bằng 0.
 *
 * ┌─ Cái bẫy đắt nhất ở tầng này ────────────────────────────────────┐
 * │ Number(null) ra 0, Number("") cũng ra 0, và cả hai đều lọt qua   │
 * │ Number.isFinite. Một học sinh bỏ trống ô điểm Toán sẽ được ghi   │
 * │ nhận là "điểm Toán bằng 0" — rồi bị loại khỏi mọi ngành kỹ thuật │
 * │ vì một câu em ấy chưa kịp trả lời. Vì vậy ở đây không chỗ nào    │
 * │ gọi Number() trực tiếp lên dữ liệu ngoài; tất cả đi qua toNumber │
 * │ và trả null khi thiếu.                                          │
 * └──────────────────────────────────────────────────────────────────┘
 */

import { RIASEC_KEYS, type RiasecKey, type RiasecVector, type Completeness } from "./types";

/* ------------------------------------------------------------------ */
/* Nguyên thuỷ                                                         */
/* ------------------------------------------------------------------ */

/**
 * Thiếu dữ liệu hay không. Số 0 KHÔNG phải là thiếu — nó là một câu trả lời.
 */
export function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return !Number.isFinite(value);
  if (typeof value === "boolean") return false;
  return true;
}

/**
 * Đổi sang số, trả null khi không đổi được.
 * Chỉ nhận số thật hoặc chuỗi chứa số; mọi thứ khác là thiếu.
 */
export function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const trimmed = value.trim().replace(",", ".");
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Ép về khoảng 0–100. Dùng sau khi quy đổi, không dùng để giấu lỗi. */
export function clampScore(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

/**
 * Quy một giá trị từ thang [min, max] về 0–100.
 * Trả null khi thiếu dữ liệu hoặc khi thang khai sai (min ≥ max).
 */
export function rescale(value: unknown, min: number, max: number): number | null {
  const n = toNumber(value);
  if (n === null) return null;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
  return clampScore(((n - min) / (max - min)) * 100);
}

/* ------------------------------------------------------------------ */
/* Điểm học tập                                                        */
/* ------------------------------------------------------------------ */

export const ACADEMIC_SCALES = ["TEN", "HUNDRED", "GPA4", "LETTER"] as const;
export type AcademicScale = (typeof ACADEMIC_SCALES)[number];

/**
 * Bảng quy đổi điểm chữ. Lấy điểm giữa của mỗi khoảng chứ không lấy mép,
 * vì điểm chữ vốn là một khoảng — quy về mép trên sẽ thổi phồng toàn bộ
 * hồ sơ dùng thang này so với hồ sơ dùng thang số.
 */
const LETTER_TABLE: Record<string, number> = {
  "A+": 97,
  A: 92,
  "A-": 88,
  "B+": 84,
  B: 79,
  "B-": 75,
  "C+": 71,
  C: 66,
  "C-": 62,
  "D+": 58,
  D: 53,
  F: 20,
};

/**
 * Đưa một điểm số bất kỳ về thang 0–100.
 * Trả null khi thiếu hoặc khi giá trị nằm ngoài thang đã khai — điểm 12 trên
 * thang 10 là lỗi nhập liệu, làm tròn xuống 10 sẽ giấu mất lỗi đó.
 */
export function normalizeAcademicScore(raw: unknown, scale: AcademicScale): number | null {
  if (scale === "LETTER") {
    if (typeof raw !== "string") return null;
    const key = raw.trim().toUpperCase();
    return key in LETTER_TABLE ? LETTER_TABLE[key] : null;
  }

  const n = toNumber(raw);
  if (n === null) return null;

  const max = scale === "TEN" ? 10 : scale === "GPA4" ? 4 : 100;
  if (n < 0 || n > max) return null;

  return clampScore((n / max) * 100);
}

/* ------------------------------------------------------------------ */
/* Câu hỏi thang Likert                                                */
/* ------------------------------------------------------------------ */

/**
 * Quy một câu Likert về 0–100.
 *
 * Thang Likert 1–5 có bốn bước chứ không phải năm: mức 1 phải thành 0 và
 * mức 5 phải thành 100. Chia cho 5 là lỗi kinh điển, nó khiến không ai
 * chạm được mức 0 và trần thật sự chỉ là 100 khi trả lời cao nhất.
 */
export function normalizeLikert(raw: unknown, min = 1, max = 5): number | null {
  const n = toNumber(raw);
  if (n === null) return null;
  if (n < min || n > max) return null;
  return rescale(n, min, max);
}

/**
 * Câu hỏi đảo chiều: "Tôi thấy phiền khi phải làm việc nhóm" đo cùng thứ với
 * "Tôi thích làm việc nhóm" nhưng ngược chiều. Đảo tại bước chuẩn hoá, để
 * xuống tới thuật toán thì mọi yếu tố đều cùng một chiều nghĩa.
 */
export function normalizeLikertReversed(raw: unknown, min = 1, max = 5): number | null {
  const forward = normalizeLikert(raw, min, max);
  return forward === null ? null : 100 - forward;
}

/* ------------------------------------------------------------------ */
/* RIASEC                                                              */
/* ------------------------------------------------------------------ */

export type RiasecRaw = Partial<Record<RiasecKey, unknown>>;

/**
 * Quy sáu chiều RIASEC về 0–100 theo thang tuyệt đối (chia cho điểm tối đa
 * có thể đạt), KHÔNG chia cho chiều cao nhất của chính học sinh đó.
 *
 * Lý do: chia theo chiều cao nhất của bản thân sẽ ép mọi hồ sơ đều có một
 * chiều đúng 100, kể cả hồ sơ mà cả sáu chiều đều thấp đều. Khi đó "không
 * hứng thú với gì cả" và "rất hứng thú với kỹ thuật" nhìn giống hệt nhau.
 * Bước so khớp dùng cosine nên vốn đã không quan tâm độ lớn; giữ độ lớn ở
 * đây để những chỗ khác — cảnh báo hồ sơ mờ nhạt — còn cái mà nhìn.
 *
 * Chiều nào thiếu dữ liệu thì để 0 và ghi tên vào mảng `missing`, để nơi gọi
 * tự quyết định có đủ tin để dùng hay không.
 */
export function normalizeRiasec(
  raw: RiasecRaw,
  maxPerDimension: number
): { vector: RiasecVector; missing: RiasecKey[] } {
  const vector = {} as RiasecVector;
  const missing: RiasecKey[] = [];

  for (const key of RIASEC_KEYS) {
    const scaled =
      maxPerDimension > 0 ? rescale(raw[key], 0, maxPerDimension) : null;
    if (scaled === null) {
      vector[key] = 0;
      missing.push(key);
    } else {
      vector[key] = scaled;
    }
  }

  return { vector, missing };
}

/** Vector RIASEC rỗng — dùng làm giá trị khởi tạo, không dùng làm dữ liệu thật. */
export function emptyRiasec(): RiasecVector {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

/** Ba chiều trội, xếp giảm dần — mã Holland quen thuộc, ví dụ "RIA". */
export function hollandCode(vector: RiasecVector, size = 3): string {
  return [...RIASEC_KEYS]
    .sort((a, b) => vector[b] - vector[a])
    .slice(0, size)
    .join("");
}

/* ------------------------------------------------------------------ */
/* Độ đầy đủ của hồ sơ                                                 */
/* ------------------------------------------------------------------ */

/**
 * Đếm xem học sinh đã khai được bao nhiêu phần trên tổng số phần bắt buộc.
 *
 * Khác với coverage: đây là "em đã trả lời tới đâu", còn coverage là "ngành
 * đòi những gì mà ta có số liệu". Hai chỉ số đo hai thứ khác nhau và trộn
 * lẫn thì mất cả hai.
 */
export function computeCompleteness(
  answers: Record<string, unknown>,
  requiredKeys: readonly string[]
): Completeness {
  const missing: string[] = [];
  let answered = 0;

  for (const key of requiredKeys) {
    if (isMissing(answers[key])) missing.push(key);
    else answered += 1;
  }

  const required = requiredKeys.length;
  return {
    value: required === 0 ? 0 : answered / required,
    answered,
    required,
    missing,
  };
}

/* ------------------------------------------------------------------ */
/* Tái lập kết quả                                                     */
/* ------------------------------------------------------------------ */

/**
 * Chuỗi hoá ổn định: khoá object luôn được sắp xếp, nên cùng nội dung thì
 * luôn ra cùng một chuỗi bất kể thứ tự khoá lúc dựng.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

/**
 * Mã băm FNV-1a 32 bit của đầu vào đã chuẩn hoá.
 *
 * Đây là dấu vết để đối chiếu "cùng đầu vào có ra cùng kết quả không", KHÔNG
 * phải thứ dùng cho bảo mật. Không dùng nó để ký, để xác thực hay để giấu dữ
 * liệu — 32 bit thì va chạm là chuyện bình thường.
 */
export function stableHash(value: unknown): string {
  const text = canonicalJson(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
