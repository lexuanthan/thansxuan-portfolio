import { describe, expect, it } from "vitest";
import {
  BAND_THRESHOLDS,
  CONFIDENCE_WEIGHTED_GROUPS,
  CONFIDENCE_WEIGHTS,
  FACTORS,
  FACTOR_BY_ID,
  GROUP_ORDER,
  GROUP_WEIGHTS,
  MATCHING_CONFIGURATION_VERSION,
  MIN_RIASEC_DIFFERENTIATION,
  RIASEC_INDEX,
  WEIGHTS_V1_SPEC,
  WEIGHTS_V2_EVIDENCE,
  MAXIMUM_TOTAL_PENALTY,
  MIN_GROUP_COMPLETENESS,
  SOFT_GATE_PENALTY,
  bandOf,
  factorsOfGroup,
  groupOfFactor,
  labelOfFactor,
  unknownFactorIds,
  validateConfig,
} from "@/lib/huongnghiep/config";

/**
 * Cấu hình sai không làm chương trình sập — nó chỉ làm điểm lệch đi trong im
 * lặng. Bộ test này là chỗ duy nhất phát hiện ra, nên nó phải chặt.
 */
describe("validateConfig", () => {
  it("cấu hình hiện tại không có lỗi nào", () => {
    expect(validateConfig()).toEqual([]);
  });

  it("TEST CASE 09 (6.97) — tổng trọng số nhóm đúng bằng 100%", () => {
    const sum = Object.values(GROUP_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1, 9);
  });

  it("bộ v1 giữ nguyên đúng như PART 6.5 để tái lập kết quả cũ", () => {
    expect(WEIGHTS_V1_SPEC).toEqual({
      ACADEMIC: 0.2,
      INTEREST: 0.2,
      ABILITY: 0.25,
      WORK_STYLE: 0.1,
      CAREER_VALUE: 0.1,
      RIASEC: 0.1,
      ENVIRONMENT: 0.05,
    });
  });

  it("bộ đang dùng là v2, chỉnh theo mức tin cậy của từng loại dữ liệu", () => {
    expect(GROUP_WEIGHTS).toEqual(WEIGHTS_V2_EVIDENCE);
    expect(MATCHING_CONFIGURATION_VERSION).toBe(2);
  });

  it("v2 hạ nhóm tự đánh giá và nâng nhóm dữ liệu khách quan", () => {
    // Năng lực tự chấm chỉ tương quan r ≈ 0.30 với năng lực đo được, nên nó
    // không được nặng ký hơn điểm môn — thứ trường đã đo sẵn.
    expect(WEIGHTS_V2_EVIDENCE.ABILITY).toBeLessThan(WEIGHTS_V1_SPEC.ABILITY);
    expect(WEIGHTS_V2_EVIDENCE.ACADEMIC).toBeGreaterThan(WEIGHTS_V1_SPEC.ACADEMIC);
    expect(WEIGHTS_V2_EVIDENCE.ABILITY).toBeLessThan(WEIGHTS_V2_EVIDENCE.ACADEMIC);
  });

  it("cả hai bộ đều cộng tròn 1", () => {
    for (const table of [WEIGHTS_V1_SPEC, WEIGHTS_V2_EVIDENCE]) {
      expect(Object.values(table).reduce((s, w) => s + w, 0)).toBeCloseTo(1, 9);
    }
  });

  it("có đủ bảy nhóm và mỗi nhóm đều có ngưỡng đầy đủ dữ liệu", () => {
    expect(GROUP_ORDER).toHaveLength(7);
    for (const g of GROUP_ORDER) {
      expect(MIN_GROUP_COMPLETENESS[g]).toBeGreaterThan(0);
      expect(MIN_GROUP_COMPLETENESS[g]).toBeLessThanOrEqual(1);
    }
  });

  it("tổng trọng số công thức confidence bằng 1", () => {
    const sum = Object.values(CONFIDENCE_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1, 9);
  });
});

describe("danh mục yếu tố", () => {
  it("không có mã nào bị trùng", () => {
    expect(FACTOR_BY_ID.size).toBe(FACTORS.length);
  });

  it("mã viết theo dạng nhóm.tên, chỉ chữ thường và dấu gạch dưới", () => {
    for (const f of FACTORS) expect(f.id).toMatch(/^[a-z_]+\.[a-z_]+$/);
  });

  it("mọi yếu tố đều có nhãn và mô tả tiếng Việt", () => {
    for (const f of FACTORS) {
      expect(f.label.trim().length).toBeGreaterThan(0);
      expect(f.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("Thinking được xếp vào nhóm Ability theo PART 6.4", () => {
    const thinking = FACTORS.filter((f) => f.id.startsWith("thinking."));
    expect(thinking.length).toBeGreaterThan(0);
    for (const f of thinking) expect(f.group).toBe("ABILITY");
  });

  it("RIASEC không có yếu tố nào vì chấm trên cả vector sáu chiều", () => {
    expect(factorsOfGroup("RIASEC")).toEqual([]);
  });

  it("mọi nhóm còn lại đều có yếu tố", () => {
    for (const g of GROUP_ORDER) {
      if (g !== "RIASEC") expect(factorsOfGroup(g).length).toBeGreaterThan(0);
    }
  });

  it("có đủ các yếu tố học thuật mà PART 5.8 liệt kê", () => {
    for (const id of [
      "academic.math",
      "academic.literature",
      "academic.english",
      "academic.physics",
      "academic.chemistry",
      "academic.biology",
      "academic.history",
      "academic.geography",
      "academic.informatics",
      "academic.technology",
    ]) {
      expect(FACTOR_BY_ID.has(id)).toBe(true);
    }
  });
});

describe("tra cứu", () => {
  it("groupOfFactor trả đúng nhóm, mã lạ trả null", () => {
    expect(groupOfFactor("academic.math")).toBe("ACADEMIC");
    expect(groupOfFactor("thinking.logical")).toBe("ABILITY");
    expect(groupOfFactor("khong.co.that")).toBeNull();
  });

  it("labelOfFactor trả nhãn, mã lạ trả lại chính mã đó", () => {
    expect(labelOfFactor("academic.math")).toBe("Toán");
    expect(labelOfFactor("khong.co")).toBe("khong.co");
  });

  it("unknownFactorIds chỉ ra mã lạ", () => {
    expect(unknownFactorIds(["academic.math", "khong.co"])).toEqual(["khong.co"]);
    expect(unknownFactorIds([])).toEqual([]);
  });
});

describe("phạt — PART 6.30, 6.44", () => {
  it("đúng mức phạt theo severity của tài liệu", () => {
    expect(SOFT_GATE_PENALTY).toEqual({ HIGH: 0.15, MEDIUM: 0.08, LOW: 0.03 });
  });

  it("trần phạt tổng đúng 30%", () => {
    expect(MAXIMUM_TOTAL_PENALTY).toBeCloseTo(0.3, 9);
  });

  it("không mức phạt đơn lẻ nào vượt trần", () => {
    for (const p of Object.values(SOFT_GATE_PENALTY)) {
      expect(p).toBeLessThanOrEqual(MAXIMUM_TOTAL_PENALTY);
    }
  });

  it("trần phạt nhỏ hơn 1 — phạt không được nuốt trọn điểm", () => {
    expect(MAXIMUM_TOTAL_PENALTY).toBeGreaterThan(0);
    expect(MAXIMUM_TOTAL_PENALTY).toBeLessThan(1);
  });
});

describe("dải kết quả — PART 6.46, 6.47", () => {
  it("bốn dải đúng ngưỡng tài liệu", () => {
    expect(bandOf(100)).toBe("STRONG_MATCH");
    expect(bandOf(80)).toBe("STRONG_MATCH");
    expect(bandOf(79.99)).toBe("GOOD_MATCH");
    expect(bandOf(65)).toBe("GOOD_MATCH");
    expect(bandOf(64.9)).toBe("EXPLORE");
    expect(bandOf(50)).toBe("EXPLORE");
    expect(bandOf(49.9)).toBe("LOW_MATCH");
    expect(bandOf(0)).toBe("LOW_MATCH");
  });

  it("ngưỡng xếp giảm dần để vòng lặp lấy đúng dải đầu tiên khớp", () => {
    for (let i = 1; i < BAND_THRESHOLDS.length; i += 1) {
      expect(BAND_THRESHOLDS[i].min).toBeLessThan(BAND_THRESHOLDS[i - 1].min);
    }
  });
});

describe("nhóm được nhân confidence — PART 6.27", () => {
  it("mặc định chỉ RIASEC", () => {
    expect(CONFIDENCE_WEIGHTED_GROUPS).toEqual(["RIASEC"]);
  });

  it("mọi nhóm trong danh sách đều tồn tại", () => {
    for (const g of CONFIDENCE_WEIGHTED_GROUPS) expect(GROUP_ORDER).toContain(g);
  });
});

describe("cách đo RIASEC", () => {
  it("mặc định là tương quan hồ sơ, không phải cosine", () => {
    expect(RIASEC_INDEX).toBe("CORRELATION");
  });

  it("ngưỡng phân hoá nằm giữa hồ sơ phẳng (1.3) và hồ sơ có kiểu rõ (18–22)", () => {
    expect(MIN_RIASEC_DIFFERENTIATION).toBeGreaterThan(5);
    expect(MIN_RIASEC_DIFFERENTIATION).toBeLessThan(18);
  });
});
