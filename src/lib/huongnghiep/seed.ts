/**
 * DỮ LIỆU MẪU ĐỂ PHÁT TRIỂN — PART 5.36.
 *
 * ⚠ TOÀN BỘ SỐ LIỆU Ở ĐÂY LÀ `DEVELOPMENT_ASSUMPTION` (nguồn Level 5 theo
 * PART 5.47). Chúng lấy từ ví dụ minh hoạ trong tài liệu, dùng để chạy thử và
 * viết test. Không phải yêu cầu chính thức của bất kỳ chương trình đào tạo
 * nào, không được trình bày ra ngoài như dữ liệu thật, và giao diện phải gắn
 * nhãn cảnh báo khi đang đọc loại này.
 */

import { INTEREST_DOMAINS, SURVEY_VERSION, type SurveyResponse } from "./survey";
import type {
  Direction,
  MajorDna,
  MajorFactorValue,
  Provenance,
  RequirementType,
  StudentProfile,
} from "./types";

export const SEED_PROVENANCE: Provenance = {
  source: "PART 5.36 — ví dụ minh hoạ trong tài liệu đặc tả",
  sourceType: "DEVELOPMENT_ASSUMPTION",
  collectedAt: "2026-01-01",
};

/** Dựng một ô DNA cho gọn. */
export function mf(
  factorCode: string,
  expectedScore: number,
  importance: number,
  opts: {
    minimumScore?: number | null;
    requirementType?: RequirementType;
    direction?: Direction;
    confidence?: number;
    explanation?: string;
  } = {}
): MajorFactorValue {
  return {
    factorCode,
    expectedScore,
    importance,
    minimumScore: opts.minimumScore ?? null,
    requirementType: opts.requirementType ?? "SUPPORTING",
    direction: opts.direction ?? "POSITIVE",
    confidence: opts.confidence ?? 0.8,
    explanation: opts.explanation ?? "Dữ liệu phát triển, chưa có nguồn chính thức.",
  };
}

function toMap(list: MajorFactorValue[]): Record<string, MajorFactorValue> {
  const out: Record<string, MajorFactorValue> = {};
  for (const f of list) out[f.factorCode] = f;
  return out;
}

/* ------------------------------------------------------------------ */
/* Khoa học dữ liệu — PART 5.36                                        */
/* ------------------------------------------------------------------ */

export const DATA_SCIENCE_DNA: MajorDna = {
  majorId: "DS001",
  majorCode: "DATA_SCIENCE",
  nameVi: "Khoa học dữ liệu",
  nameEn: "Data Science",
  groupCode: "G01",
  version: 1,
  status: "PUBLISHED",

  factors: toMap([
    // Academic
    mf("academic.math", 95, 95, {
      minimumScore: 55,
      requirementType: "CORE",
      confidence: 0.9,
      explanation: "Nền tảng Toán có vai trò quan trọng trong nhiều học phần của ngành.",
    }),
    mf("academic.informatics", 85, 80, {
      minimumScore: 45,
      requirementType: "IMPORTANT",
    }),
    mf("academic.english", 70, 65, { requirementType: "SUPPORTING" }),
    mf("academic.physics", 35, 20, { requirementType: "OPTIONAL" }),
    mf("academic.chemistry", 25, 10, { requirementType: "OPTIONAL" }),

    // Interest
    mf("interest.data", 98, 95, { requirementType: "CORE" }),
    mf("interest.programming", 90, 90, { requirementType: "CORE" }),
    mf("interest.technology", 90, 80, { requirementType: "IMPORTANT" }),
    mf("interest.ai", 90, 80),
    mf("interest.research", 85, 75),
    mf("interest.science", 75, 60),
    mf("interest.business", 50, 40, { requirementType: "OPTIONAL" }),

    // Ability (đã gộp Thinking)
    mf("ability.analytical", 95, 95, { minimumScore: 50, requirementType: "CORE" }),
    mf("ability.numerical", 95, 95, { requirementType: "CORE" }),
    mf("ability.logical", 90, 90, { requirementType: "CORE" }),
    mf("ability.problem_solving", 90, 85),
    mf("ability.research", 85, 80),
    mf("ability.independent_work", 80, 75),
    mf("ability.teamwork", 65, 55, { requirementType: "SUPPORTING" }),
    mf("ability.communication", 60, 50, { requirementType: "SUPPORTING" }),
    mf("ability.creativity", 65, 50),
    mf("thinking.analytical", 95, 85),
    mf("thinking.logical", 90, 80),
    mf("thinking.research", 85, 75),
    mf("thinking.experimental", 70, 60),
    mf("thinking.practical", 60, 50),
    mf("thinking.creative", 60, 45),

    // Work Style
    mf("work_style.deep_work", 90, 85),
    mf("work_style.specialization", 85, 75),
    mf("work_style.independent", 80, 75),
    mf("work_style.autonomy", 75, 65),
    mf("work_style.teamwork", 65, 55),
    mf("work_style.structure", 65, 55),
    mf("work_style.multitasking", 55, 45),
    mf("work_style.social_interaction", 45, 40),

    // Career Value
    mf("career_value.technology", 90, 85),
    mf("career_value.achievement", 85, 75),
    mf("career_value.income", 80, 70),
    mf("career_value.international", 75, 65),
    mf("career_value.research", 75, 65),
    mf("career_value.autonomy", 70, 60),
    mf("career_value.stability", 60, 50),

    // Environment
    mf("environment.hybrid", 85, 70),
    mf("environment.office", 80, 65),
    mf("environment.remote", 80, 65),
    mf("environment.research_center", 80, 60),
    mf("environment.startup", 70, 50),
    mf("environment.factory", 30, 25),
    mf("environment.outdoor", 20, 20),
  ]),

  riasec: { R: 35, I: 95, A: 35, S: 40, E: 45, C: 65 },
  riasecConfidence: 0.82,

  criticalFactors: [
    {
      factorCode: "academic.math",
      minimumScore: 55,
      severity: "HIGH",
      gateType: "SOFT_GATE",
    },
    {
      factorCode: "ability.analytical",
      minimumScore: 50,
      severity: "HIGH",
      gateType: "SOFT_GATE",
    },
  ],

  challenges: [
    {
      code: "MATH_INTENSITY",
      severity: "HIGH",
      title: "Nền tảng Toán",
      description: "Chương trình có mức sử dụng Toán tương đối cao.",
    },
    {
      code: "SELF_LEARNING",
      severity: "HIGH",
      title: "Tự học",
      description: "Người học cần duy trì khả năng tự học và cập nhật công nghệ.",
    },
  ],

  academicLoad: {
    math_intensity: 90,
    programming_intensity: 90,
    project_intensity: 80,
    self_learning_intensity: 90,
    reading_intensity: 70,
    teamwork_intensity: 60,
    writing_intensity: 50,
    science_intensity: 50,
    lab_intensity: 30,
    design_intensity: 20,
  },

  careerCodes: ["DATA_ANALYST", "DATA_ENGINEER", "ML_ENGINEER"],

  groupConfidence: {
    ACADEMIC: 0.9,
    INTEREST: 0.85,
    ABILITY: 0.8,
    WORK_STYLE: 0.7,
    CAREER_VALUE: 0.75,
    RIASEC: 0.82,
    ENVIRONMENT: 0.75,
  },
  dnaQuality: 0.91,

  provenance: SEED_PROVENANCE,
};

/* ------------------------------------------------------------------ */
/* Hồ sơ học sinh mẫu                                                  */
/* ------------------------------------------------------------------ */

/**
 * Dựng hồ sơ mẫu. `completeness` tính sẵn theo số yếu tố đã khai trên tổng số
 * yếu tố mà DNA mẫu đòi hỏi — đủ dùng cho test, không phải cách tính chính
 * thức của bộ khảo sát (việc đó thuộc M02/M03).
 */
export function makeProfile(
  factors: Record<string, number>,
  riasec: StudentProfile["riasec"],
  completenessValue = 0.9
): StudentProfile {
  const required = Object.keys(DATA_SCIENCE_DNA.factors);
  const missing = required.filter((k) => factors[k] === undefined);
  return {
    profileId: "SP_SEED",
    version: 1,
    status: "READY_FOR_MATCHING",
    factors,
    riasec,
    completeness: {
      value: completenessValue,
      answered: required.length - missing.length,
      required: required.length,
      missing,
    },
    surveyVersion: "survey-seed-1",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

/** Một hồ sơ khá hợp với Khoa học dữ liệu, dùng làm mốc so sánh trong test. */
export function seedStrongProfile(): StudentProfile {
  const f: Record<string, number> = {};
  for (const [code, v] of Object.entries(DATA_SCIENCE_DNA.factors)) {
    f[code] = v.expectedScore;
  }
  return makeProfile(f, { ...DATA_SCIENCE_DNA.riasec }, 1);
}

/* ------------------------------------------------------------------ */
/* Bộ trả lời khảo sát mẫu                                             */
/* ------------------------------------------------------------------ */

/**
 * Một bộ trả lời đầy đủ của học sinh nghiêng về công nghệ – dữ liệu.
 * Dùng cho test và cho chế độ xem thử giao diện. Không phải người thật.
 */
export function seedSurveyResponse(
  overrides: Partial<SurveyResponse["answers"]> = {}
): SurveyResponse {
  const interest: Record<string, number> = {};
  for (const d of INTEREST_DOMAINS) interest[d] = 2;
  Object.assign(interest, {
    technology: 5, programming: 5, data: 5, ai: 5, research: 4, science: 4,
    business: 3, communication: 3, design: 2,
  });

  const answers: SurveyResponse["answers"] = {
    Q01: "12",
    Q02: 2027,
    Q03: "TP. Hồ Chí Minh",
    Q04: "THPT Nguyễn Du",
    Q05: "Đã có một số ngành đang cân nhắc",
    Q06: ["Bản thân tôi", "Thầy cô", "Cơ hội việc làm"],

    Q07: {
      math: 8.5, literature: 7, english: 7.8, physics: 7.6, chemistry: 6.5,
      biology: 6, history: 6.5, geography: 6.8, informatics: 9, technology: 8,
    },
    Q08: ["Tiếng Anh", "Vật lý"],
    Q09: ["Sinh học"],
    Q10: "Thực hành trực tiếp",
    Q11: {
      resource_seeking: 5, self_learning: 4, persistence: 4,
      problem_solving_learning: 5, help_seeking: 3, deep_focus: 5,
      study_discipline: 4,
    },
    Q12: 4,

    Q13: ["Tư duy logic", "Phân tích dữ liệu", "Giải quyết vấn đề"],
    Q14: ["Công nghệ", "Lập trình", "Dữ liệu", "Trí tuệ nhân tạo"],
    Q15: interest,
    Q16: ["Lập trình", "Phân tích dữ liệu", "Nghiên cứu", "Làm dự án"],
    Q17: "Phân tích một bộ dữ liệu",
    Q18: "AI/data product",
    Q19: "Vấn đề số liệu",

    Q20: {
      change_orientation: 60, social_interaction: 35, practice_orientation: 75,
      autonomy_orientation: 78, specialization_orientation: 82,
      challenge_orientation: 70,
    },
    Q21: ["Lặp lại một việc quá lâu", "Áp lực doanh số"],
    Q22: "Chia vấn đề thành các phần nhỏ",
    Q23: 5, Q24: 5, Q25: 4, Q26: 3, Q27: 4, Q28: 4, Q29: 5,

    Q30: "Tự tìm cách làm",
    Q31: "Chia thành từng giai đoạn",
    Q32: "Người phân tích",
    Q33: "Ưu tiên việc quan trọng nhất",
    Q34: "Phân tích nguyên nhân",
    Q35: 60,
    Q36: 35,
    Q37: {
      challenge_orientation: 72, multitasking_orientation: 45,
      autonomy_orientation: 80, change_orientation: 58,
    },

    Q38: ["Công nghệ", "Tự chủ", "Thu nhập cao", "Môi trường quốc tế", "Nghiên cứu"],
    Q39: ["Công nghệ", "Tự chủ", "Thu nhập cao", "Môi trường quốc tế", "Nghiên cứu"],
    Q40: 5, Q41: 3,
    Q42: { creativity: 4, autonomy: 5, freedom: 4, entrepreneurship: 3 },
    Q43: { international: 4, technology: 5, career_growth: 4 },
    Q44: 3,

    Q45: ["Văn phòng", "Làm việc từ xa", "Mô hình hybrid", "Trung tâm nghiên cứu"],
    Q46: ["Công nghệ", "Nghiên cứu", "Phân tích"],
    Q47: "Dữ liệu",
    Q48: "Làm việc cho công ty quốc tế",
    Q49: 4,
    Q50: "Được làm điều mình thích",

    Q51: ["Ngành đào tạo", "Chất lượng chương trình", "Cơ hội việc làm", "Học phí", "Quan hệ doanh nghiệp"],
    Q52: 80, Q53: 4, Q54: 5, Q55: 4,
    Q56: ["Nghiên cứu khoa học", "Thực tập doanh nghiệp", "Dự án thực tế"],

    Q57: "30–50 triệu",
    Q58: "Có thể cần",
    Q59: 25.5,
    Q60: ["Điểm thi tốt nghiệp THPT", "Học bạ", "ĐGNL ĐHQG-HCM"],
    Q61: [{ certificateType: "IELTS", score: 6.5, status: "valid" as const }],
    Q62: ["Muốn học tại TP.HCM"],

    ...overrides,
  };

  return {
    responseId: "R_SEED",
    studentId: "S_SEED",
    surveyVersion: SURVEY_VERSION,
    status: "COMPLETED",
    answers,
    startedAt: "2026-01-01T00:00:00.000Z",
    completedAt: "2026-01-01T00:30:00.000Z",
  };
}
