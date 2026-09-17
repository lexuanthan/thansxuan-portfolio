/**
 * MÔ HÌNH DỮ LIỆU CHUẨN — hệ hỗ trợ quyết định chọn ngành / chọn trường.
 * Bám theo PART 5 (Major DNA) và PART 6 (Major Matching Engine).
 *
 * NGUYÊN TẮC BẤT DI BẤT DỊCH:
 *   AI does NOT calculate. AI does NOT rank. AI does NOT decide.
 *   Algorithm calculates. Rules control. Data explains. AI communicates.
 *   Student decides.
 *
 * Năm tầng dữ liệu, không được nhảy cóc:
 *   L0_RAW → L1_PARSED → L2_VALIDATED → L3_NORMALIZED → L4_DERIVED
 * Khi một con số trông sai, phải truy được nó sai từ đâu — người nhập, bước
 * quy đổi, hay công thức. Gộp hết vào một kiểu là mất luôn đường truy vết.
 */

/* ------------------------------------------------------------------ */
/* Tầng dữ liệu và nguồn gốc                                           */
/* ------------------------------------------------------------------ */

export const LAYERS = [
  "L0_RAW",
  "L1_PARSED",
  "L2_VALIDATED",
  "L3_NORMALIZED",
  "L4_DERIVED",
] as const;
export type Layer = (typeof LAYERS)[number];

/** Thứ bậc nguồn theo PART 5.47. Level 5 không được trình bày như fact chính thức. */
export const SOURCE_TYPES = [
  "OFFICIAL_CURRICULUM", // Level 1
  "ACCREDITATION", // Level 2
  "ACADEMIC_LITERATURE", // Level 3
  "EXPERT_MAPPING", // Level 4
  "DEVELOPMENT_ASSUMPTION", // Level 5
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_LEVEL: Record<SourceType, number> = {
  OFFICIAL_CURRICULUM: 1,
  ACCREDITATION: 2,
  ACADEMIC_LITERATURE: 3,
  EXPERT_MAPPING: 4,
  DEVELOPMENT_ASSUMPTION: 5,
};

export type Provenance = {
  /** Mô tả nguồn cho người đọc: "Đề án tuyển sinh 2025 — ĐH SPKT TP.HCM". */
  source: string;
  sourceType: SourceType;
  /** Ngày thu thập, dạng ISO. */
  collectedAt: string;
  sourceUrl?: string;
};

/** Vỏ bọc mang theo tầng và nguồn gốc của một giá trị. */
export type Envelope<T> = {
  layer: Layer;
  value: T;
  provenance: Provenance;
  /** Ghi chú của bước xử lý: đã làm tròn, đã suy ra, đã bỏ qua vì thiếu. */
  notes: string[];
};

/* ------------------------------------------------------------------ */
/* RIASEC                                                              */
/* ------------------------------------------------------------------ */

export const RIASEC_KEYS = ["R", "I", "A", "S", "E", "C"] as const;
export type RiasecKey = (typeof RIASEC_KEYS)[number];

/** Sáu chiều RIASEC, mỗi chiều 0–100. Thiếu chiều nào thì để null. */
export type RiasecVector = Record<RiasecKey, number>;
export type PartialRiasec = Partial<Record<RiasecKey, number | null>>;

export const RIASEC_LABEL: Record<RiasecKey, string> = {
  R: "Realistic — kỹ thuật, thực hành",
  I: "Investigative — nghiên cứu, phân tích",
  A: "Artistic — nghệ thuật, sáng tạo",
  S: "Social — xã hội, hỗ trợ",
  E: "Enterprising — quản lý, thuyết phục",
  C: "Conventional — quy chuẩn, tổ chức",
};

/* ------------------------------------------------------------------ */
/* Yếu tố (factor)                                                     */
/* ------------------------------------------------------------------ */

export type FactorId = string;
export type GroupCode =
  | "ACADEMIC"
  | "INTEREST"
  | "ABILITY"
  | "WORK_STYLE"
  | "CAREER_VALUE"
  | "RIASEC"
  | "ENVIRONMENT";

/**
 * Định nghĩa yếu tố CHỈ chứa phần bất biến: mã, nhóm, nhãn, mô tả.
 *
 * Cố ý KHÔNG có trọng số ở đây. Theo DNA-03, `importance` là thuộc tính của
 * từng ngành chứ không phải của yếu tố: Toán quan trọng với Khoa học dữ liệu
 * theo mức khác với Toán trong Sư phạm Mầm non. Đặt trọng số vào định nghĩa
 * yếu tố là ép mọi ngành dùng chung một bảng ưu tiên.
 */
export type FactorDefinition = {
  id: FactorId;
  group: GroupCode;
  label: string;
  description: string;
};

/** PART 5.10 / 5.13 / 5.16. */
export const REQUIREMENT_TYPES = ["CORE", "IMPORTANT", "SUPPORTING", "OPTIONAL"] as const;
export type RequirementType = (typeof REQUIREMENT_TYPES)[number];

/**
 * PART 5.32.
 * POSITIVE  học sinh càng cao càng gần mức đặc trưng của ngành.
 * NEGATIVE  yếu tố thực sự ngược chiều — hiếm, phải cân nhắc kỹ.
 * NEUTRAL   lưu để mô tả, KHÔNG đóng góp vào điểm.
 */
export const DIRECTIONS = ["POSITIVE", "NEGATIVE", "NEUTRAL"] as const;
export type Direction = (typeof DIRECTIONS)[number];

/**
 * Một ô trong Major DNA. PART 5.6–5.7.
 *
 * Phân biệt hai con số hay bị lẫn:
 *   expectedScore  ngành thiên về mức nào ở yếu tố này
 *   importance     yếu tố này nặng ký tới đâu trong DNA của ngành
 * Toán expected 90 / importance 95 khác hẳn Toán expected 90 / importance 50.
 *
 * minimumScore là null với hầu hết yếu tố. Chỉ đặt khi có căn cứ; đặt bừa là
 * biến một mô tả đặc trưng thành một rào cản (DNA-04).
 */
export type MajorFactorValue = {
  factorCode: FactorId;
  /** 0–100. */
  expectedScore: number;
  /** 0–100. */
  importance: number;
  /** 0–100, hoặc null khi yếu tố này không dùng làm ngưỡng. */
  minimumScore: number | null;
  requirementType: RequirementType;
  direction: Direction;
  /** 0–1. Độ tin của DỮ LIỆU, không phải độ chính xác của kết quả. */
  confidence: number;
  explanation: string;
  sourceReference?: string;
};

/* ------------------------------------------------------------------ */
/* Cổng chặn                                                           */
/* ------------------------------------------------------------------ */

/**
 * PART 5.28.
 * WARNING    chỉ cảnh báo, không đụng tới điểm.
 * SOFT_GATE  giảm mức tương thích theo cấu hình. V1.0 ưu tiên loại này.
 * HARD_GATE  chỉ dùng khi có điều kiện khách quan rõ ràng của chương trình.
 *
 * Không dùng HARD_GATE chỉ vì "ngành này thường cần Toán tốt" (5.28, 6.31).
 */
export const GATE_TYPES = ["WARNING", "SOFT_GATE", "HARD_GATE"] as const;
export type GateType = (typeof GATE_TYPES)[number];

export const SEVERITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export type Severity = (typeof SEVERITIES)[number];

export type CriticalFactorSpec = {
  factorCode: FactorId;
  minimumScore: number;
  severity: Severity;
  gateType: GateType;
};

/** PART 6.34. */
export const CF_STATUSES = [
  "ALIGNED",
  "NEAR_THRESHOLD",
  "BELOW_THRESHOLD",
  "MISSING",
] as const;
export type CriticalFactorStatus = (typeof CF_STATUSES)[number];

/** PART 6.33. */
export type CriticalFactorResult = {
  factor: FactorId;
  studentValue: number | null;
  expectedValue: number | null;
  minimumValue: number;
  status: CriticalFactorStatus;
  severity: Severity;
  gateType: GateType;
  /** studentValue − expectedValue. null khi thiếu một trong hai. */
  gap: number | null;
  /** Phần điểm bị trừ do ô này, dạng tỉ lệ 0–1. */
  penalty: number;
};

/* ------------------------------------------------------------------ */
/* Major DNA                                                           */
/* ------------------------------------------------------------------ */

export const DNA_STATUSES = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
] as const;
export type DnaStatus = (typeof DNA_STATUSES)[number];

/** PART 5.44. Độ tin của dữ liệu dựng DNA, theo từng nhóm. */
export type GroupConfidence = Partial<Record<GroupCode, number>>;

/** PART 5.25. Mô tả đặc điểm học tập, KHÔNG tham gia tính điểm khớp. */
export type AcademicLoad = Partial<Record<AcademicLoadFactor, number>>;

export const ACADEMIC_LOAD_FACTORS = [
  "math_intensity",
  "science_intensity",
  "programming_intensity",
  "reading_intensity",
  "writing_intensity",
  "design_intensity",
  "lab_intensity",
  "project_intensity",
  "teamwork_intensity",
  "self_learning_intensity",
] as const;
export type AcademicLoadFactor = (typeof ACADEMIC_LOAD_FACTORS)[number];

/** PART 5.29. */
export type Challenge = {
  code: string;
  severity: Severity;
  title: string;
  description: string;
};

export type MajorDna = {
  majorId: string;
  majorCode: string;
  nameVi: string;
  nameEn?: string;
  groupCode: string;
  /** Phiên bản DNA. Bản đã PUBLISHED là bất biến (5.43). */
  version: number;
  status: DnaStatus;

  /** Bản đồ mã yếu tố → giá trị. Thiếu khoá = NOT_DEFINED, khác 0 (5.57). */
  factors: Record<FactorId, MajorFactorValue>;

  riasec: PartialRiasec;
  riasecConfidence: number;

  criticalFactors: CriticalFactorSpec[];
  challenges: Challenge[];
  academicLoad: AcademicLoad;
  careerCodes: string[];

  groupConfidence: GroupConfidence;
  /** PART 5.45. Chất lượng bộ dữ liệu DNA, 0–1. Không phải điểm khớp. */
  dnaQuality: number;

  provenance: Provenance;

  /**
   * Identity KHÔNG được chứa matchingScore, studentFit hay admissionProbability
   * (5.4) — đó là thuộc tính của kết quả khớp, không phải của ngành.
   */
};

/* ------------------------------------------------------------------ */
/* Hồ sơ học sinh                                                      */
/* ------------------------------------------------------------------ */

export const PROFILE_STATUSES = [
  "DRAFT",
  "PARTIAL",
  "READY_FOR_MATCHING",
] as const;
export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

/**
 * Ba chỉ số hay bị lẫn, tách bạch ngay từ kiểu dữ liệu:
 *   completeness  học sinh đã khai được bao nhiêu phần hồ sơ
 *   coverage      trong những yếu tố ngành đòi hỏi, ta có số liệu bao nhiêu
 *   confidence    số liệu dùng để tính đáng tin tới đâu
 * Một kết quả có thể completeness cao mà coverage thấp: em khai đủ, nhưng
 * ngành đòi những yếu tố bộ khảo sát chưa đo tới.
 */
export type Completeness = {
  /** 0–1. */
  value: number;
  answered: number;
  required: number;
  missing: string[];
};

export type StudentProfile = {
  profileId: string;
  /** Phiên bản hồ sơ. Kết quả khớp cũ luôn trỏ về đúng phiên bản đã dùng. */
  version: number;
  status: ProfileStatus;

  /** Mã yếu tố → 0–100. Thiếu khoá = chưa trả lời, KHÔNG phải 0 (6.11). */
  factors: Record<FactorId, number>;

  riasec: PartialRiasec;

  completeness: Completeness;
  surveyVersion: string;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* Kết quả khớp                                                        */
/* ------------------------------------------------------------------ */

/** PART 6.55. AI không được tự nghĩ ra logic phân loại. */
export const REASON_CODES = [
  "HIGH_ALIGNMENT",
  "GOOD_ALIGNMENT",
  "MODERATE_ALIGNMENT",
  "LOW_ALIGNMENT",
  "BELOW_CRITICAL_THRESHOLD",
  "MISSING_DATA",
  "HIGH_IMPORTANCE_GAP",
  "SUPPORTING_STRENGTH",
] as const;
export type ReasonCode = (typeof REASON_CODES)[number];

/** PART 6.66. */
export type FactorResult = {
  factor: FactorId;
  studentValue: number | null;
  majorExpectedValue: number | null;
  importance: number;
  /** 0–100. null khi yếu tố bị loại khỏi phép tính. */
  similarityScore: number | null;
  /** studentValue − majorExpectedValue. */
  gap: number | null;
  status: "SCORED" | "MISSING_STUDENT" | "MISSING_MAJOR" | "NEUTRAL_EXCLUDED";
  /** Phần đóng góp vào điểm nhóm = similarity × importance. */
  contribution: number;
};

export const GROUP_STATUSES = ["VALID", "INSUFFICIENT", "NO_DATA"] as const;
export type GroupStatus = (typeof GROUP_STATUSES)[number];

/** PART 6.38 / 6.67. */
export type GroupResult = {
  group: GroupCode;
  /** 0–100. null khi nhóm không đủ dữ liệu. */
  score: number | null;
  /** Trọng số gốc theo cấu hình. */
  groupWeight: number;
  /** Trọng số thực sau khi nhân confidence và chuẩn hoá lại. */
  effectiveWeight: number;
  /** PART 6.39: importance khả dụng / tổng importance. KHÔNG phải điểm khớp. */
  coverage: number;
  confidence: number;
  status: GroupStatus;
  factors: FactorResult[];
};

/** PART 6.46. Nhãn diễn giải nội bộ, không phải đánh giá giá trị của ngành. */
export const BANDS = ["STRONG_MATCH", "GOOD_MATCH", "EXPLORE", "LOW_MATCH"] as const;
export type Band = (typeof BANDS)[number];

export type ExplanationItem = {
  factor: FactorId;
  label: string;
  studentValue: number | null;
  majorExpected: number | null;
  importance: number;
  gap: number | null;
  reasonCode: ReasonCode;
};

/** PART 6.68. Thiếu một dòng nào ở đây là mất khả năng tái lập kết quả. */
export type MatchingVersions = {
  studentProfileVersion: number;
  majorDnaVersion: number;
  matchingConfigurationVersion: number;
  derivationRuleVersion: number;
  matchingEngineVersion: string;
};

/** PART 6.50. */
export type ConfidenceBreakdown = {
  profileCompleteness: number;
  groupCoverage: number;
  majorDnaQuality: number;
  criticalFactorCoverage: number;
  matchingConfidence: number;
};

/** PART 6.53. */
export type MatchResult = {
  majorId: string;
  majorCode: string;
  majorName: string;

  /** Điểm trước khi trừ phạt, 0–100. */
  rawScore: number;
  /** Tổng phạt đã chặn trần, dạng tỉ lệ 0–1. */
  penalty: number;

  /**
   * Điểm cuối 0–100 = rawScore × (1 − penalty).
   *
   * Nếu giá trị này xuất hiện trong dữ liệu gửi lên từ trình duyệt thì máy chủ
   * phải BỎ QUA và tính lại (6.77). Điểm là thứ duy nhất không được tin từ máy
   * khách, vì nó chính là thứ đáng để người ta sửa.
   */
  finalScore: number;

  band: Band;
  /** false khi vướng HARD_GATE. Ngành vẫn hiện ra kèm lý do. */
  eligible: boolean;

  groups: GroupResult[];
  criticalFactors: CriticalFactorResult[];
  strengths: ExplanationItem[];
  gaps: ExplanationItem[];
  challenges: Challenge[];

  coverage: number;
  confidence: number;
  confidenceBreakdown: ConfidenceBreakdown;
  /**
   * Phần trọng số gốc thuộc về các nhóm còn đủ dữ liệu, 0–1.
   * Bằng 1 nghĩa là cả bảy nhóm đều chấm được; 0.25 nghĩa là điểm cuối thực
   * chất chỉ dựng từ một phần tư mô hình.
   */
  usableWeightShare: number;

  versions: MatchingVersions;
  computedAt: string;
  /** Mã băm của đầu vào đã chuẩn hoá — cùng mã thì phải cùng kết quả. */
  inputHash: string;
};

/** PART 6.84. */
export const MATCH_ERRORS = [
  "PROFILE_INSUFFICIENT",
  "MAJOR_DNA_INSUFFICIENT",
  "CONFIGURATION_INVALID",
  "VERSION_NOT_FOUND",
  "INVALID_FACTOR",
] as const;
export type MatchError = (typeof MATCH_ERRORS)[number];

export type MatchOutcome =
  | { ok: true; result: MatchResult }
  | { ok: false; error: MatchError; detail: string };
