/**
 * STUDENT PROFILE ENGINE — PART 3.
 *
 * Đường ống cố định 12 bước (3.56), không rẽ tắt:
 *
 *   1 nạp câu trả lời      7 tính RIASEC
 *   2 kiểm tra hợp lệ      8 dựng hồ sơ điều kiện
 *   3 rút biến thô         9 tính completeness
 *   4 chuẩn hoá           10 tính confidence
 *   5 áp luật suy diễn    11 tạo snapshot
 *   6 tính chỉ số tổng hợp 12 đánh dấu READY_FOR_MATCHING
 *
 * ĐIỀU FILE NÀY KHÔNG ĐƯỢC LÀM (3.49): không được sinh ra bất kỳ biến nào kiểu
 * `recommended_major`. Hồ sơ mô tả học sinh, việc gợi ý ngành thuộc về
 * Matching Engine. Trộn hai việc lại là mất khả năng giải thích vì sao.
 */

import { FACTOR_BY_ID, GROUP_ORDER, factorsOfGroup } from "./config";
import {
  DERIVATION_RULE_VERSION,
  ENVIRONMENT_NOT_SELECTED,
  ENVIRONMENT_OPTION_MAP,
  ENVIRONMENT_SELECTED,
  INTEREST_SELECT_BONUS,
  OPTION_CONTRIBUTIONS,
  RIASEC_MAP,
  RIASEC_MIN_SOURCES,
  applyRule,
  clamp,
  evaluationOrder,
  expectedFactorKeys,
  findDerivationCycles,
  likertToScore,
  sliderToScore,
  subjectToScore,
} from "./derivation";
import {
  INTEREST_DOMAINS,
  INTEREST_LABEL,
  QUESTIONS,
  SUBJECTS,
  qualityFlags,
  requiredQuestionCodes,
  type Answer,
  type MatrixAnswer,
  type QualityFlag,
  type SurveyResponse,
} from "./survey";
import { RIASEC_KEYS, type GroupCode, type PartialRiasec, type RiasecKey, type StudentProfile } from "./types";

/* ------------------------------------------------------------------ */
/* Bảng biến kèm dấu vết truy nguyên — PART 3.48                       */
/* ------------------------------------------------------------------ */

export type VariableOrigin = {
  /** Câu hỏi gốc, ví dụ ["Q07"]. Rỗng khi biến hoàn toàn do suy diễn. */
  questions: string[];
  /** Mã luật suy diễn, ví dụ "DR-001". Rỗng khi là biến thô. */
  ruleId: string | null;
  /** Biến nguồn trực tiếp. */
  sources: string[];
  /** Tự đánh giá hay đo được — PART 3.14. */
  measurement: "self_reported" | "derived" | "declared";
};

export type VariableTable = Record<string, number | null>;
export type LineageTable = Record<string, VariableOrigin>;

class Builder {
  values: VariableTable = {};
  lineage: LineageTable = {};
  /**
   * Điểm cộng từ các câu lựa chọn, GIỮ RIÊNG cho tới sau bước suy diễn.
   *
   * Vì sao không cộng thẳng: `thinking.analytical` không có câu hỏi riêng, nền
   * của nó đến từ luật DR-010 (lấy theo `ability.analytical`). Nếu điểm cộng
   * từ Q22/Q34 ghi vào trước thì biến đã "có giá trị", luật bị bỏ qua, và một
   * em tự chấm phân tích 5/5 lại nhận lối nghĩ phân tích 18/100. Cộng sau thì
   * điểm cộng đúng là điểm cộng, không phải thứ chặn mất nền.
   */
  bonuses: Record<string, { points: number; questions: string[] }> = {};

  set(
    key: string,
    value: number | null,
    origin: VariableOrigin
  ): void {
    if (value === null) return;
    this.values[key] = clamp(value);
    this.lineage[key] = origin;
  }

  /** Ghi nhận một điểm cộng. Chưa áp vào giá trị — xem `applyBonuses`. */
  add(key: string, points: number, question: string): void {
    const entry = this.bonuses[key] ?? { points: 0, questions: [] };
    entry.points += points;
    if (!entry.questions.includes(question)) entry.questions.push(question);
    this.bonuses[key] = entry;
  }

  /**
   * Áp điểm cộng lên nền đã có. Biến chưa có nền thì điểm cộng tự nó thành giá
   * trị — tín hiệu yếu nhưng có thật, ví dụ `career_value.people` vốn không có
   * câu hỏi thang đo nào.
   */
  applyBonuses(): void {
    for (const [key, entry] of Object.entries(this.bonuses)) {
      const current = this.values[key];
      const base = typeof current === "number" ? current : 0;
      this.values[key] = clamp(base + entry.points);

      const existing = this.lineage[key];
      if (existing) {
        for (const qcode of entry.questions) {
          if (!existing.questions.includes(qcode)) existing.questions.push(qcode);
        }
      } else {
        this.lineage[key] = {
          questions: [...entry.questions],
          ruleId: null,
          sources: [],
          measurement: "self_reported",
        };
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Kết quả                                                             */
/* ------------------------------------------------------------------ */

export const PROFILE_ERRORS = [
  "SURVEY_NOT_COMPLETED",
  "PROFILE_DERIVATION_CYCLE",
  "NO_USABLE_ANSWERS",
  "INVALID_ANSWER",
] as const;
export type ProfileError = (typeof PROFILE_ERRORS)[number];

export type ValidationIssue = { question: string; problem: string };

/** PART 3.67. */
export const QUALITY_LEVELS = ["HIGH", "MEDIUM", "LIMITED", "INSUFFICIENT"] as const;
export type QualityLevel = (typeof QUALITY_LEVELS)[number];

export type ProfileDetail = {
  /** Toàn bộ biến đã tính, kể cả biến trung gian không phải factor. */
  variables: VariableTable;
  lineage: LineageTable;
  /** Độ tin của từng nhóm hồ sơ — PART 3.38. */
  groupConfidence: Record<GroupCode, number>;
  groupQuality: Record<GroupCode, QualityLevel>;
  riasecConfidence: number;
  /** PART 3.30 — điều kiện thực tế, KHÔNG trộn với năng lực/sở thích. */
  constraints: StudentConstraints;
  /** PART 3.41 — đầy đủ khác đáng tin. */
  reliability: number;
  qualityFlags: QualityFlag[];
  validationIssues: ValidationIssue[];
};

export type StudentConstraints = {
  currentProvince: string | null;
  annualTuitionBudget: string | null;
  financialAidNeed: string | null;
  expectedThptScore: number | null;
  expectedAdmissionMethods: string[];
  specialConstraints: string[];
};

export type BuildOutcome =
  | { ok: true; profile: StudentProfile; detail: ProfileDetail }
  | { ok: false; error: ProfileError; detail: string };

export type BuildOptions = {
  /** Cho phép dựng hồ sơ dù khảo sát chưa submit — dùng khi xem thử giữa chừng. */
  allowIncomplete?: boolean;
  now?: () => string;
  profileVersion?: number;
};

/* ------------------------------------------------------------------ */
/* Đọc câu trả lời                                                     */
/* ------------------------------------------------------------------ */

function matrixOf(answer: Answer): MatrixAnswer | null {
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) return null;
  return answer as MatrixAnswer;
}

/** Chỉ lấy các lựa chọn dạng chuỗi — câu chứng chỉ Q61 trả về object, không phải nhãn. */
function listOf(answer: Answer): string[] {
  if (!Array.isArray(answer)) return [];
  return (answer as unknown[]).filter((x): x is string => typeof x === "string");
}

/* ------------------------------------------------------------------ */
/* Bước 2 — kiểm tra hợp lệ                                            */
/* ------------------------------------------------------------------ */

/**
 * Soát câu trả lời ngoài khoảng hoặc sai kiểu.
 *
 * KHÔNG âm thầm bỏ qua lỗi (3.57). Điểm 12 trên thang 10 là lỗi nhập liệu, làm
 * tròn xuống 10 sẽ giấu mất nó; ở đây ghi lại thành issue và bỏ giá trị đó ra
 * khỏi hồ sơ, để chỗ khác biết là thiếu chứ không tưởng là đã có.
 */
export function validateResponse(response: SurveyResponse): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const question of QUESTIONS) {
    const answer = response.answers[question.code];
    if (answer === null || answer === undefined) continue;

    if (question.type === "subject_score_matrix") {
      const m = matrixOf(answer);
      if (!m) {
        issues.push({ question: question.code, problem: "Không đọc được bảng điểm môn" });
        continue;
      }
      for (const [subject, value] of Object.entries(m)) {
        if (value === null) continue;
        if (typeof value !== "number" || value < 0 || value > 10) {
          issues.push({ question: question.code, problem: `Điểm ${subject} ngoài thang 0–10` });
        }
      }
      continue;
    }

    if (question.type === "likert_1_5" && typeof answer === "number") {
      if (answer < 1 || answer > 5) {
        issues.push({ question: question.code, problem: "Giá trị ngoài thang 1–5" });
      }
      continue;
    }

    if (question.type === "matrix_likert_1_5") {
      const m = matrixOf(answer);
      if (!m) {
        issues.push({ question: question.code, problem: "Không đọc được bảng trả lời" });
        continue;
      }
      for (const [dim, value] of Object.entries(m)) {
        if (value === null) continue;
        if (typeof value !== "number" || value < 1 || value > 5) {
          issues.push({ question: question.code, problem: `Mục ${dim} ngoài thang 1–5` });
        }
      }
      continue;
    }

    if ((question.type === "slider" || question.type === "slider_matrix") && question.range) {
      if (question.type === "slider" && typeof answer === "number") {
        if (answer < 0 || answer > 100) {
          issues.push({ question: question.code, problem: "Giá trị ngoài thang 0–100" });
        }
      }
      continue;
    }

    if (question.type === "numeric" && question.range && typeof answer === "number") {
      if (answer < question.range.min || answer > question.range.max) {
        issues.push({
          question: question.code,
          problem: `Giá trị ngoài khoảng ${question.range.min}–${question.range.max}`,
        });
      }
      continue;
    }

    if (question.max !== undefined && Array.isArray(answer) && answer.length > question.max) {
      issues.push({ question: question.code, problem: `Chọn quá ${question.max} mục` });
    }
  }

  return issues;
}

/* ------------------------------------------------------------------ */
/* Bước 3–4 — rút và chuẩn hoá biến thô                                */
/* ------------------------------------------------------------------ */

function selfReported(questions: string[]): VariableOrigin {
  return { questions, ruleId: null, sources: [], measurement: "self_reported" };
}

function extractRaw(response: SurveyResponse, invalid: Set<string>): Builder {
  const b = new Builder();
  const a = response.answers;

  /* --- Q07 điểm môn: thang 10 → 0–100 --- */
  const scores = matrixOf(a.Q07);
  if (scores) {
    for (const subject of SUBJECTS) {
      if (invalid.has(`Q07:${subject}`)) continue;
      b.set(`academic.${subject}`, subjectToScore(scores[subject]), {
        questions: ["Q07"],
        ruleId: null,
        sources: [],
        measurement: "declared",
      });
    }
  }

  /* --- Q11 hành vi học tập --- */
  const learn = matrixOf(a.Q11);
  if (learn) {
    for (const [dim, value] of Object.entries(learn)) {
      b.set(`learning.${dim}`, likertToScore(value), selfReported(["Q11"]));
    }
  }
  b.set("learning.self_confidence", likertToScore(a.Q12), selfReported(["Q12"]));

  /* --- Q15 mức hứng thú 22 lĩnh vực --- */
  const interests = matrixOf(a.Q15);
  if (interests) {
    for (const domain of INTEREST_DOMAINS) {
      b.set(`interest.${domain}`, likertToScore(interests[domain]), selfReported(["Q15"]));
    }
  }

  /* --- Q14 chọn lĩnh vực: cộng thêm lên nền Q15 --- */
  for (const label of listOf(a.Q14)) {
    const domain = INTEREST_DOMAINS.find((d) => INTEREST_LABEL[d] === label);
    if (domain) b.add(`interest.${domain}`, INTEREST_SELECT_BONUS, "Q14");
  }

  /* --- Q23–Q29 năng lực tự chấm --- */
  const abilityQuestions: [string, string][] = [
    ["Q23", "ability.logical"],
    ["Q24", "ability.analytical"],
    ["Q25", "ability.creativity"],
    ["Q26", "ability.communication"],
    ["Q27", "ability.teamwork"],
    ["Q28", "ability.organization"],
    ["Q29", "ability.independent_work"],
  ];
  for (const [code, key] of abilityQuestions) {
    b.set(key, likertToScore(a[code]), selfReported([code]));
  }

  /* --- Q20 và Q37 các thanh trượt về cách làm việc --- */
  const w20 = matrixOf(a.Q20);
  if (w20) {
    for (const [dim, value] of Object.entries(w20)) {
      b.set(`work.${dim}`, sliderToScore(value), selfReported(["Q20"]));
    }
  }
  const w37 = matrixOf(a.Q37);
  if (w37) {
    for (const [dim, value] of Object.entries(w37)) {
      b.set(`work.${dim}_2`, sliderToScore(value), selfReported(["Q37"]));
    }
  }

  b.set("work.structure_preference", sliderToScore(a.Q35), selfReported(["Q35"]));
  b.set("work.social_interaction_preference", sliderToScore(a.Q36), selfReported(["Q36"]));

  /* --- Phần bù của các cặp đối nghĩa. Không hỏi lại thành câu riêng (S03). --- */
  const structure = b.values["work.structure_preference"];
  if (typeof structure === "number") {
    b.set("work.structure_inverse", 100 - structure, {
      questions: ["Q35"], ruleId: "INV", sources: ["work.structure_preference"], measurement: "derived",
    });
  }
  const social = b.values["work.social_interaction_preference"];
  if (typeof social === "number") {
    b.set("work.social_inverse", 100 - social, {
      questions: ["Q36"], ruleId: "INV", sources: ["work.social_interaction_preference"], measurement: "derived",
    });
  }
  const multitask = b.values["work.multitasking_orientation_2"];
  if (typeof multitask === "number") {
    b.set("work.multitasking_orientation", multitask, {
      questions: ["Q37"], ruleId: "INV", sources: ["work.multitasking_orientation_2"], measurement: "derived",
    });
    b.set("work.multitask_inverse", 100 - multitask, {
      questions: ["Q37"], ruleId: "INV", sources: ["work.multitasking_orientation_2"], measurement: "derived",
    });
  }

  /* --- Q40–Q44 giá trị nghề nghiệp, mức tuyệt đối (ưu tiên hơn xếp hạng Q39) --- */
  b.set("career_value.income", likertToScore(a.Q40), selfReported(["Q40"]));
  b.set("career_value.stability", likertToScore(a.Q41), selfReported(["Q41"]));
  const v42 = matrixOf(a.Q42);
  if (v42) {
    for (const dim of ["creativity", "autonomy", "freedom", "entrepreneurship"]) {
      b.set(`career_value.${dim}`, likertToScore(v42[dim]), selfReported(["Q42"]));
    }
  }
  const v43 = matrixOf(a.Q43);
  if (v43) {
    b.set("career_value.international", likertToScore(v43.international), selfReported(["Q43"]));
    b.set("career_value.technology", likertToScore(v43.technology), selfReported(["Q43"]));
    b.set("career_value.promotion", likertToScore(v43.career_growth), selfReported(["Q43"]));
  }
  b.set("career_value.social_impact", likertToScore(a.Q44), selfReported(["Q44"]));

  /* --- Q45 môi trường làm việc mong muốn --- */
  const envAnswer = a.Q45;
  if (Array.isArray(envAnswer)) {
    const chosen = new Set(listOf(envAnswer));
    for (const [label, key] of Object.entries(ENVIRONMENT_OPTION_MAP)) {
      b.set(
        key,
        chosen.has(label) ? ENVIRONMENT_SELECTED : ENVIRONMENT_NOT_SELECTED,
        selfReported(["Q45"])
      );
    }
  }

  /* --- Đóng góp từ các câu lựa chọn --- */
  for (const [code, table] of Object.entries(OPTION_CONTRIBUTIONS)) {
    const answer = a[code];
    const picked = Array.isArray(answer) ? listOf(answer) : typeof answer === "string" ? [answer] : [];
    for (const label of picked) {
      for (const c of table[label] ?? []) b.add(c.variable, c.points, code);
    }
  }

  return b;
}

/* ------------------------------------------------------------------ */
/* Bước 7 — RIASEC                                                     */
/* ------------------------------------------------------------------ */

export function deriveRiasec(values: VariableTable): {
  riasec: PartialRiasec;
  confidence: number;
} {
  const riasec: PartialRiasec = {};
  let covered = 0;

  for (const dim of RIASEC_KEYS) {
    let num = 0;
    let den = 0;
    let count = 0;
    for (const c of RIASEC_MAP[dim]) {
      const v = values[c.source];
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      num += v * c.weight;
      den += c.weight;
      count += 1;
    }
    if (count >= RIASEC_MIN_SOURCES && den > 0) {
      riasec[dim] = clamp(num / den);
      covered += 1;
    } else {
      riasec[dim] = null;
    }
  }

  return { riasec, confidence: covered / RIASEC_KEYS.length };
}

/** Ba chiều trội. Giao diện hiển thị bằng lời, không khẳng định "bạn là kiểu I-R-A". */
export function dominantRiasec(riasec: PartialRiasec, size = 3): RiasecKey[] {
  return [...RIASEC_KEYS]
    .filter((k) => typeof riasec[k] === "number")
    .sort((a, b) => (riasec[b] as number) - (riasec[a] as number))
    .slice(0, size);
}

/* ------------------------------------------------------------------ */
/* Bước 10 — độ tin cậy theo nhóm                                      */
/* ------------------------------------------------------------------ */

function qualityOf(confidence: number): QualityLevel {
  if (confidence >= 0.85) return "HIGH";
  if (confidence >= 0.6) return "MEDIUM";
  if (confidence >= 0.3) return "LIMITED";
  return "INSUFFICIENT";
}

/* ------------------------------------------------------------------ */
/* Pipeline                                                            */
/* ------------------------------------------------------------------ */

export function buildProfile(
  response: SurveyResponse,
  options: BuildOptions = {}
): BuildOutcome {
  const now = options.now ?? (() => new Date().toISOString());

  /* --- 1. Nạp --- */
  if (response.status !== "COMPLETED" && !options.allowIncomplete) {
    return {
      ok: false,
      error: "SURVEY_NOT_COMPLETED",
      detail: `Khảo sát đang ở trạng thái ${response.status}`,
    };
  }

  /* --- Bảo vệ khỏi vòng lặp suy diễn (3.58) --- */
  const cycles = findDerivationCycles();
  if (cycles.length > 0) {
    return {
      ok: false,
      error: "PROFILE_DERIVATION_CYCLE",
      detail: cycles.map((c) => c.join(" → ")).join("; "),
    };
  }

  /* --- 2. Kiểm tra hợp lệ --- */
  const validationIssues = validateResponse(response);
  const invalid = new Set<string>();
  for (const issue of validationIssues) {
    const subject = /Điểm (\w+) ngoài thang/.exec(issue.problem);
    if (subject) invalid.add(`${issue.question}:${subject[1]}`);
  }

  /* --- 3–4. Rút và chuẩn hoá --- */
  const builder = extractRaw(response, invalid);

  if (Object.keys(builder.values).length === 0) {
    return { ok: false, error: "NO_USABLE_ANSWERS", detail: "Chưa có câu trả lời nào dùng được" };
  }

  /* --- 5–6. Suy diễn theo đúng thứ tự phụ thuộc --- */
  for (const rule of evaluationOrder()) {
    // Biến đã có từ câu hỏi trực tiếp thì không ghi đè bằng biến suy diễn:
    // câu trả lời của chính học sinh luôn thắng suy đoán của hệ thống.
    if (typeof builder.values[rule.target] === "number") continue;

    const value = applyRule(rule, builder.values);
    if (value === null) continue;

    const questions = new Set<string>();
    for (const src of rule.sources) {
      for (const qcode of builder.lineage[src]?.questions ?? []) questions.add(qcode);
    }
    builder.set(rule.target, value, {
      questions: [...questions],
      ruleId: rule.id,
      sources: rule.sources,
      measurement: "derived",
    });
  }

  // Điểm cộng từ các câu lựa chọn áp SAU cùng, lên trên nền đã suy diễn.
  builder.applyBonuses();

  /* --- 7. RIASEC --- */
  const { riasec, confidence: riasecConfidence } = deriveRiasec(builder.values);

  /* --- 8. Điều kiện thực tế, tách hẳn khỏi năng lực và sở thích (3.30) --- */
  const a = response.answers;
  const constraints: StudentConstraints = {
    currentProvince: typeof a.Q03 === "string" ? a.Q03 : null,
    annualTuitionBudget: typeof a.Q57 === "string" ? a.Q57 : null,
    financialAidNeed: typeof a.Q58 === "string" ? a.Q58 : null,
    expectedThptScore: typeof a.Q59 === "number" ? a.Q59 : null,
    expectedAdmissionMethods: listOf(a.Q60),
    specialConstraints: listOf(a.Q62),
  };

  /* --- Chỉ giữ lại đúng những mã yếu tố Matching Engine biết --- */
  const factors: Record<string, number> = {};
  for (const key of expectedFactorKeys()) {
    const v = builder.values[key];
    if (typeof v === "number" && FACTOR_BY_ID.has(key)) factors[key] = v;
  }

  /* --- 9. Completeness: tính trên câu hỏi, không tính trên biến --- */
  const required = requiredQuestionCodes();
  const missingQuestions = required.filter((code) => {
    const ans = response.answers[code];
    if (ans === null || ans === undefined) return true;
    if (Array.isArray(ans)) return ans.length === 0;
    if (typeof ans === "object") {
      return Object.values(ans as MatrixAnswer).every((v) => v === null || v === undefined);
    }
    return false;
  });
  const completenessValue =
    required.length === 0 ? 0 : (required.length - missingQuestions.length) / required.length;

  /* --- 10. Độ tin theo nhóm --- */
  const groupConfidence = {} as Record<GroupCode, number>;
  const groupQuality = {} as Record<GroupCode, QualityLevel>;
  for (const group of GROUP_ORDER) {
    if (group === "RIASEC") {
      groupConfidence.RIASEC = riasecConfidence;
      groupQuality.RIASEC = qualityOf(riasecConfidence);
      continue;
    }
    const defs = factorsOfGroup(group);
    const have = defs.filter((d) => typeof factors[d.id] === "number").length;
    const c = defs.length === 0 ? 0 : have / defs.length;
    groupConfidence[group] = c;
    groupQuality[group] = qualityOf(c);
  }

  /**
   * 3.41 — đầy đủ khác đáng tin. Một hồ sơ có thể điền kín mà phần lớn dữ liệu
   * là tự đánh giá. Ta hạ mức tin theo tỉ lệ biến `self_reported`, để chỗ nào
   * đọc con số này cũng biết nó dựa trên cái gì.
   */
  const origins = Object.values(builder.lineage);
  const selfCount = origins.filter((o) => o.measurement === "self_reported").length;
  const selfRatio = origins.length === 0 ? 1 : selfCount / origins.length;
  const reliability = clamp((1 - 0.25 * selfRatio) * 100) / 100;

  /* --- 11–12. Snapshot --- */
  const profile: StudentProfile = {
    profileId: `${response.studentId}-v${options.profileVersion ?? 1}`,
    version: options.profileVersion ?? 1,
    status: completenessValue >= 1 ? "READY_FOR_MATCHING" : "PARTIAL",
    factors,
    riasec,
    completeness: {
      value: completenessValue,
      answered: required.length - missingQuestions.length,
      required: required.length,
      missing: missingQuestions,
    },
    surveyVersion: response.surveyVersion,
    createdAt: now(),
  };

  return {
    ok: true,
    profile,
    detail: {
      variables: builder.values,
      lineage: builder.lineage,
      groupConfidence,
      groupQuality,
      riasecConfidence,
      constraints,
      reliability,
      qualityFlags: qualityFlags(response),
      validationIssues,
    },
  };
}

/* ------------------------------------------------------------------ */
/* What-if — PART 3.45                                                 */
/* ------------------------------------------------------------------ */

/**
 * Tạo hồ sơ tạm cho kịch bản giả định.
 *
 * Trả về object mới; hồ sơ gốc không bị đụng tới. Nếu sửa tại chỗ thì một lần
 * bấm thử "nếu Toán của em là 8 điểm" sẽ ghi đè hồ sơ thật.
 */
export function temporaryProfile(
  base: StudentProfile,
  changes: Record<string, number>
): StudentProfile {
  return { ...base, factors: { ...base.factors, ...changes } };
}

/** Dấu vết truy nguyên của một biến, để trả lời "con số này ở đâu ra". */
export function explainVariable(
  detail: ProfileDetail,
  key: string
): { value: number | null; origin: VariableOrigin | null } {
  return {
    value: detail.variables[key] ?? null,
    origin: detail.lineage[key] ?? null,
  };
}

export const PROFILE_DERIVATION_RULE_VERSION = DERIVATION_RULE_VERSION;
