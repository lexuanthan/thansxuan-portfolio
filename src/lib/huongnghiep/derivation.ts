/**
 * QUY TẮC SUY DIỄN — PART 2.17, PART 3.18, 3.27, 3.48, 3.58, 3.59.
 *
 * "Configuration over code": mọi công thức nằm ở đây dưới dạng dữ liệu, không
 * viết rải trong hàm. Sửa cách tính `ability.numerical` là sửa một dòng trong
 * mảng RULES, không phải sửa thuật toán.
 *
 * Mỗi biến suy diễn đều truy ngược được (BR-S06):
 *   biến → luật → biến nguồn → câu hỏi gốc
 */

import type { RiasecKey } from "./types";
import { INTEREST_DOMAINS, SUBJECTS } from "./survey";

export const DERIVATION_RULE_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Quy đổi thang — PART 2.10                                           */
/* ------------------------------------------------------------------ */

/**
 * Likert 1–5 → 0–100:  ((raw − 1) / 4) × 100
 *
 * Chia cho 4 chứ không chia cho 5. Thang 1–5 có bốn bước, nên mức 1 phải thành
 * 0 và mức 5 thành 100. Chia cho 5 là lỗi kinh điển: không ai chạm được đáy và
 * trần thật sự chỉ là 100 khi trả lời cao nhất.
 */
export function likertToScore(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  if (raw < 1 || raw > 5) return null;
  return ((raw - 1) / 4) * 100;
}

/** Điểm môn thang 10 → 0–100. Ngoài thang trả null để lộ lỗi nhập liệu. */
export function subjectToScore(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  if (raw < 0 || raw > 10) return null;
  return raw * 10;
}

/** Slider đã ở thang 0–100, chỉ kiểm tra khoảng. */
export function sliderToScore(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  if (raw < 0 || raw > 100) return null;
  return raw;
}

export function clamp(value: number): number {
  return value < 0 ? 0 : value > 100 ? 100 : value;
}

/* ------------------------------------------------------------------ */
/* Đóng góp từ câu lựa chọn                                            */
/* ------------------------------------------------------------------ */

/**
 * Chọn một đáp án thì cộng thêm điểm cho biến nào.
 *
 * Đây là điểm CỘNG THÊM lên nền đã có từ các câu thang đo, không phải giá trị
 * thay thế. Một em tự nhận thế mạnh "Tư duy logic" ở Q13 thì được cộng, chứ
 * không vì thế mà bỏ qua câu Q23 em ấy tự chấm.
 *
 * Khoá là NHÃN tiếng Việt đúng như trong `survey.ts`. Có bài test đối chiếu
 * từng nhãn với danh sách lựa chọn, nên gõ sai một chữ là test đỏ ngay.
 */
export type OptionContribution = { variable: string; points: number };

export const OPTION_CONTRIBUTIONS: Record<
  string,
  Record<string, OptionContribution[]>
> = {
  // Q13 — thế mạnh tự nhận
  Q13: {
    "Tư duy logic": [{ variable: "ability.logical", points: 10 }],
    "Tính toán": [{ variable: "ability.numerical", points: 12 }],
    "Phân tích dữ liệu": [
      { variable: "ability.analytical", points: 8 },
      { variable: "interest.data", points: 8 },
    ],
    "Lập trình": [{ variable: "interest.programming", points: 10 }],
    "Máy móc/kỹ thuật": [{ variable: "ability.technical", points: 12 }],
    "Thiết kế": [{ variable: "ability.spatial", points: 10 }],
    "Vẽ": [{ variable: "ability.spatial", points: 12 }],
    "Viết": [{ variable: "ability.verbal", points: 12 }],
    "Ngôn ngữ": [{ variable: "ability.verbal", points: 10 }],
    "Giao tiếp": [{ variable: "ability.communication", points: 8 }],
    "Thuyết trình": [{ variable: "ability.communication", points: 8 }],
    "Làm việc nhóm": [{ variable: "ability.teamwork", points: 8 }],
    "Lãnh đạo": [{ variable: "ability.leadership", points: 15 }],
    "Tổ chức": [{ variable: "ability.organization", points: 8 }],
    "Nghiên cứu": [{ variable: "ability.research", points: 12 }],
    "Sáng tạo": [{ variable: "ability.creativity", points: 8 }],
    "Kinh doanh": [{ variable: "interest.business", points: 10 }],
    "Giải quyết vấn đề": [{ variable: "ability.problem_solving", points: 10 }],
    "Giúp đỡ người khác": [{ variable: "career_value.people", points: 15 }],
  },

  // Q22 — cách tiếp cận vấn đề khó
  Q22: {
    "Tự phân tích vấn đề": [{ variable: "thinking.analytical", points: 15 }],
    "Tìm ví dụ tương tự": [{ variable: "thinking.practical", points: 12 }],
    "Tìm thông tin trên Internet": [{ variable: "ability.research", points: 8 }],
    "Hỏi người có kinh nghiệm": [{ variable: "ability.communication", points: 6 }],
    "Thử nhiều cách": [{ variable: "thinking.experimental", points: 18 }],
    "Chia vấn đề thành các phần nhỏ": [
      { variable: "ability.problem_solving", points: 12 },
      { variable: "thinking.analytical", points: 8 },
    ],
    "Chờ hướng dẫn": [],
    "Tạm bỏ qua rồi quay lại sau": [],
  },

  // Q32 — vai trò trong nhóm
  Q32: {
    "Người đưa ý tưởng": [{ variable: "ability.creativity", points: 8 }],
    "Người phân tích": [{ variable: "ability.analytical", points: 8 }],
    "Người thực hiện": [{ variable: "thinking.practical", points: 8 }],
    "Người tổ chức": [{ variable: "ability.organization", points: 10 }],
    "Người điều phối": [{ variable: "ability.leadership", points: 15 }],
    "Người thuyết trình": [{ variable: "ability.communication", points: 10 }],
    "Người hỗ trợ": [{ variable: "ability.teamwork", points: 8 }],
    "Tùy dự án": [],
  },

  // Q34 — phản ứng khi kết quả chưa đạt
  Q34: {
    "Phân tích nguyên nhân": [{ variable: "thinking.analytical", points: 10 }],
    "Thử lại bằng cách khác": [{ variable: "thinking.experimental", points: 12 }],
    "Tìm người góp ý": [{ variable: "ability.communication", points: 6 }],
    "Điều chỉnh mục tiêu": [{ variable: "thinking.practical", points: 8 }],
    "Tiếp tục làm theo cách cũ": [],
    "Dễ mất động lực": [],
  },

  // Q38 — giá trị nghề nghiệp được chọn
  Q38: {
    "Thu nhập cao": [{ variable: "career_value.income", points: 10 }],
    "Ổn định": [{ variable: "career_value.stability", points: 10 }],
    "Cơ hội thăng tiến": [{ variable: "career_value.promotion", points: 15 }],
    "Sáng tạo": [{ variable: "career_value.creativity", points: 10 }],
    "Tự do": [{ variable: "career_value.freedom", points: 10 }],
    "Môi trường quốc tế": [{ variable: "career_value.international", points: 10 }],
    "Công nghệ": [{ variable: "career_value.technology", points: 10 }],
    "Tạo tác động xã hội": [{ variable: "career_value.social_impact", points: 10 }],
    "Làm việc với con người": [{ variable: "career_value.people", points: 20 }],
    "Thành tựu cá nhân": [{ variable: "career_value.achievement", points: 25 }],
    "Cân bằng cuộc sống": [{ variable: "career_value.work_life_balance", points: 25 }],
    "Tự chủ": [{ variable: "career_value.autonomy", points: 10 }],
    "Khởi nghiệp": [{ variable: "career_value.entrepreneurship", points: 10 }],
    "Nghiên cứu": [{ variable: "career_value.research", points: 20 }],
  },

  // Q47 — đối tượng muốn làm việc cùng
  Q47: {
    "Máy móc": [{ variable: "ability.technical", points: 8 }],
    "Máy tính": [{ variable: "interest.technology", points: 8 }],
    "Dữ liệu": [{ variable: "interest.data", points: 10 }],
    "Sản phẩm": [{ variable: "thinking.practical", points: 6 }],
    "Khách hàng": [{ variable: "career_value.people", points: 12 }],
    "Đồng nghiệp": [{ variable: "ability.teamwork", points: 6 }],
    "Học sinh/sinh viên": [{ variable: "interest.education", points: 12 }],
    "Bệnh nhân": [{ variable: "interest.healthcare", points: 12 }],
    "Cộng đồng": [{ variable: "career_value.social_impact", points: 12 }],
    "Thiên nhiên": [{ variable: "interest.environment", points: 12 }],
    "Công trình": [{ variable: "interest.construction", points: 12 }],
    "Nội dung/thông tin": [{ variable: "interest.communication", points: 10 }],
  },

  // Q50 — ưu tiên nếu phải chọn một
  Q50: {
    "Thu nhập cao": [{ variable: "career_value.income", points: 8 }],
    "Ổn định": [{ variable: "career_value.stability", points: 8 }],
    "Tự do": [{ variable: "career_value.freedom", points: 8 }],
    "Cơ hội phát triển": [{ variable: "career_value.promotion", points: 8 }],
    "Được làm điều mình thích": [{ variable: "career_value.autonomy", points: 6 }],
    "Tạo ảnh hưởng": [{ variable: "career_value.social_impact", points: 8 }],
    "Cân bằng cuộc sống": [{ variable: "career_value.work_life_balance", points: 10 }],
    "Chưa xác định": [],
  },
};

/**
 * Q14 — chọn một lĩnh vực thì cộng thêm cho đúng yếu tố quan tâm tương ứng.
 * Sinh tự động từ danh sách để khỏi phải chép tay 22 dòng và khỏi lệch nhau.
 */
export const INTEREST_SELECT_BONUS = 10;

/**
 * Q45 — môi trường làm việc mong muốn.
 *
 * Câu này là chọn nhiều. Nếu học sinh CÓ trả lời thì việc không chọn một môi
 * trường cũng là một câu trả lời — nên môi trường không chọn nhận điểm thấp
 * chứ không phải "thiếu dữ liệu". Nếu bỏ trống cả câu thì mới là thiếu.
 */
export const ENVIRONMENT_SELECTED = 90;
export const ENVIRONMENT_NOT_SELECTED = 30;

export const ENVIRONMENT_OPTION_MAP: Record<string, string> = {
  "Văn phòng": "environment.office",
  "Phòng thí nghiệm": "environment.lab",
  "Nhà máy": "environment.factory",
  Studio: "environment.studio",
  "Trường học": "environment.school",
  "Bệnh viện": "environment.hospital",
  "Công trường": "environment.construction_site",
  "Ngoài trời": "environment.outdoor",
  "Làm việc từ xa": "environment.remote",
  "Mô hình hybrid": "environment.hybrid",
  "Doanh nghiệp/startup": "environment.startup",
  "Trung tâm nghiên cứu": "environment.research_center",
};

/* ------------------------------------------------------------------ */
/* Luật suy diễn                                                       */
/* ------------------------------------------------------------------ */

export type DerivationMethod =
  | "passthrough"
  | "mean"
  | "weighted_mean"
  | "max"
  | "invert";

export type DerivationRule = {
  /** Mã luật, hiện trong dấu vết truy nguyên. */
  id: string;
  target: string;
  sources: string[];
  method: DerivationMethod;
  weights?: Record<string, number>;
};

/**
 * `invert` lấy 100 − nguồn. Dùng cho cặp đối nghĩa: Q35 đo mức ưa quy trình,
 * nên mức ưa linh hoạt chính là phần bù. Không hỏi lại thành hai câu (Rule S03).
 */
export const RULES: DerivationRule[] = [
  // ---- Ability suy ra từ nền học thuật và các năng lực đã tự chấm ----
  { id: "DR-001", target: "ability.numerical", sources: ["academic.math", "ability.logical"], method: "mean" },
  { id: "DR-002", target: "ability.verbal", sources: ["academic.literature", "academic.english", "ability.communication"], method: "mean" },
  { id: "DR-003", target: "ability.spatial", sources: ["interest.design", "interest.architecture"], method: "mean" },
  { id: "DR-004", target: "ability.technical", sources: ["academic.technology", "interest.machines", "interest.electronics"], method: "mean" },
  { id: "DR-005", target: "ability.problem_solving", sources: ["ability.analytical", "ability.logical", "learning.problem_solving_learning"], method: "mean" },
  { id: "DR-006", target: "ability.research", sources: ["interest.research", "ability.analytical", "learning.resource_seeking"], method: "mean" },
  { id: "DR-007", target: "ability.leadership", sources: ["ability.communication", "ability.organization"], method: "mean" },

  // ---- Thinking (PART 3.16), sau đó gộp vào nhóm Ability khi so khớp ----
  { id: "DR-010", target: "thinking.analytical", sources: ["ability.analytical"], method: "passthrough" },
  { id: "DR-011", target: "thinking.logical", sources: ["ability.logical"], method: "passthrough" },
  { id: "DR-012", target: "thinking.creative", sources: ["ability.creativity"], method: "passthrough" },
  { id: "DR-013", target: "thinking.research", sources: ["ability.research"], method: "passthrough" },
  { id: "DR-014", target: "thinking.practical", sources: ["work.practice_orientation"], method: "passthrough" },
  { id: "DR-015", target: "thinking.experimental", sources: ["learning.problem_solving_learning"], method: "passthrough" },

  // ---- Work Style (PART 3.18) ----
  { id: "DR-020", target: "work_style.social_interaction", sources: ["work.social_interaction_preference"], method: "passthrough" },
  { id: "DR-021", target: "work_style.independent", sources: ["ability.independent_work", "work.social_inverse"], method: "mean" },
  { id: "DR-022", target: "work_style.teamwork", sources: ["ability.teamwork", "work.social_interaction_preference"], method: "mean" },
  { id: "DR-023", target: "work_style.structure", sources: ["work.structure_preference"], method: "passthrough" },
  { id: "DR-024", target: "work_style.flexibility", sources: ["work.structure_inverse"], method: "passthrough" },
  { id: "DR-025", target: "work_style.autonomy", sources: ["work.autonomy_orientation", "work.autonomy_orientation_2"], method: "mean" },
  { id: "DR-026", target: "work_style.deep_work", sources: ["learning.deep_focus", "work.multitask_inverse"], method: "mean" },
  { id: "DR-027", target: "work_style.specialization", sources: ["work.specialization_orientation"], method: "passthrough" },
  { id: "DR-028", target: "work_style.multitasking", sources: ["work.multitasking_orientation"], method: "passthrough" },
  { id: "DR-029", target: "work_style.change_orientation", sources: ["work.change_orientation", "work.change_orientation_2"], method: "mean" },
  { id: "DR-030", target: "work_style.challenge_orientation", sources: ["work.challenge_orientation", "work.challenge_orientation_2"], method: "mean" },
  { id: "DR-031", target: "work_style.leadership", sources: ["ability.leadership"], method: "passthrough" },

  // ---- Career Value còn lại ----
  { id: "DR-040", target: "career_value.research", sources: ["interest.research"], method: "mean" },

  // ---- Chỉ số tổng hợp (PART 3.7, 3.10, 3.13) ----
  { id: "DR-050", target: "composite.stem_average", sources: ["academic.math", "academic.physics", "academic.chemistry", "academic.informatics", "academic.technology"], method: "mean" },
  { id: "DR-051", target: "composite.social_science_average", sources: ["academic.literature", "academic.history", "academic.geography"], method: "mean" },
  { id: "DR-052", target: "composite.language_average", sources: ["academic.literature", "academic.english"], method: "mean" },
  { id: "DR-053", target: "composite.technology_average", sources: ["academic.informatics", "academic.technology", "academic.math"], method: "mean" },
  { id: "DR-060", target: "composite.technology_interest", sources: ["interest.technology", "interest.programming", "interest.ai", "interest.data", "interest.electronics"], method: "mean" },
  { id: "DR-061", target: "composite.engineering_interest", sources: ["interest.machines", "interest.electronics", "interest.construction", "interest.technology"], method: "mean" },
  { id: "DR-062", target: "composite.creative_interest", sources: ["interest.design", "interest.architecture", "interest.arts", "interest.communication"], method: "mean" },
  { id: "DR-063", target: "composite.business_interest", sources: ["interest.business", "interest.finance", "interest.marketing"], method: "mean" },
  { id: "DR-064", target: "composite.social_interest", sources: ["interest.people", "interest.education", "interest.healthcare", "interest.communication"], method: "mean" },
  { id: "DR-065", target: "composite.research_interest", sources: ["interest.research", "interest.science", "interest.data", "interest.ai"], method: "mean" },
  { id: "DR-066", target: "composite.environment_interest", sources: ["interest.environment", "interest.agriculture"], method: "mean" },
  { id: "DR-070", target: "composite.analytical_ability", sources: ["ability.analytical", "ability.logical", "ability.numerical", "ability.problem_solving"], method: "mean" },
  { id: "DR-071", target: "composite.technical_ability", sources: ["ability.technical", "ability.spatial", "ability.logical", "ability.problem_solving"], method: "mean" },
  { id: "DR-072", target: "composite.creative_ability", sources: ["ability.creativity", "ability.spatial", "ability.verbal"], method: "mean" },
  { id: "DR-073", target: "composite.social_ability", sources: ["ability.communication", "ability.teamwork", "ability.leadership", "ability.verbal"], method: "mean" },
  { id: "DR-074", target: "composite.research_ability", sources: ["ability.analytical", "ability.logical", "ability.research", "ability.problem_solving"], method: "mean" },
];

export const RULE_BY_TARGET: ReadonlyMap<string, DerivationRule> = new Map(
  RULES.map((r) => [r.target, r])
);

/* ------------------------------------------------------------------ */
/* RIASEC — PART 2.7, 3.27                                             */
/* ------------------------------------------------------------------ */

/**
 * RIASEC không lấy từ một câu hỏi duy nhất mà tổng hợp từ nhiều nguồn, theo
 * đúng 3.27. Mỗi dòng là một đóng góp có trọng số; giá trị chiều là trung bình
 * có trọng số của những nguồn CÓ dữ liệu.
 *
 * Không suy RIASEC từ tên ngành hay tên nghề (5.22) — ở đây chỉ dùng biến đã
 * chuẩn hoá từ câu trả lời của chính học sinh.
 */
export type RiasecContribution = { source: string; weight: number };

export const RIASEC_MAP: Record<RiasecKey, RiasecContribution[]> = {
  R: [
    { source: "interest.machines", weight: 1 },
    { source: "interest.electronics", weight: 1 },
    { source: "interest.construction", weight: 0.8 },
    { source: "interest.agriculture", weight: 0.6 },
    { source: "ability.technical", weight: 1 },
    { source: "work.practice_orientation", weight: 0.8 },
  ],
  I: [
    { source: "interest.research", weight: 1 },
    { source: "interest.science", weight: 1 },
    { source: "interest.data", weight: 0.9 },
    { source: "interest.ai", weight: 0.8 },
    { source: "ability.analytical", weight: 1 },
    { source: "ability.logical", weight: 0.9 },
    { source: "ability.research", weight: 1 },
  ],
  A: [
    { source: "interest.design", weight: 1 },
    { source: "interest.arts", weight: 1 },
    { source: "interest.architecture", weight: 0.8 },
    { source: "ability.creativity", weight: 1 },
  ],
  S: [
    { source: "interest.education", weight: 1 },
    { source: "interest.healthcare", weight: 0.9 },
    { source: "interest.people", weight: 1 },
    { source: "ability.communication", weight: 0.8 },
    { source: "ability.teamwork", weight: 0.8 },
  ],
  E: [
    { source: "interest.business", weight: 1 },
    { source: "interest.marketing", weight: 0.9 },
    { source: "interest.finance", weight: 0.8 },
    { source: "ability.leadership", weight: 1 },
    { source: "career_value.entrepreneurship", weight: 0.8 },
  ],
  C: [
    { source: "ability.organization", weight: 1 },
    { source: "work.structure_preference", weight: 0.9 },
    { source: "interest.finance", weight: 0.6 },
  ],
};

/** Số nguồn tối thiểu có dữ liệu để một chiều RIASEC được coi là đáng tin. */
export const RIASEC_MIN_SOURCES = 3;

/* ------------------------------------------------------------------ */
/* Phát hiện vòng lặp — PART 3.58                                      */
/* ------------------------------------------------------------------ */

/**
 * Tìm vòng lặp trong đồ thị phụ thuộc giữa các luật.
 *
 * A → B → C → A sẽ làm bộ tính chạy mãi hoặc ra giá trị vô nghĩa tuỳ thứ tự
 * duyệt. Kiểm tra trước, một lần, ở bước nạp cấu hình; test gọi hàm này nên
 * một luật viết ẩu sẽ rơi ở CI chứ không rơi vào giữa buổi tư vấn.
 */
export function findDerivationCycles(rules: DerivationRule[] = RULES): string[][] {
  const byTarget = new Map(rules.map((r) => [r.target, r]));
  const cycles: string[][] = [];
  const state = new Map<string, "visiting" | "done">();

  function visit(node: string, path: string[]): void {
    const seen = state.get(node);
    if (seen === "done") return;
    if (seen === "visiting") {
      const start = path.indexOf(node);
      cycles.push([...path.slice(start), node]);
      return;
    }
    const rule = byTarget.get(node);
    if (!rule) return; // biến gốc, không phải biến suy diễn

    state.set(node, "visiting");
    for (const src of rule.sources) visit(src, [...path, node]);
    state.set(node, "done");
  }

  for (const r of rules) visit(r.target, []);
  return cycles;
}

/** Thứ tự tính sao cho mọi nguồn đã sẵn sàng trước khi tới đích. */
export function evaluationOrder(rules: DerivationRule[] = RULES): DerivationRule[] {
  const byTarget = new Map(rules.map((r) => [r.target, r]));
  const out: DerivationRule[] = [];
  const done = new Set<string>();
  const guard = new Set<string>();

  function visit(node: string): void {
    if (done.has(node) || guard.has(node)) return;
    const rule = byTarget.get(node);
    if (!rule) return;
    guard.add(node);
    for (const src of rule.sources) visit(src);
    guard.delete(node);
    done.add(node);
    out.push(rule);
  }

  for (const r of rules) visit(r.target);
  return out;
}

/* ------------------------------------------------------------------ */
/* Áp dụng một luật                                                    */
/* ------------------------------------------------------------------ */

/**
 * Tính giá trị đích từ các nguồn đã có.
 *
 * Nguồn thiếu bị LOẠI khỏi phép tính, không coi là 0 (PART 6.11 và cùng tinh
 * thần ở 2.11). Không nguồn nào có dữ liệu thì trả null — biến đó không tồn
 * tại, khác hẳn biến bằng 0.
 */
export function applyRule(
  rule: DerivationRule,
  values: Record<string, number | null | undefined>
): number | null {
  const available: { key: string; value: number }[] = [];
  for (const key of rule.sources) {
    const v = values[key];
    if (typeof v === "number" && Number.isFinite(v)) available.push({ key, value: v });
  }
  if (available.length === 0) return null;

  switch (rule.method) {
    case "passthrough":
      return clamp(available[0].value);
    case "invert":
      return clamp(100 - available[0].value);
    case "max":
      return clamp(Math.max(...available.map((a) => a.value)));
    case "mean":
      return clamp(available.reduce((s, a) => s + a.value, 0) / available.length);
    case "weighted_mean": {
      const w = rule.weights ?? {};
      let num = 0;
      let den = 0;
      for (const a of available) {
        const weight = w[a.key] ?? 1;
        num += a.value * weight;
        den += weight;
      }
      return den > 0 ? clamp(num / den) : null;
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Danh sách biến đích mà Matching Engine cần                          */
/* ------------------------------------------------------------------ */

/** Toàn bộ mã yếu tố mà hồ sơ nên cố gắng điền, để tính coverage của hồ sơ. */
export function expectedFactorKeys(): string[] {
  return [
    ...SUBJECTS.map((s) => `academic.${s}`),
    ...INTEREST_DOMAINS.map((d) => `interest.${d}`),
    "ability.analytical", "ability.logical", "ability.numerical", "ability.verbal",
    "ability.spatial", "ability.technical", "ability.creativity", "ability.communication",
    "ability.teamwork", "ability.problem_solving", "ability.research",
    "ability.organization", "ability.leadership", "ability.independent_work",
    "thinking.analytical", "thinking.logical", "thinking.creative",
    "thinking.experimental", "thinking.research", "thinking.practical",
    "work_style.independent", "work_style.teamwork", "work_style.leadership",
    "work_style.flexibility", "work_style.structure", "work_style.autonomy",
    "work_style.deep_work", "work_style.social_interaction", "work_style.specialization",
    "work_style.multitasking", "work_style.change_orientation",
    "work_style.challenge_orientation",
    "career_value.income", "career_value.stability", "career_value.promotion",
    "career_value.creativity", "career_value.freedom", "career_value.international",
    "career_value.technology", "career_value.social_impact", "career_value.people",
    "career_value.achievement", "career_value.work_life_balance", "career_value.autonomy",
    "career_value.entrepreneurship", "career_value.research",
    "environment.office", "environment.lab", "environment.factory", "environment.studio",
    "environment.school", "environment.hospital", "environment.construction_site",
    "environment.outdoor", "environment.remote", "environment.hybrid",
    "environment.startup", "environment.research_center",
  ];
}
