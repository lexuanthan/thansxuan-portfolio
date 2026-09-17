/**
 * CÔNG THỨC SO KHỚP — PART 6.14 → 6.26.
 *
 * Toàn bộ file này là hàm thuần: cùng đầu vào luôn cho cùng đầu ra, không đọc
 * database, không đọc đồng hồ, không gọi mạng. Đó là điều kiện để tái lập
 * được kết quả cũ và để test được từng công thức một.
 */

import { RIASEC_KEYS, type Direction, type PartialRiasec } from "./types";

/* ------------------------------------------------------------------ */
/* Tương đồng theo từng yếu tố                                         */
/* ------------------------------------------------------------------ */

/**
 * PART 6.15:  similarity = 1 − |student − major| / 100,  rồi × 100.
 *
 * VÌ SAO KHÔNG LẤY THẲNG ĐIỂM HỌC SINH (6.16):
 * một em Toán 90 không "phù hợp Toán" như nhau ở mọi ngành. Ngành đặc trưng
 * Toán 95 thì em ấy rất gần; ngành đặc trưng Toán 60 thì em ấy lệch 30. Lấy
 * thẳng điểm học sinh sẽ biến bảng xếp hạng ngành thành bảng xếp hạng học
 * lực, và ngành nào cũng gợi ý giống hệt nhau cho mọi học sinh giỏi.
 *
 * Trả null khi yếu tố bị loại khỏi phép tính — thiếu một bên, hoặc NEUTRAL.
 * Người gọi phải phân biệt null với 0: null là "không tính", 0 là "lệch hết cỡ".
 */
export function factorSimilarity(
  studentValue: number | null | undefined,
  majorExpected: number | null | undefined,
  direction: Direction = "POSITIVE"
): number | null {
  // NEUTRAL được lưu để mô tả, không đóng góp điểm (5.32).
  if (direction === "NEUTRAL") return null;

  if (studentValue === null || studentValue === undefined) return null;
  if (majorExpected === null || majorExpected === undefined) return null;
  if (!Number.isFinite(studentValue) || !Number.isFinite(majorExpected)) return null;

  // Yếu tố ngược chiều: lật giá trị của học sinh rồi mới so. Hiếm dùng, và
  // chỉ đúng khi yếu tố thực sự có hướng ngược (6.20).
  const s = direction === "NEGATIVE" ? 100 - studentValue : studentValue;

  const distance = Math.abs(s - majorExpected);
  return clamp0to100(100 - distance);
}

export function clamp0to100(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

/* ------------------------------------------------------------------ */
/* Điểm nhóm                                                           */
/* ------------------------------------------------------------------ */

export type ScoredFactor = {
  /** 0–100, đã tính được. */
  similarity: number;
  /** 0–100. */
  importance: number;
};

/**
 * PART 6.18:
 *   GroupFit = Σ(FactorFit × Importance) / Σ(Importance)
 *
 * Chỉ tính những yếu tố có dữ liệu ở CẢ HAI phía. Yếu tố thiếu bị loại khỏi
 * cả tử số lẫn mẫu số — không được coi là 0 (6.11), vì như vậy là phạt học
 * sinh vì một câu em ấy chưa trả lời.
 *
 * Trả null khi không có yếu tố nào tính được: nhóm đó không có điểm, khác
 * hẳn với nhóm có điểm 0.
 */
export function groupFit(scored: ScoredFactor[]): number | null {
  let weighted = 0;
  let totalImportance = 0;

  for (const f of scored) {
    if (!Number.isFinite(f.similarity) || !Number.isFinite(f.importance)) continue;
    if (f.importance <= 0) continue;
    weighted += f.similarity * f.importance;
    totalImportance += f.importance;
  }

  if (totalImportance <= 0) return null;
  return clamp0to100(weighted / totalImportance);
}

/**
 * PART 6.39: coverage = importance khả dụng / tổng importance ngành đòi hỏi.
 *
 * Đếm theo importance chứ không đếm theo số yếu tố. Thiếu mất yếu tố Toán
 * importance 95 nặng hơn hẳn thiếu ba yếu tố importance 10, mà đếm đầu người
 * thì hai chuyện đó bằng nhau.
 *
 * PART 6.40: coverage KHÔNG phải fit. Nó chỉ nói có bao nhiêu dữ liệu dùng
 * được, không nói dữ liệu ấy khớp tới đâu.
 */
export function coverageOf(
  availableImportance: number,
  totalImportance: number
): number {
  if (totalImportance <= 0) return 0;
  const ratio = availableImportance / totalImportance;
  return ratio < 0 ? 0 : ratio > 1 ? 1 : ratio;
}

/* ------------------------------------------------------------------ */
/* RIASEC                                                              */
/* ------------------------------------------------------------------ */

/**
 * Ba cách đo mức trùng khớp giữa hai vector RIASEC.
 *
 * Tài liệu (6.25) chọn cosine. Đo thực nghiệm trên sáu hồ sơ điển hình và năm
 * ngành cho thấy cosine gần như không phân biệt được gì:
 *
 *   cosine       biên độ 71–100, độ lệch chuẩn 7.0
 *   euclid       biên độ 56–95,  độ lệch chuẩn 9.2
 *   correlation  biên độ 6–99,   độ lệch chuẩn 27.1
 *
 * Tệ nhất là với hồ sơ "đều tay" — em nào trả lời na ná nhau ở cả sáu chiều —
 * thì cosine cho ~92 điểm với MỌI ngành. Một em không nghiêng hẳn về đâu được
 * báo là hợp 92% với tất cả, và đó là câu trả lời vô nghĩa nhất hệ thống có
 * thể đưa ra.
 *
 * Tài liệu học thuật cũng không dùng cosine. Hai cách được khuyến nghị là
 * khoảng cách Euclid và tương quan hồ sơ (profile correlation); phân tích tổng
 * hợp cho thấy cách dùng ĐỦ sáu chiều mạnh hơn hẳn cách chỉ lấy ba chữ cái đầu
 * (ρ = 0.34 so với 0.08 khi dự báo kết quả học tập). Xem `references.md`.
 */

/** Cosine — giữ lại để tái lập kết quả cũ, không còn là mặc định. */
export function riasecCosine(
  student: PartialRiasec,
  major: PartialRiasec
): number | null {
  const pair = pairOf(student, major);
  if (!pair) return null;
  const { s, m } = pair;

  let dot = 0;
  let ns = 0;
  let nm = 0;
  for (let i = 0; i < s.length; i += 1) {
    dot += s[i] * m[i];
    ns += s[i] * s[i];
    nm += m[i] * m[i];
  }
  if (ns <= 0 || nm <= 0) return null;
  return clamp0to100((dot / (Math.sqrt(ns) * Math.sqrt(nm))) * 100);
}

/**
 * Khoảng cách Euclid, quy về 0–100.
 *
 * Giữ cả hướng lẫn độ lớn, nên một hồ sơ hứng thú cao đều và một hồ sơ hứng
 * thú thấp đều KHÔNG bị coi là giống nhau. Đổi lại thang bị nén ở khoảng giữa.
 */
export function riasecEuclidean(
  student: PartialRiasec,
  major: PartialRiasec
): number | null {
  const pair = pairOf(student, major);
  if (!pair) return null;
  const { s, m } = pair;

  let sum = 0;
  for (let i = 0; i < s.length; i += 1) sum += (s[i] - m[i]) ** 2;

  // Khoảng cách lớn nhất có thể: hai vector đối cực trên thang 0–100.
  const maxDistance = Math.sqrt(s.length * 100 * 100);
  return clamp0to100((1 - Math.sqrt(sum) / maxDistance) * 100);
}

/**
 * Tương quan hồ sơ (Pearson) giữa hai vector, quy từ [−1, 1] về 0–100.
 *
 * So HÌNH DẠNG của hồ sơ: chiều nào trội hơn chiều nào, bất kể mức cao thấp
 * chung. Đây là cách phân biệt tốt nhất trong ba cách đo được, và cũng là cách
 * tài liệu học thuật đánh giá cao nhất trong nhóm "profile conceptual".
 *
 * ĐIỂM YẾU phải biết: khi hồ sơ gần như phẳng, phương sai tiến về 0 và hệ số
 * tương quan bị nhiễu chi phối — vài điểm chênh lệch ngẫu nhiên cũng bị khuếch
 * đại thành một hệ số rất cao hoặc rất thấp. Vì vậy hàm này phải đi kèm cổng
 * phân hoá ở dưới; dùng một mình là sai.
 */
export function riasecCorrelation(
  student: PartialRiasec,
  major: PartialRiasec
): number | null {
  const pair = pairOf(student, major);
  if (!pair) return null;
  const { s, m } = pair;

  const n = s.length;
  const ms = s.reduce((a, b) => a + b, 0) / n;
  const mm = m.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let ds = 0;
  let dm = 0;
  for (let i = 0; i < n; i += 1) {
    num += (s[i] - ms) * (m[i] - mm);
    ds += (s[i] - ms) ** 2;
    dm += (m[i] - mm) ** 2;
  }
  // Hồ sơ phẳng tuyệt đối: không có hình dạng nào để so.
  if (ds <= 0 || dm <= 0) return null;

  const r = num / Math.sqrt(ds * dm);
  return clamp0to100(((r + 1) / 2) * 100);
}

/**
 * Mức phân hoá của một hồ sơ RIASEC — độ lệch chuẩn của sáu chiều.
 *
 * Đây là khái niệm "differentiation" trong chính lý thuyết Holland, không phải
 * thứ tôi nghĩ ra: một hồ sơ mà sáu chiều xấp xỉ nhau thì không có kiểu nghề
 * nghiệp nổi trội, và mọi phép so khớp trên nó đều không nói lên điều gì.
 *
 * Đo trên các hồ sơ điển hình: hồ sơ có kiểu rõ cho độ lệch 18–22, hồ sơ phẳng
 * cho 1.3, hồ sơ hơi nghiêng cho 6.4. Ngưỡng 10 tách bạch hẳn ba loại đó.
 */
export function riasecDifferentiation(profile: PartialRiasec): number {
  const values: number[] = [];
  for (const k of RIASEC_KEYS) {
    const v = profile[k];
    if (typeof v === "number" && Number.isFinite(v)) values.push(v);
  }
  if (values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export type RiasecIndex = "COSINE" | "EUCLIDEAN" | "CORRELATION";

/** Chọn cách đo theo cấu hình. Đổi cách đo là đổi cấu hình, không sửa engine. */
export function riasecFit(
  student: PartialRiasec,
  major: PartialRiasec,
  index: RiasecIndex
): number | null {
  if (index === "COSINE") return riasecCosine(student, major);
  if (index === "EUCLIDEAN") return riasecEuclidean(student, major);
  return riasecCorrelation(student, major);
}

/** Lấy hai vector đủ sáu chiều, hoặc null nếu thiếu bất kỳ chiều nào. */
function pairOf(
  student: PartialRiasec,
  major: PartialRiasec
): { s: number[]; m: number[] } | null {
  const s: number[] = [];
  const m: number[] = [];
  for (const k of RIASEC_KEYS) {
    const sv = student[k];
    const mv = major[k];
    if (sv === null || sv === undefined || !Number.isFinite(sv)) return null;
    if (mv === null || mv === undefined || !Number.isFinite(mv)) return null;
    s.push(sv);
    m.push(mv);
  }
  return { s, m };
}

/** Số chiều RIASEC có dữ liệu ở cả hai phía — dùng để báo INSUFFICIENT. */
export function riasecCoverage(student: PartialRiasec, major: PartialRiasec): number {
  let n = 0;
  for (const k of RIASEC_KEYS) {
    const sv = student[k];
    const mv = major[k];
    const has =
      sv !== null && sv !== undefined && Number.isFinite(sv) &&
      mv !== null && mv !== undefined && Number.isFinite(mv);
    if (has) n += 1;
  }
  return n / RIASEC_KEYS.length;
}

/* ------------------------------------------------------------------ */
/* Phạt                                                                */
/* ------------------------------------------------------------------ */

/**
 * PART 6.45: Penalty = Σ(phạt từng cổng), chặn trần tại maximumTotalPenalty.
 *           GateAdjustment = 1 − min(Penalty, MaxPenalty)
 *
 * Cộng rồi mới chặn, không chặn từng cái rồi mới cộng — hai cách cho kết quả
 * khác nhau khi có nhiều cổng, và tài liệu chọn cách thứ nhất.
 */
export function gateAdjustment(penalties: number[], maxTotal: number): {
  penalty: number;
  adjustment: number;
} {
  let sum = 0;
  for (const p of penalties) {
    if (Number.isFinite(p) && p > 0) sum += p;
  }
  const penalty = Math.min(sum, maxTotal);
  return { penalty, adjustment: 1 - penalty };
}

/* ------------------------------------------------------------------ */
/* Chuẩn hoá lại trọng số nhóm                                         */
/* ------------------------------------------------------------------ */

/**
 * PART 6.41: nhóm nào không đủ dữ liệu thì bị loại, trọng số của các nhóm còn
 * lại được chuẩn hoá để tổng vẫn bằng 1.
 *
 * Không làm bước này thì một hồ sơ thiếu nhóm Environment sẽ có tổng trọng số
 * 0.95, và mọi ngành của em ấy đều thấp hơn 5% so với hồ sơ đầy đủ — một mức
 * phạt vô hình không ai chủ ý đặt ra.
 */
export function normalizeWeights(
  weights: Record<string, number>
): Record<string, number> {
  const total = Object.values(weights).reduce(
    (s, w) => s + (Number.isFinite(w) && w > 0 ? w : 0),
    0
  );
  const out: Record<string, number> = {};
  if (total <= 0) return out;
  for (const [k, w] of Object.entries(weights)) {
    if (Number.isFinite(w) && w > 0) out[k] = w / total;
  }
  return out;
}
