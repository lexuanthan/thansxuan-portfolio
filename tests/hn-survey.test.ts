import { describe, expect, it } from "vitest";
import {
  INTEREST_DOMAINS,
  INTEREST_LABEL,
  QUESTIONS,
  QUESTION_BY_CODE,
  SCREENS,
  SUBJECTS,
  optionCode,
  qualityFlags,
  questionsOfScreen,
  requiredQuestionCodes,
  type SurveyResponse,
} from "@/lib/huongnghiep/survey";
import {
  ENVIRONMENT_OPTION_MAP,
  OPTION_CONTRIBUTIONS,
  RIASEC_MAP,
  applyRule,
  evaluationOrder,
  findDerivationCycles,
  likertToScore,
  sliderToScore,
  subjectToScore,
  expectedFactorKeys,
  RULES,
} from "@/lib/huongnghiep/derivation";
import { FACTOR_BY_ID } from "@/lib/huongnghiep/config";
import { RIASEC_KEYS } from "@/lib/huongnghiep/types";

describe("bộ câu hỏi — PART 2.5", () => {
  it("đúng 62 câu và 9 màn hình", () => {
    expect(QUESTIONS).toHaveLength(62);
    expect(SCREENS).toHaveLength(9);
  });

  it("mã câu chạy liền Q01 → Q62, không trùng không hụt", () => {
    const codes = QUESTIONS.map((q) => q.code);
    expect(new Set(codes).size).toBe(62);
    for (let i = 1; i <= 62; i += 1) {
      expect(codes).toContain(`Q${String(i).padStart(2, "0")}`);
    }
  });

  it("mỗi màn hình có số câu đúng theo dải mã câu của tài liệu", () => {
    // Lưu ý: bảng 2.5 ghi 6/7/8/8/8/7/6/6/6 nhưng dải mã câu thực tế trong
    // tài liệu là 6/6/7/10/8/7/6/6/6. Cả hai cùng cộng ra 62; ở đây lấy theo
    // dải mã câu vì đó mới là chỗ định nghĩa từng câu một.
    const expected = [6, 6, 7, 10, 8, 7, 6, 6, 6];
    SCREENS.forEach((s, i) => {
      expect(questionsOfScreen(s.code)).toHaveLength(expected[i]);
    });
  });

  it("mọi câu đều có khoá biến và nhóm hồ sơ", () => {
    for (const q of QUESTIONS) {
      expect(q.variableKey.trim().length).toBeGreaterThan(0);
      expect(q.profileGroup.trim().length).toBeGreaterThan(0);
      expect(q.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("khoá biến không trùng nhau", () => {
    const keys = QUESTIONS.map((q) => q.variableKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("có câu được đánh dấu cần cho Matching Engine", () => {
    const required = requiredQuestionCodes();
    expect(required.length).toBeGreaterThan(5);
    expect(required).toContain("Q07");
    expect(required).toContain("Q15");
  });

  it("mã lựa chọn ổn định, không phụ thuộc nhãn tiếng Việt", () => {
    expect(optionCode("Q13", 0)).toBe("Q13_O01");
    expect(optionCode("Q13", 11)).toBe("Q13_O12");
  });

  it("22 lĩnh vực quan tâm đều có nhãn", () => {
    expect(INTEREST_DOMAINS).toHaveLength(22);
    for (const d of INTEREST_DOMAINS) expect(INTEREST_LABEL[d]).toBeTruthy();
  });

  it("10 môn học khớp với danh mục yếu tố học thuật", () => {
    expect(SUBJECTS).toHaveLength(10);
    for (const s of SUBJECTS) expect(FACTOR_BY_ID.has(`academic.${s}`)).toBe(true);
  });
});

describe("bản đồ đóng góp từ lựa chọn", () => {
  it("mọi nhãn đều tồn tại trong danh sách lựa chọn của đúng câu đó", () => {
    for (const [code, table] of Object.entries(OPTION_CONTRIBUTIONS)) {
      const q = QUESTION_BY_CODE.get(code);
      expect(q).toBeTruthy();
      const options = q?.options ?? [];
      for (const label of Object.keys(table)) {
        expect(options).toContain(label);
      }
    }
  });

  it("mọi biến đích đều là mã yếu tố có thật", () => {
    for (const table of Object.values(OPTION_CONTRIBUTIONS)) {
      for (const contributions of Object.values(table)) {
        for (const c of contributions) {
          expect(FACTOR_BY_ID.has(c.variable)).toBe(true);
        }
      }
    }
  });

  it("điểm cộng đều dương và không quá lớn", () => {
    for (const table of Object.values(OPTION_CONTRIBUTIONS)) {
      for (const contributions of Object.values(table)) {
        for (const c of contributions) {
          expect(c.points).toBeGreaterThan(0);
          expect(c.points).toBeLessThanOrEqual(30);
        }
      }
    }
  });

  it("bản đồ môi trường khớp lựa chọn Q45 và trỏ tới yếu tố có thật", () => {
    const options = QUESTION_BY_CODE.get("Q45")?.options ?? [];
    for (const [label, key] of Object.entries(ENVIRONMENT_OPTION_MAP)) {
      expect(options).toContain(label);
      expect(FACTOR_BY_ID.has(key)).toBe(true);
    }
    expect(Object.keys(ENVIRONMENT_OPTION_MAP)).toHaveLength(12);
  });
});

describe("quy đổi thang — PART 2.10", () => {
  it("Likert chia cho 4 chứ không chia cho 5", () => {
    expect(likertToScore(1)).toBe(0);
    expect(likertToScore(3)).toBe(50);
    expect(likertToScore(5)).toBe(100);
    // Chia cho 5 sẽ ra 20 ở mức thấp nhất và không ai chạm được đáy
    expect(likertToScore(1)).not.toBe(20);
  });

  it("Likert ngoài thang hoặc thiếu trả null", () => {
    expect(likertToScore(0)).toBeNull();
    expect(likertToScore(6)).toBeNull();
    expect(likertToScore(null)).toBeNull();
    expect(likertToScore("4")).toBeNull();
  });

  it("điểm môn nhân 10, ngoài thang trả null", () => {
    expect(subjectToScore(8.2)).toBeCloseTo(82, 9);
    expect(subjectToScore(0)).toBe(0);
    expect(subjectToScore(10)).toBe(100);
    expect(subjectToScore(12)).toBeNull();
    expect(subjectToScore(-1)).toBeNull();
  });

  it("slider giữ nguyên, ngoài khoảng trả null", () => {
    expect(sliderToScore(63)).toBe(63);
    expect(sliderToScore(101)).toBeNull();
  });
});

describe("luật suy diễn — PART 3.58", () => {
  it("không có vòng lặp phụ thuộc", () => {
    expect(findDerivationCycles()).toEqual([]);
  });

  it("phát hiện được vòng lặp khi có", () => {
    const cycles = findDerivationCycles([
      { id: "X1", target: "a", sources: ["b"], method: "mean" },
      { id: "X2", target: "b", sources: ["c"], method: "mean" },
      { id: "X3", target: "c", sources: ["a"], method: "mean" },
    ]);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it("mã luật không trùng nhau", () => {
    const ids = RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mỗi biến đích chỉ có một luật", () => {
    const targets = RULES.map((r) => r.target);
    expect(new Set(targets).size).toBe(targets.length);
  });

  it("thứ tự tính đặt nguồn trước đích", () => {
    const order = evaluationOrder();
    const seen = new Set<string>();
    const targets = new Set(RULES.map((r) => r.target));
    for (const rule of order) {
      for (const src of rule.sources) {
        if (targets.has(src)) expect(seen.has(src)).toBe(true);
      }
      seen.add(rule.target);
    }
    expect(order).toHaveLength(RULES.length);
  });

  it("mọi luật có ít nhất một nguồn", () => {
    for (const r of RULES) expect(r.sources.length).toBeGreaterThan(0);
  });
});

describe("applyRule", () => {
  const rule = { id: "T", target: "t", sources: ["a", "b", "c"], method: "mean" as const };

  it("trung bình trên các nguồn CÓ dữ liệu", () => {
    expect(applyRule(rule, { a: 60, b: 80, c: 100 })).toBeCloseTo(80, 9);
  });

  it("nguồn thiếu bị loại khỏi phép tính, không coi là 0", () => {
    expect(applyRule(rule, { a: 60, b: 80 })).toBeCloseTo(70, 9);
    // Nếu coi c = 0 thì kết quả sẽ là 46.67
    expect(applyRule(rule, { a: 60, b: 80 })).not.toBeCloseTo(46.67, 1);
  });

  it("không nguồn nào có dữ liệu thì trả null chứ không trả 0", () => {
    expect(applyRule(rule, {})).toBeNull();
    expect(applyRule(rule, { a: null, b: undefined })).toBeNull();
  });

  it("passthrough lấy nguồn đầu tiên có dữ liệu", () => {
    expect(
      applyRule({ id: "P", target: "t", sources: ["x", "y"], method: "passthrough" }, { y: 44 })
    ).toBe(44);
  });

  it("invert lấy phần bù", () => {
    expect(
      applyRule({ id: "I", target: "t", sources: ["x"], method: "invert" }, { x: 30 })
    ).toBe(70);
  });

  it("weighted_mean dùng đúng trọng số", () => {
    const out = applyRule(
      { id: "W", target: "t", sources: ["a", "b"], method: "weighted_mean", weights: { a: 3, b: 1 } },
      { a: 100, b: 0 }
    );
    expect(out).toBeCloseTo(75, 9);
  });
});

describe("bản đồ RIASEC — PART 2.7, 3.27", () => {
  it("đủ sáu chiều, mỗi chiều nhiều hơn một nguồn", () => {
    for (const dim of RIASEC_KEYS) {
      expect(RIASEC_MAP[dim].length).toBeGreaterThan(2);
    }
  });

  it("không chiều nào lấy từ đúng một câu hỏi duy nhất", () => {
    for (const dim of RIASEC_KEYS) {
      const sources = new Set(RIASEC_MAP[dim].map((c) => c.source));
      expect(sources.size).toBeGreaterThan(2);
    }
  });

  it("trọng số đều dương", () => {
    for (const dim of RIASEC_KEYS) {
      for (const c of RIASEC_MAP[dim]) expect(c.weight).toBeGreaterThan(0);
    }
  });
});

describe("expectedFactorKeys — hợp đồng giữa PART 3 và PART 6", () => {
  it("khớp chính xác danh mục yếu tố của Matching Engine, không thừa không thiếu", () => {
    const expected = new Set(expectedFactorKeys());
    const actual = new Set(FACTOR_BY_ID.keys());

    const thua = [...expected].filter((k) => !actual.has(k));
    const thieu = [...actual].filter((k) => !expected.has(k));

    expect(thua).toEqual([]);
    expect(thieu).toEqual([]);
  });

  it("đúng 90 yếu tố", () => {
    expect(expectedFactorKeys()).toHaveLength(90);
  });
});

describe("kiểm tra chất lượng trả lời — PART 2.13", () => {
  function response(answers: SurveyResponse["answers"]): SurveyResponse {
    return {
      responseId: "R1",
      studentId: "S1",
      surveyVersion: "survey-1.0.0",
      status: "COMPLETED",
      answers,
      startedAt: "2026-01-01T00:00:00.000Z",
    };
  }

  it("phát hiện trả lời một mực trên bảng ma trận", () => {
    const flat: Record<string, number> = {};
    for (const d of INTEREST_DOMAINS) flat[d] = 3;
    expect(qualityFlags(response({ Q15: flat }))).toContain("STRAIGHT_LINING");
  });

  it("chọn hết 22 lĩnh vực là hồ sơ rộng, không phải hồ sơ sai", () => {
    const all = INTEREST_DOMAINS.map((d) => INTEREST_LABEL[d]);
    const flags = qualityFlags(response({ Q14: all }));
    expect(flags).toContain("BROAD_INTEREST_PROFILE");
  });

  it("sở thích hỗn hợp chỉ được ghi nhận, không bị coi là mâu thuẫn cần sửa", () => {
    const flags = qualityFlags(response({ Q29: 5, Q36: 95 }));
    expect(flags).toContain("MIXED_PREFERENCES");
  });

  it("trả lời quá ít bị gắn cờ thưa", () => {
    expect(qualityFlags(response({ Q01: "12" }))).toContain("SPARSE_RESPONSE");
  });

  it("hồ sơ bình thường không bị gắn cờ nào", () => {
    const varied: Record<string, number> = {};
    INTEREST_DOMAINS.forEach((d, i) => {
      varied[d] = (i % 5) + 1;
    });
    const answers: SurveyResponse["answers"] = { Q15: varied };
    for (const q of QUESTIONS) if (!answers[q.code]) answers[q.code] = 3;
    expect(qualityFlags(response(answers))).not.toContain("STRAIGHT_LINING");
  });
});
