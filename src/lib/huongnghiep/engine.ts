/**
 * MAJOR MATCHING ENGINE — PART 6.
 *
 * Đường đi cố định, không rẽ tắt (6.3):
 *
 *   Student Profile → Data Sufficiency → Factor Matching → Group Fit
 *   → Critical Factor → Gate/Penalty → Composite Fit → Confidence
 *   → Explanation Data → Final Result
 *
 * AI không xuất hiện ở bất kỳ bước nào trong file này. Nó chỉ được đọc
 * `strengths`, `gaps`, `criticalFactors` ở đầu ra và diễn đạt lại bằng lời.
 */

import {
  ALIGNMENT_BANDS,
  CONFIDENCE_WEIGHTED_GROUPS,
  CONFIDENCE_WEIGHTS,
  DERIVATION_RULE_VERSION,
  DEVELOPMENT_GAP_THRESHOLD,
  GROUP_LABEL,
  GROUP_ORDER,
  GROUP_WEIGHTS,
  HIGH_IMPORTANCE_THRESHOLD,
  MATCHING_CONFIGURATION_VERSION,
  MATCHING_ENGINE_VERSION,
  MAXIMUM_TOTAL_PENALTY,
  MAX_EXPLANATION_ITEMS,
  MIN_GROUP_COMPLETENESS,
  MIN_PROFILE_COMPLETENESS,
  MIN_RIASEC_DIFFERENTIATION,
  MIN_USABLE_GROUP_WEIGHT,
  NEAR_THRESHOLD_MARGIN,
  RIASEC_INDEX,
  SOFT_GATE_PENALTY,
  bandOf,
  groupOfFactor,
  labelOfFactor,
  unknownFactorIds,
  validateConfig,
} from "./config";
import { stableHash } from "./normalize";
import {
  coverageOf,
  factorSimilarity,
  gateAdjustment,
  groupFit,
  normalizeWeights,
  riasecCoverage,
  riasecDifferentiation,
  riasecFit,
  type ScoredFactor,
} from "./similarity";
import type {
  MatchError,
  CriticalFactorResult,
  CriticalFactorStatus,
  ExplanationItem,
  FactorResult,
  GroupCode,
  GroupResult,
  MajorDna,
  MatchOutcome,
  MatchResult,
  ReasonCode,
  StudentProfile,
} from "./types";

export type MatchOptions = {
  /** Cho phép chạy khi hồ sơ chưa đủ đầy — PART 6.13 LIMITED_MATCHING. */
  allowLimited?: boolean;
  /** Đồng hồ tiêm vào để test tái lập được. */
  now?: () => string;
};

/* ------------------------------------------------------------------ */
/* 6.77 — chống giả mạo điểm từ máy khách                              */
/* ------------------------------------------------------------------ */

/**
 * Bóc mọi trường điểm ra khỏi dữ liệu máy khách gửi lên.
 *
 * Máy chủ LUÔN tính lại từ nguồn. Client chỉ được gửi profile_id, biến kịch
 * bản what-if và bộ lọc. Một request kèm `final_score: 99` phải bị bỏ qua chứ
 * không phải bị tin.
 */
const CLIENT_FORBIDDEN_FIELDS = [
  "final_score",
  "finalScore",
  "raw_score",
  "rawScore",
  "score",
  "band",
  "penalty",
  "confidence",
  "coverage",
] as const;

export function stripClientScores<T extends Record<string, unknown>>(
  input: T
): { clean: Record<string, unknown>; removed: string[] } {
  const clean: Record<string, unknown> = {};
  const removed: string[] = [];
  for (const [k, v] of Object.entries(input)) {
    if ((CLIENT_FORBIDDEN_FIELDS as readonly string[]).includes(k)) {
      removed.push(k);
      continue;
    }
    clean[k] = v;
  }
  return { clean, removed };
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export function matchMajor(
  profile: StudentProfile,
  dna: MajorDna,
  options: MatchOptions = {}
): MatchOutcome {
  const now = options.now ?? (() => new Date().toISOString());

  /* --- 1. Cấu hình --- */
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    return { ok: false, error: "CONFIGURATION_INVALID", detail: configErrors.join("; ") };
  }

  /* --- 2. DNA --- */
  if (dna.status !== "PUBLISHED") {
    return {
      ok: false,
      error: "MAJOR_DNA_INSUFFICIENT",
      detail: `DNA của ngành đang ở trạng thái ${dna.status}, chỉ bản PUBLISHED mới được dùng`,
    };
  }

  const badFactors = unknownFactorIds(Object.keys(dna.factors));
  if (badFactors.length > 0) {
    return {
      ok: false,
      error: "INVALID_FACTOR",
      detail: `Mã yếu tố không có trong danh mục: ${badFactors.join(", ")}`,
    };
  }
  const badCritical = unknownFactorIds(dna.criticalFactors.map((c) => c.factorCode));
  if (badCritical.length > 0) {
    return {
      ok: false,
      error: "INVALID_FACTOR",
      detail: `Critical factor không có trong danh mục: ${badCritical.join(", ")}`,
    };
  }

  /* --- 3. Đủ dữ liệu chưa (6.9, 6.13) --- */
  const completeness = profile.completeness.value;
  if (completeness < MIN_PROFILE_COMPLETENESS && !options.allowLimited) {
    return {
      ok: false,
      error: "PROFILE_INSUFFICIENT",
      detail: `Hồ sơ mới đạt ${Math.round(completeness * 100)}%, cần tối thiểu ${Math.round(
        MIN_PROFILE_COMPLETENESS * 100
      )}% để có kết quả đáng tin cậy`,
    };
  }

  /* --- 4. Chấm từng nhóm --- */
  const groups: GroupResult[] = GROUP_ORDER.map((g) =>
    g === "RIASEC" ? scoreRiasecGroup(profile, dna) : scoreFactorGroup(g, profile, dna)
  );

  /* --- 5. Trọng số thực (6.27, 6.41) --- */
  const usable: Record<string, number> = {};
  for (const g of groups) {
    if (g.status !== "VALID" || g.score === null) continue;
    const base = GROUP_WEIGHTS[g.group];
    usable[g.group] = CONFIDENCE_WEIGHTED_GROUPS.includes(g.group)
      ? base * g.confidence
      : base;
  }
  const effective = normalizeWeights(usable);
  for (const g of groups) g.effectiveWeight = effective[g.group] ?? 0;

  /**
   * Sàn trọng số: phải còn ít nhất một nửa mô hình mới được chấm.
   *
   * Tính trên trọng số GỐC, không tính trên trọng số đã chuẩn hoá — sau khi
   * chuẩn hoá thì tổng luôn bằng 1 dù chỉ còn một nhóm, nên con số ấy không
   * nói lên điều gì.
   */
  const usableWeightShare = groups
    .filter((g) => g.status === "VALID" && g.score !== null)
    .reduce((s, g) => s + GROUP_WEIGHTS[g.group], 0);

  if (usableWeightShare < MIN_USABLE_GROUP_WEIGHT) {
    // Dùng nhãn tiếng Việt: thông báo này hiện thẳng ra cho học sinh đọc,
    // không phải log cho lập trình viên.
    const missing = groups
      .filter((g) => g.status !== "VALID")
      .map((g) => GROUP_LABEL[g.group].toLowerCase());
    return {
      ok: false,
      error: "PROFILE_INSUFFICIENT",
      detail:
        `Mới có ${Math.round(usableWeightShare * 100)}% mô hình đủ dữ liệu, ` +
        `cần tối thiểu ${Math.round(MIN_USABLE_GROUP_WEIGHT * 100)}%. ` +
        `Còn thiếu dữ liệu ở: ${missing.join(", ")}.`,
    };
  }

  /* --- 6. Điểm thô (6.42) --- */
  let rawScore = 0;
  for (const g of groups) {
    if (g.score !== null) rawScore += g.score * g.effectiveWeight;
  }

  /* --- 7. Critical factor và phạt (6.29 → 6.45) --- */
  const criticalFactors = analyzeCriticalFactors(profile, dna);
  const { penalty, adjustment } = gateAdjustment(
    criticalFactors.map((c) => c.penalty),
    MAXIMUM_TOTAL_PENALTY
  );
  const eligible = !criticalFactors.some(
    (c) => c.gateType === "HARD_GATE" && c.status === "BELOW_THRESHOLD"
  );

  /* --- 8. Điểm cuối (6.43, 6.48) — không làm tròn trước khi trừ phạt --- */
  const finalScore = rawScore * adjustment;

  /* --- 9. Độ tin cậy (6.50, 6.51) --- */
  let groupCoverage = 0;
  for (const g of groups) groupCoverage += GROUP_WEIGHTS[g.group] * g.coverage;

  const criticalWithData = criticalFactors.filter((c) => c.studentValue !== null).length;
  const criticalFactorCoverage =
    criticalFactors.length === 0 ? 1 : criticalWithData / criticalFactors.length;

  const matchingConfidence =
    CONFIDENCE_WEIGHTS.profileCompleteness * completeness +
    CONFIDENCE_WEIGHTS.groupCoverage * groupCoverage +
    CONFIDENCE_WEIGHTS.majorDnaQuality * dna.dnaQuality +
    CONFIDENCE_WEIGHTS.criticalFactorCoverage * criticalFactorCoverage;

  /* --- 10. Nguyên liệu diễn giải (6.54 → 6.57) --- */
  const scoredFactors = groups.flatMap((g) => g.factors);
  const strengths = pickStrengths(scoredFactors);
  const gaps = pickGaps(scoredFactors, criticalFactors);

  /* --- 11. Dấu vết tái lập (6.68) --- */
  const inputHash = stableHash({
    profile: { id: profile.profileId, v: profile.version, f: profile.factors, r: profile.riasec },
    dna: { id: dna.majorId, v: dna.version },
    config: MATCHING_CONFIGURATION_VERSION,
    rule: DERIVATION_RULE_VERSION,
    engine: MATCHING_ENGINE_VERSION,
  });

  const result: MatchResult = {
    majorId: dna.majorId,
    majorCode: dna.majorCode,
    majorName: dna.nameVi,
    rawScore,
    penalty,
    finalScore,
    band: bandOf(finalScore),
    eligible,
    groups,
    criticalFactors,
    strengths,
    gaps,
    challenges: dna.challenges,
    coverage: groupCoverage,
    confidence: matchingConfidence,
    usableWeightShare,
    confidenceBreakdown: {
      profileCompleteness: completeness,
      groupCoverage,
      majorDnaQuality: dna.dnaQuality,
      criticalFactorCoverage,
      matchingConfidence,
    },
    versions: {
      studentProfileVersion: profile.version,
      majorDnaVersion: dna.version,
      matchingConfigurationVersion: MATCHING_CONFIGURATION_VERSION,
      derivationRuleVersion: DERIVATION_RULE_VERSION,
      matchingEngineVersion: MATCHING_ENGINE_VERSION,
    },
    computedAt: now(),
    inputHash,
  };

  return { ok: true, result };
}

/* ------------------------------------------------------------------ */
/* Chấm một nhóm theo yếu tố                                           */
/* ------------------------------------------------------------------ */

function scoreFactorGroup(
  group: GroupCode,
  profile: StudentProfile,
  dna: MajorDna
): GroupResult {
  const factors: FactorResult[] = [];
  const scored: ScoredFactor[] = [];
  let availableImportance = 0;
  let totalImportance = 0;

  for (const [code, mf] of Object.entries(dna.factors)) {
    if (mf === undefined) continue;
    // Yếu tố của nhóm khác thì bỏ qua ở vòng này.
    if (groupOfFactor(code) !== group) continue;

    const studentValue = readStudent(profile, code);
    const importance = mf.importance;

    // NEUTRAL không đóng góp điểm nhưng cũng không nằm trong mẫu số coverage:
    // nó không phải dữ liệu bị thiếu, nó là dữ liệu cố ý không chấm.
    if (mf.direction === "NEUTRAL") {
      factors.push({
        factor: code,
        studentValue,
        majorExpectedValue: mf.expectedScore,
        importance,
        similarityScore: null,
        gap: studentValue === null ? null : studentValue - mf.expectedScore,
        status: "NEUTRAL_EXCLUDED",
        contribution: 0,
      });
      continue;
    }

    totalImportance += importance;

    const similarity = factorSimilarity(studentValue, mf.expectedScore, mf.direction);

    if (similarity === null) {
      factors.push({
        factor: code,
        studentValue,
        majorExpectedValue: mf.expectedScore,
        importance,
        similarityScore: null,
        gap: null,
        status: studentValue === null ? "MISSING_STUDENT" : "MISSING_MAJOR",
        contribution: 0,
      });
      continue;
    }

    availableImportance += importance;
    scored.push({ similarity, importance });
    factors.push({
      factor: code,
      studentValue,
      majorExpectedValue: mf.expectedScore,
      importance,
      similarityScore: similarity,
      gap: (studentValue as number) - mf.expectedScore,
      status: "SCORED",
      contribution: similarity * importance,
    });
  }

  const coverage = coverageOf(availableImportance, totalImportance);
  const score = groupFit(scored);
  const confidence = dna.groupConfidence[group] ?? 0.5;

  let status: GroupResult["status"];
  if (score === null || totalImportance === 0) status = "NO_DATA";
  else if (coverage < MIN_GROUP_COMPLETENESS[group]) status = "INSUFFICIENT";
  else status = "VALID";

  return {
    group,
    score,
    groupWeight: GROUP_WEIGHTS[group],
    effectiveWeight: 0, // gán lại sau khi chuẩn hoá
    coverage,
    confidence,
    status,
    factors,
  };
}

function scoreRiasecGroup(profile: StudentProfile, dna: MajorDna): GroupResult {
  const coverage = riasecCoverage(profile.riasec, dna.riasec);
  const confidence = dna.riasecConfidence;

  /**
   * Cổng phân hoá (Holland differentiation).
   *
   * Hồ sơ mà sáu chiều xấp xỉ nhau thì không có kiểu nghề nghiệp nổi trội. Với
   * cách đo tương quan, một hồ sơ như vậy còn nguy hiểm hơn: phương sai gần 0
   * nên vài điểm chênh ngẫu nhiên bị khuếch đại thành hệ số rất cao. Không
   * chấm còn hơn chấm bằng nhiễu.
   */
  const differentiation = riasecDifferentiation(profile.riasec);
  const score =
    differentiation < MIN_RIASEC_DIFFERENTIATION
      ? null
      : riasecFit(profile.riasec, dna.riasec, RIASEC_INDEX);

  let status: GroupResult["status"];
  if (score === null) status = "NO_DATA";
  else if (coverage < MIN_GROUP_COMPLETENESS.RIASEC) status = "INSUFFICIENT";
  else status = "VALID";

  return {
    group: "RIASEC",
    score,
    groupWeight: GROUP_WEIGHTS.RIASEC,
    effectiveWeight: 0,
    coverage,
    confidence,
    status,
    factors: [],
  };
}

/**
 * Đọc giá trị của học sinh.
 *
 * Thiếu khoá trả null, KHÔNG trả 0 (6.11). Đây là chỗ mà một dòng cẩu thả
 * kiểu `profile.factors[code] ?? 0` sẽ khiến một em bỏ trống ô Toán bị ghi
 * nhận là Toán 0 điểm rồi rớt khỏi mọi ngành kỹ thuật.
 */
function readStudent(profile: StudentProfile, code: string): number | null {
  const v = profile.factors[code];
  if (v === null || v === undefined || !Number.isFinite(v)) return null;
  return v;
}

/* ------------------------------------------------------------------ */
/* Critical factor — PART 6.28 → 6.35                                  */
/* ------------------------------------------------------------------ */

function analyzeCriticalFactors(
  profile: StudentProfile,
  dna: MajorDna
): CriticalFactorResult[] {
  return dna.criticalFactors.map((cf) => {
    const studentValue = readStudent(profile, cf.factorCode);
    const mf = dna.factors[cf.factorCode];
    const expectedValue = mf ? mf.expectedScore : null;

    let status: CriticalFactorStatus;
    if (studentValue === null) status = "MISSING";
    else if (studentValue < cf.minimumScore) status = "BELOW_THRESHOLD";
    else if (studentValue < cf.minimumScore + NEAR_THRESHOLD_MARGIN)
      status = "NEAR_THRESHOLD";
    else status = "ALIGNED";

    /**
     * Chỉ SOFT_GATE mới trừ điểm.
     * WARNING chỉ nhắc. HARD_GATE đánh dấu không đủ điều kiện — đó đã là hệ
     * quả nặng nhất rồi, trừ thêm điểm là phạt hai lần cho một chuyện.
     * MISSING không bị phạt: thiếu dữ liệu thì không kết luận đỗ hay trượt.
     */
    const penalty =
      status === "BELOW_THRESHOLD" && cf.gateType === "SOFT_GATE"
        ? SOFT_GATE_PENALTY[cf.severity]
        : 0;

    return {
      factor: cf.factorCode,
      studentValue,
      expectedValue,
      minimumValue: cf.minimumScore,
      status,
      severity: cf.severity,
      gateType: cf.gateType,
      gap:
        studentValue === null || expectedValue === null
          ? null
          : studentValue - expectedValue,
      penalty,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Nguyên liệu diễn giải — PART 6.54 → 6.57                            */
/* ------------------------------------------------------------------ */

function alignmentCode(similarity: number): ReasonCode {
  for (const b of ALIGNMENT_BANDS) if (similarity >= b.min) return b.code;
  return "LOW_ALIGNMENT";
}

function toItem(f: FactorResult, reasonCode: ReasonCode): ExplanationItem {
  return {
    factor: f.factor,
    label: labelOfFactor(f.factor),
    studentValue: f.studentValue,
    majorExpected: f.majorExpectedValue,
    importance: f.importance,
    gap: f.gap,
    reasonCode,
  };
}

/**
 * PART 6.56: ưu tiên importance cao + similarity cao.
 * Không chọn theo điểm thô của học sinh — điểm Anh văn 95 ở một ngành không
 * cần tiếng Anh thì không phải điểm mạnh đáng nói trong bối cảnh ngành đó.
 */
function pickStrengths(factors: FactorResult[]): ExplanationItem[] {
  return factors
    .filter((f) => f.status === "SCORED" && (f.similarityScore ?? 0) >= 75)
    .sort(
      (a, b) =>
        b.importance * (b.similarityScore ?? 0) - a.importance * (a.similarityScore ?? 0)
    )
    .slice(0, MAX_EXPLANATION_ITEMS)
    .map((f) => {
      const code: ReasonCode =
        (f.gap ?? 0) > 0 && f.importance < HIGH_IMPORTANCE_THRESHOLD
          ? "SUPPORTING_STRENGTH"
          : alignmentCode(f.similarityScore ?? 0);
      return toItem(f, code);
    });
}

/**
 * PART 6.57: ưu tiên importance cao + chênh âm lớn. Critical factor đứng trước.
 */
function pickGaps(
  factors: FactorResult[],
  criticals: CriticalFactorResult[]
): ExplanationItem[] {
  const belowThreshold = new Set(
    criticals.filter((c) => c.status === "BELOW_THRESHOLD").map((c) => c.factor)
  );

  const candidates = factors.filter(
    (f) =>
      f.status === "SCORED" &&
      f.gap !== null &&
      f.gap <= DEVELOPMENT_GAP_THRESHOLD &&
      f.importance >= HIGH_IMPORTANCE_THRESHOLD
  );

  return candidates
    .sort((a, b) => {
      const ca = belowThreshold.has(a.factor) ? 1 : 0;
      const cb = belowThreshold.has(b.factor) ? 1 : 0;
      if (ca !== cb) return cb - ca;
      return a.importance * (a.gap ?? 0) - b.importance * (b.gap ?? 0);
    })
    .slice(0, MAX_EXPLANATION_ITEMS)
    .map((f) =>
      toItem(
        f,
        belowThreshold.has(f.factor)
          ? "BELOW_CRITICAL_THRESHOLD"
          : "HIGH_IMPORTANCE_GAP"
      )
    );
}

/* ------------------------------------------------------------------ */
/* Xếp hạng — PART 6.60, 6.61                                          */
/* ------------------------------------------------------------------ */

/**
 * Sắp xếp và cắt Top N.
 *
 * Phá hoà theo đúng thứ tự tài liệu quy định: confidence, rồi mức khớp của
 * critical factor, rồi mã ngành. KHÔNG dùng danh tiếng trường hay điểm chuẩn
 * để phá hoà — đó là dữ liệu của bài toán khác.
 */
export function rankResults(results: MatchResult[], limit = 10): MatchResult[] {
  const alignment = (r: MatchResult) =>
    r.criticalFactors.length === 0
      ? 1
      : r.criticalFactors.filter((c) => c.status === "ALIGNED").length /
        r.criticalFactors.length;

  return [...results]
    .sort((a, b) => {
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      const d = alignment(b) - alignment(a);
      if (d !== 0) return d;
      return a.majorCode < b.majorCode ? -1 : a.majorCode > b.majorCode ? 1 : 0;
    })
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* What-if — PART 6.69, 6.70                                           */
/* ------------------------------------------------------------------ */

export type WhatIfChange = { variable: string; from: number | null; to: number };

export type WhatIfOutcome = {
  originalScore: number;
  scenarioScore: number;
  scoreChange: number;
  changedVariables: WhatIfChange[];
};

/**
 * Tạo hồ sơ tạm và tính lại với CÙNG DNA và CÙNG cấu hình.
 *
 * Hồ sơ gốc không bị đụng tới: hàm dựng một object mới. Nếu sửa tại chỗ thì
 * một lần bấm thử "nếu Toán của em là 8 điểm" sẽ ghi đè hồ sơ thật, và em ấy
 * mất luôn dữ liệu mình đã khai.
 */
export function whatIf(
  profile: StudentProfile,
  dna: MajorDna,
  changes: Record<string, number>,
  options: MatchOptions = {}
): { ok: false; error: string } | { ok: true; outcome: WhatIfOutcome } {
  const base = matchMajor(profile, dna, options);
  if (!base.ok) return { ok: false, error: base.error };

  const temp: StudentProfile = {
    ...profile,
    factors: { ...profile.factors, ...changes },
  };

  const scenario = matchMajor(temp, dna, options);
  if (!scenario.ok) return { ok: false, error: scenario.error };

  return {
    ok: true,
    outcome: {
      originalScore: base.result.finalScore,
      scenarioScore: scenario.result.finalScore,
      scoreChange: scenario.result.finalScore - base.result.finalScore,
      changedVariables: Object.entries(changes).map(([variable, to]) => ({
        variable,
        from: profile.factors[variable] ?? null,
        to,
      })),
    },
  };
}

/* ------------------------------------------------------------------ */
/* So khớp hàng loạt — PART 6.73, 6.74                                 */
/* ------------------------------------------------------------------ */

export type BatchResult = {
  /** Đã xếp hạng và cắt Top N. */
  ranked: MatchResult[];
  /** Ngành engine từ chối chấm, kèm lý do — vẫn báo ra chứ không giấu. */
  skipped: { majorCode: string; majorName: string; error: MatchError; detail: string }[];
};

/**
 * Chấm một hồ sơ với nhiều ngành rồi xếp hạng.
 *
 * Nạp hồ sơ MỘT lần, chấm hết trong bộ nhớ (6.74). Ngành nào engine từ chối
 * thì đưa vào `skipped` kèm lý do thay vì lặng lẽ bỏ qua — học sinh có quyền
 * biết vì sao một ngành không xuất hiện trong bảng.
 */
export function matchMajors(
  profile: StudentProfile,
  majors: MajorDna[],
  limit = 10,
  options: MatchOptions = {}
): BatchResult {
  const results: MatchResult[] = [];
  const skipped: BatchResult["skipped"] = [];

  for (const dna of majors) {
    const out = matchMajor(profile, dna, options);
    if (out.ok) results.push(out.result);
    else skipped.push({
      majorCode: dna.majorCode,
      majorName: dna.nameVi,
      error: out.error,
      detail: out.detail,
    });
  }

  return { ranked: rankResults(results, limit), skipped };
}
