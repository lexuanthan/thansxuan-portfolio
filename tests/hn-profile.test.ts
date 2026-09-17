import { describe, expect, it } from "vitest";
import {
  buildProfile,
  deriveRiasec,
  dominantRiasec,
  explainVariable,
  temporaryProfile,
  validateResponse,
} from "@/lib/huongnghiep/profile";
import { seedSurveyResponse, DATA_SCIENCE_DNA } from "@/lib/huongnghiep/seed";
import { matchMajor } from "@/lib/huongnghiep/engine";
import { FACTOR_BY_ID } from "@/lib/huongnghiep/config";
import { RIASEC_KEYS, type StudentProfile } from "@/lib/huongnghiep/types";
import type { SurveyResponse } from "@/lib/huongnghiep/survey";

const NOW = () => "2026-01-01T00:00:00.000Z";

function built(overrides: Partial<SurveyResponse["answers"]> = {}) {
  const out = buildProfile(seedSurveyResponse(overrides), { now: NOW });
  if (!out.ok) throw new Error(`${out.error}: ${out.detail}`);
  return out;
}

describe("buildProfile — đường ống 12 bước", () => {
  it("dựng được hồ sơ từ bộ trả lời đầy đủ", () => {
    const { profile, detail } = built();
    expect(profile.profileId).toContain("S_SEED");
    expect(profile.version).toBe(1);
    expect(Object.keys(profile.factors).length).toBeGreaterThan(60);
    expect(detail.validationIssues).toEqual([]);
  });

  it("chỉ sinh ra mã yếu tố mà Matching Engine biết", () => {
    const { profile } = built();
    for (const key of Object.keys(profile.factors)) {
      expect(FACTOR_BY_ID.has(key)).toBe(true);
    }
  });

  it("KHÔNG sinh ra biến gợi ý ngành — việc đó của Matching Engine (3.49)", () => {
    const { profile, detail } = built();
    const allKeys = [...Object.keys(profile.factors), ...Object.keys(detail.variables)];
    for (const k of allKeys) {
      expect(k).not.toContain("recommended");
      expect(k).not.toContain("major");
      expect(k).not.toContain("admission_probability");
    }
  });

  it("từ chối khi khảo sát chưa submit", () => {
    const r = seedSurveyResponse();
    const out = buildProfile({ ...r, status: "IN_PROGRESS" }, { now: NOW });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toBe("SURVEY_NOT_COMPLETED");
  });

  it("bật allowIncomplete thì dựng được hồ sơ dở dang", () => {
    const r = seedSurveyResponse();
    const out = buildProfile({ ...r, status: "IN_PROGRESS" }, { now: NOW, allowIncomplete: true });
    expect(out.ok).toBe(true);
  });

  it("không câu nào dùng được thì báo lỗi rõ ràng", () => {
    const out = buildProfile(
      { ...seedSurveyResponse(), answers: {} },
      { now: NOW, allowIncomplete: true }
    );
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toBe("NO_USABLE_ANSWERS");
  });
});

describe("quy đổi đúng thang", () => {
  it("điểm Toán 8.5 thành 85", () => {
    expect(built().profile.factors["academic.math"]).toBeCloseTo(85, 9);
  });

  it("Likert 5 ở Q23 thành 100", () => {
    expect(built().profile.factors["ability.logical"]).toBeCloseTo(100, 9);
  });

  it("Likert 3 ở Q26 thành 50", () => {
    expect(built().profile.factors["ability.communication"]).toBeCloseTo(50, 9);
  });

  it("thanh trượt Q35 giữ nguyên giá trị", () => {
    expect(built().profile.factors["work_style.structure"]).toBeCloseTo(60, 9);
  });
});

describe("dữ liệu thiếu — không bao giờ thành 0", () => {
  it("môn bỏ trống thì KHÔNG có khoá đó trong hồ sơ", () => {
    const { profile } = built({
      Q07: { math: 8.5, informatics: 9, english: 7.8 },
    });
    expect(profile.factors["academic.math"]).toBeCloseTo(85, 9);
    expect("academic.biology" in profile.factors).toBe(false);
    expect(profile.factors["academic.biology"]).toBeUndefined();
  });

  it("điểm ngoài thang bị loại và được ghi lại thành lỗi, không làm tròn", () => {
    const { profile, detail } = built({
      Q07: { math: 12, informatics: 9 },
    });
    expect(detail.validationIssues.length).toBeGreaterThan(0);
    expect(detail.validationIssues[0].question).toBe("Q07");
    expect("academic.math" in profile.factors).toBe(false);
    // Không được âm thầm thành 100
    expect(profile.factors["academic.math"]).not.toBe(100);
  });

  it("bỏ trống cả câu môi trường thì không có yếu tố môi trường nào", () => {
    const { profile } = built({ Q45: null });
    expect("environment.office" in profile.factors).toBe(false);
  });

  it("có trả lời câu môi trường thì mục không chọn nhận điểm thấp, không phải thiếu", () => {
    const { profile } = built();
    expect(profile.factors["environment.hybrid"]).toBe(90);
    expect(profile.factors["environment.factory"]).toBe(30);
  });
});

describe("suy diễn và dấu vết truy nguyên — PART 3.48", () => {
  it("ability.numerical suy ra từ Toán và tư duy logic", () => {
    const { profile, detail } = built();
    const numerical = profile.factors["ability.numerical"];
    expect(typeof numerical).toBe("number");

    const origin = detail.lineage["ability.numerical"];
    expect(origin.sources).toContain("academic.math");
    expect(origin.sources).toContain("ability.logical");
  });

  it("biến thô truy về đúng câu hỏi gốc", () => {
    const { detail } = built();
    expect(detail.lineage["academic.math"].questions).toContain("Q07");
    expect(detail.lineage["academic.math"].ruleId).toBeNull();
    expect(detail.lineage["academic.math"].measurement).toBe("declared");
  });

  it("biến suy diễn mang mã luật và truy ngược về câu hỏi gốc của các nguồn", () => {
    const { detail } = built();
    const origin = detail.lineage["ability.verbal"];
    expect(origin.ruleId).toBe("DR-002");
    expect(origin.measurement).toBe("derived");
    expect(origin.questions.length).toBeGreaterThan(0);
  });

  it("explainVariable trả lời được 'con số này ở đâu ra'", () => {
    const { detail } = built();
    const out = explainVariable(detail, "ability.numerical");
    expect(typeof out.value).toBe("number");
    expect(out.origin?.ruleId).toBe("DR-001");
  });

  it("câu trả lời trực tiếp KHÔNG bị biến suy diễn ghi đè", () => {
    const { profile } = built();
    // Q24 = 5 → 100. Không luật nào được kéo nó xuống.
    expect(profile.factors["ability.analytical"]).toBeCloseTo(100, 9);
  });

  it("chọn thế mạnh ở Q13 cộng thêm lên nền đã có", () => {
    // Dùng ability.organization vì nền của nó (Q28 = 4 → 75) chưa chạm trần,
    // nên còn thấy được phần cộng thêm.
    const khong = built({ Q13: [] }).profile.factors["ability.organization"] as number;
    const co = built({ Q13: ["Tổ chức"] }).profile.factors["ability.organization"] as number;
    expect(khong).toBeCloseTo(75, 9);
    expect(co).toBeGreaterThan(khong);
  });

  it("điểm cộng bị chặn trần 100, không tràn ra ngoài thang", () => {
    const { profile } = built({ Q13: ["Tư duy logic"] });
    // Q23 = 5 → nền đã là 100, cộng thêm 10 vẫn phải là 100
    expect(profile.factors["ability.logical"]).toBe(100);
  });
});

describe("RIASEC — PART 3.27", () => {
  it("sinh đủ sáu chiều từ nhiều nguồn", () => {
    const { profile, detail } = built();
    for (const k of RIASEC_KEYS) expect(k in profile.riasec).toBe(true);
    expect(detail.riasecConfidence).toBeGreaterThan(0.5);
  });

  it("hồ sơ thiên công nghệ – dữ liệu có chiều I trội", () => {
    const { profile } = built();
    expect(dominantRiasec(profile.riasec)[0]).toBe("I");
  });

  it("chiều không đủ nguồn dữ liệu thì để null, không đoán bừa", () => {
    const { riasec, confidence } = deriveRiasec({ "interest.machines": 80 });
    expect(riasec.R).toBeNull();
    expect(confidence).toBe(0);
  });

  it("không lấy RIASEC từ một câu hỏi duy nhất", () => {
    // Chỉ có đúng hai nguồn cho chiều I thì vẫn chưa đủ
    const { riasec } = deriveRiasec({
      "interest.research": 90,
      "interest.science": 85,
    });
    expect(riasec.I).toBeNull();
  });

  it("đủ ba nguồn trở lên thì tính được", () => {
    const { riasec } = deriveRiasec({
      "interest.research": 90,
      "interest.science": 90,
      "ability.analytical": 90,
    });
    expect(riasec.I).toBeCloseTo(90, 6);
  });
});

describe("completeness, confidence và điều kiện thực tế", () => {
  it("bộ trả lời đầy đủ đạt completeness 100% và sẵn sàng so khớp", () => {
    const { profile } = built();
    expect(profile.completeness.value).toBe(1);
    expect(profile.completeness.missing).toEqual([]);
    expect(profile.status).toBe("READY_FOR_MATCHING");
  });

  it("bỏ trống câu bắt buộc thì completeness giảm và hồ sơ chỉ là PARTIAL", () => {
    const { profile } = built({ Q15: null });
    expect(profile.completeness.value).toBeLessThan(1);
    expect(profile.completeness.missing).toContain("Q15");
    expect(profile.status).toBe("PARTIAL");
  });

  it("mỗi nhóm hồ sơ có độ tin và mức chất lượng riêng", () => {
    const { detail } = built();
    expect(detail.groupConfidence.ACADEMIC).toBeGreaterThan(0.9);
    expect(detail.groupQuality.ACADEMIC).toBe("HIGH");
    expect(detail.groupQuality.RIASEC).toBeTruthy();
  });

  it("đầy đủ khác đáng tin — reliability bị hạ vì phần lớn là tự đánh giá (3.41)", () => {
    const { profile, detail } = built();
    expect(profile.completeness.value).toBe(1);
    expect(detail.reliability).toBeLessThan(1);
  });

  it("điều kiện thực tế tách hẳn khỏi năng lực và sở thích (3.30)", () => {
    const { profile, detail } = built();
    expect(detail.constraints.expectedThptScore).toBe(25.5);
    expect(detail.constraints.annualTuitionBudget).toBe("30–50 triệu");
    expect(detail.constraints.currentProvince).toBe("TP. Hồ Chí Minh");
    // Không được lẫn vào bảng yếu tố
    expect("expected_thpt_score" in profile.factors).toBe(false);
  });

  it("không tạo xác suất trúng tuyển (3.33)", () => {
    const { detail } = built();
    expect(JSON.stringify(detail.constraints)).not.toContain("probability");
  });
});

describe("validateResponse", () => {
  it("bắt điểm ngoài thang 0–10", () => {
    const issues = validateResponse(seedSurveyResponse({ Q07: { math: 11 } }));
    expect(issues.some((i) => i.question === "Q07")).toBe(true);
  });

  it("bắt Likert ngoài thang 1–5", () => {
    const issues = validateResponse(seedSurveyResponse({ Q23: 7 }));
    expect(issues.some((i) => i.question === "Q23")).toBe(true);
  });

  it("bắt chọn quá số lượng cho phép", () => {
    const issues = validateResponse(
      seedSurveyResponse({ Q13: ["Tư duy logic", "Tính toán", "Vẽ", "Viết"] })
    );
    expect(issues.some((i) => i.question === "Q13")).toBe(true);
  });

  it("bộ trả lời chuẩn không có lỗi nào", () => {
    expect(validateResponse(seedSurveyResponse())).toEqual([]);
  });
});

describe("temporaryProfile — PART 3.45", () => {
  it("tạo hồ sơ mới, không đụng hồ sơ gốc", () => {
    const { profile } = built();
    const truoc = profile.factors["academic.math"];
    const temp = temporaryProfile(profile, { "academic.math": 95 });

    expect(temp.factors["academic.math"]).toBe(95);
    expect(profile.factors["academic.math"]).toBe(truoc);
    expect(temp).not.toBe(profile);
  });
});

/* ------------------------------------------------------------------ */
/* Tích hợp: khảo sát → hồ sơ → so khớp                                */
/* ------------------------------------------------------------------ */

describe("TÍCH HỢP — PART 2 → PART 3 → PART 6", () => {
  it("chạy được trọn đường từ câu trả lời tới điểm khớp ngành", () => {
    const { profile } = built();
    const out = matchMajor(profile, DATA_SCIENCE_DNA, { now: NOW });

    expect(out.ok).toBe(true);
    if (!out.ok) return;

    expect(out.result.finalScore).toBeGreaterThan(0);
    expect(out.result.finalScore).toBeLessThanOrEqual(100);
    expect(out.result.band).toBeTruthy();
    expect(out.result.groups).toHaveLength(7);
  });

  it("hồ sơ thiên công nghệ – dữ liệu khớp cao với Khoa học dữ liệu", () => {
    const { profile } = built();
    const out = matchMajor(profile, DATA_SCIENCE_DNA, { now: NOW });
    if (!out.ok) throw new Error(out.error);
    expect(out.result.finalScore).toBeGreaterThan(65);
    expect(out.result.eligible).toBe(true);
    expect(out.result.penalty).toBe(0);
  });

  it("hồ sơ Toán yếu bị cổng mềm trừ điểm đúng như thiết kế", () => {
    const { profile } = built({
      Q07: {
        math: 3, literature: 7, english: 7.8, physics: 5, chemistry: 6,
        biology: 6, history: 6.5, geography: 6.8, informatics: 9, technology: 8,
      },
    });
    const out = matchMajor(profile, DATA_SCIENCE_DNA, { now: NOW });
    if (!out.ok) throw new Error(out.error);

    expect(out.result.penalty).toBeGreaterThan(0);
    expect(out.result.finalScore).toBeLessThan(out.result.rawScore);
    expect(
      out.result.criticalFactors.find((c) => c.factor === "academic.math")?.status
    ).toBe("BELOW_THRESHOLD");
  });

  it("bỏ trống Toán thì KHÔNG bị phạt — thiếu dữ liệu không phải điểm kém", () => {
    const thieu = built({
      Q07: { literature: 7, english: 7.8, informatics: 9, technology: 8, physics: 7 },
    }).profile;
    const kem = built({
      Q07: {
        math: 3, literature: 7, english: 7.8, informatics: 9, technology: 8, physics: 7,
      },
    }).profile;

    const a = matchMajor(thieu, DATA_SCIENCE_DNA, { now: NOW });
    const b = matchMajor(kem, DATA_SCIENCE_DNA, { now: NOW });
    if (!a.ok || !b.ok) throw new Error("engine từ chối");

    expect(a.result.penalty).toBe(0);
    expect(b.result.penalty).toBeGreaterThan(0);
    expect(
      a.result.criticalFactors.find((c) => c.factor === "academic.math")?.status
    ).toBe("MISSING");
  });

  it("hồ sơ mang theo phiên bản khảo sát để tái lập được", () => {
    const { profile } = built();
    const out = matchMajor(profile, DATA_SCIENCE_DNA, { now: NOW });
    if (!out.ok) throw new Error(out.error);
    expect(profile.surveyVersion).toBe("survey-1.0.0");
    expect(out.result.versions.studentProfileVersion).toBe(profile.version);
  });

  it("cùng bộ trả lời cho cùng kết quả — tái lập được", () => {
    const a = matchMajor(built().profile, DATA_SCIENCE_DNA, { now: NOW });
    const b = matchMajor(built().profile, DATA_SCIENCE_DNA, { now: NOW });
    if (!a.ok || !b.ok) throw new Error("engine từ chối");
    expect(a.result.inputHash).toBe(b.result.inputHash);
    expect(a.result.finalScore).toBeCloseTo(b.result.finalScore, 12);
  });

  it("hồ sơ quá thiếu bị engine từ chối thay vì trả điểm trông có vẻ đáng tin", () => {
    const out = buildProfile(
      {
        ...seedSurveyResponse(),
        answers: { Q07: { math: 8 } },
        status: "COMPLETED",
      },
      { now: NOW }
    );
    if (!out.ok) throw new Error(out.error);

    const matched = matchMajor(out.profile as StudentProfile, DATA_SCIENCE_DNA, { now: NOW });
    expect(matched.ok).toBe(false);
    if (!matched.ok) expect(matched.error).toBe("PROFILE_INSUFFICIENT");
  });
});

/* ------------------------------------------------------------------ */
/* Hồi quy: điểm cộng phải áp SAU suy diễn                             */
/* ------------------------------------------------------------------ */

describe("thứ tự áp điểm cộng — lỗi đã từng có", () => {
  it("thinking.analytical bám theo ability.analytical, không bị điểm cộng chặn mất nền", () => {
    const { profile } = built();
    const analytical = profile.factors["ability.analytical"] as number;
    const thinking = profile.factors["thinking.analytical"] as number;

    expect(analytical).toBeCloseTo(100, 9);
    // Trước khi sửa, biến này ra 18 vì điểm cộng Q22+Q34 ghi trước rồi
    // chặn luôn luật DR-010.
    expect(thinking).toBeGreaterThanOrEqual(analytical);
    expect(thinking).toBeGreaterThan(90);
  });

  it("ability.problem_solving lấy nền từ luật chứ không chỉ từ điểm cộng", () => {
    const { profile, detail } = built();
    expect(profile.factors["ability.problem_solving"]).toBeGreaterThan(80);
    expect(detail.lineage["ability.problem_solving"].sources).toContain("ability.analytical");
  });

  it("biến chỉ có điểm cộng vẫn được ghi nhận, ở mức thấp đúng với tín hiệu yếu", () => {
    // career_value.people không có câu thang đo nào, chỉ sống bằng điểm cộng
    const { profile } = built({
      Q13: ["Giúp đỡ người khác"],
      Q47: "Khách hàng",
    });
    const people = profile.factors["career_value.people"] as number;
    expect(typeof people).toBe("number");
    expect(people).toBeCloseTo(15 + 12, 9);
    expect(people).toBeLessThan(60);
  });

  it("không chọn gì cộng vào thì biến ấy VẮNG MẶT, không phải bằng 0", () => {
    // Bộ trả lời mẫu vốn không chọn mục nào cộng cho career_value.people
    const { profile } = built();
    expect("career_value.people" in profile.factors).toBe(false);
    expect(profile.factors["career_value.people"]).toBeUndefined();
  });
});
