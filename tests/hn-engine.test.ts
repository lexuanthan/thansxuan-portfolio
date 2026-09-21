import { describe, expect, it } from "vitest";
import {
  matchMajor,
  rankResults,
  stripClientScores,
  whatIf,
} from "@/lib/huongnghiep/engine";
import {
  DATA_SCIENCE_DNA,
  makeProfile,
  seedStrongProfile,
} from "@/lib/huongnghiep/seed";
import {
  GROUP_WEIGHTS,
  MAXIMUM_TOTAL_PENALTY,
  SOFT_GATE_PENALTY,
  bandOf,
} from "@/lib/huongnghiep/config";
import type { MajorDna, MatchResult, StudentProfile } from "@/lib/huongnghiep/types";

const FIXED_NOW = () => "2026-01-01T00:00:00.000Z";
const opts = { now: FIXED_NOW };

/** Lấy kết quả ra, ném lỗi nếu engine từ chối — cho test đọc gọn. */
function ok(outcome: ReturnType<typeof matchMajor>): MatchResult {
  if (!outcome.ok) throw new Error(`${outcome.error}: ${outcome.detail}`);
  return outcome.result;
}

function profileFrom(overrides: Record<string, number>, completeness = 0.95) {
  const base = seedStrongProfile();
  return makeProfile(
    { ...base.factors, ...overrides },
    { ...DATA_SCIENCE_DNA.riasec },
    completeness
  );
}

describe("matchMajor — đường đi cơ bản", () => {
  it("hồ sơ trùng khít DNA cho điểm rất cao và không có phạt", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    expect(r.rawScore).toBeGreaterThan(95);
    expect(r.penalty).toBe(0);
    expect(r.finalScore).toBeCloseTo(r.rawScore, 9);
    expect(r.band).toBe("STRONG_MATCH");
    expect(r.eligible).toBe(true);
  });

  it("trả đủ bảy nhóm theo đúng thứ tự cấu hình", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    expect(r.groups.map((g) => g.group)).toEqual(Object.keys(GROUP_WEIGHTS));
  });

  it("tổng trọng số thực của các nhóm dùng được bằng 1", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    const sum = r.groups.reduce((s, g) => s + g.effectiveWeight, 0);
    expect(sum).toBeCloseTo(1, 9);
  });

  it("điểm thô đúng bằng tổng điểm nhóm nhân trọng số thực (6.42)", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    const manual = r.groups.reduce(
      (s, g) => s + (g.score ?? 0) * g.effectiveWeight,
      0
    );
    expect(r.rawScore).toBeCloseTo(manual, 9);
  });
});

describe("TEST CASE 03 (6.91) — dữ liệu thiếu không bị coi là 0", () => {
  it("yếu tố học sinh chưa khai bị loại khỏi phép tính", () => {
    const base = seedStrongProfile();
    const thieu = { ...base.factors };
    delete thieu["academic.math"];

    const r = ok(
      matchMajor(
        makeProfile(thieu, { ...DATA_SCIENCE_DNA.riasec }, 0.95),
        DATA_SCIENCE_DNA,
        opts
      )
    );
    const math = r.groups
      .find((g) => g.group === "ACADEMIC")!
      .factors.find((f) => f.factor === "academic.math")!;

    expect(math.studentValue).toBeNull();
    expect(math.similarityScore).toBeNull();
    expect(math.status).toBe("MISSING_STUDENT");
    expect(math.contribution).toBe(0);
  });

  it("thiếu dữ liệu làm giảm coverage chứ không kéo tụt điểm nhóm", () => {
    const base = seedStrongProfile();
    const thieu = { ...base.factors };
    delete thieu["academic.math"];

    const day = ok(matchMajor(base, DATA_SCIENCE_DNA, opts));
    const khuyet = ok(
      matchMajor(
        makeProfile(thieu, { ...DATA_SCIENCE_DNA.riasec }, 0.95),
        DATA_SCIENCE_DNA,
        opts
      )
    );

    const gDay = day.groups.find((g) => g.group === "ACADEMIC")!;
    const gKhuyet = khuyet.groups.find((g) => g.group === "ACADEMIC")!;

    expect(gKhuyet.coverage).toBeLessThan(gDay.coverage);
    // Điểm nhóm vẫn ~100 vì các yếu tố còn lại vẫn trùng khít
    expect(gKhuyet.score).toBeCloseTo(gDay.score as number, 6);
  });

  it("bỏ trống ô Toán KHÔNG bị chấm như Toán 0 điểm", () => {
    const base = seedStrongProfile();
    const thieu = { ...base.factors };
    delete thieu["academic.math"];

    const khuyet = ok(
      matchMajor(makeProfile(thieu, { ...DATA_SCIENCE_DNA.riasec }, 0.95), DATA_SCIENCE_DNA, opts)
    );
    const toanBang0 = ok(matchMajor(profileFrom({ "academic.math": 0 }), DATA_SCIENCE_DNA, opts));

    expect(khuyet.finalScore).toBeGreaterThan(toanBang0.finalScore + 10);
  });
});

describe("TEST CASE 04 (6.92) — critical factor dưới ngưỡng", () => {
  const r = () => ok(matchMajor(profileFrom({ "academic.math": 35 }), DATA_SCIENCE_DNA, opts));

  it("đánh dấu BELOW_THRESHOLD", () => {
    const math = r().criticalFactors.find((c) => c.factor === "academic.math")!;
    expect(math.status).toBe("BELOW_THRESHOLD");
    expect(math.severity).toBe("HIGH");
    expect(math.minimumValue).toBe(55);
  });

  it("áp phạt đúng mức cấu hình cho severity HIGH", () => {
    const math = r().criticalFactors.find((c) => c.factor === "academic.math")!;
    expect(math.penalty).toBeCloseTo(SOFT_GATE_PENALTY.HIGH, 9);
    expect(r().penalty).toBeCloseTo(SOFT_GATE_PENALTY.HIGH, 9);
  });

  it("gap tính bằng student − expected", () => {
    const math = r().criticalFactors.find((c) => c.factor === "academic.math")!;
    expect(math.gap).toBe(35 - 95);
  });

  it("đạt ngưỡng nhưng sát mép thì là NEAR_THRESHOLD, không bị phạt", () => {
    const near = ok(matchMajor(profileFrom({ "academic.math": 57 }), DATA_SCIENCE_DNA, opts));
    const math = near.criticalFactors.find((c) => c.factor === "academic.math")!;
    expect(math.status).toBe("NEAR_THRESHOLD");
    expect(math.penalty).toBe(0);
  });

  it("thiếu dữ liệu thì là MISSING và KHÔNG bị phạt — không kết luận khi chưa biết", () => {
    const base = seedStrongProfile();
    const thieu = { ...base.factors };
    delete thieu["academic.math"];
    const out = ok(
      matchMajor(makeProfile(thieu, { ...DATA_SCIENCE_DNA.riasec }, 0.95), DATA_SCIENCE_DNA, opts)
    );
    const math = out.criticalFactors.find((c) => c.factor === "academic.math")!;
    expect(math.status).toBe("MISSING");
    expect(math.penalty).toBe(0);
  });
});

describe("TEST CASE 05 (6.93) — không để điểm cao giả", () => {
  it("hồ sơ mạnh ở mọi nhóm nhưng thủng cổng học thuật thì final < raw", () => {
    const r = ok(matchMajor(profileFrom({ "academic.math": 35 }), DATA_SCIENCE_DNA, opts));
    expect(r.finalScore).toBeLessThan(r.rawScore);
    expect(r.criticalFactors.some((c) => c.status === "BELOW_THRESHOLD")).toBe(true);
  });

  it("phạt là phép nhân: final = raw × (1 − penalty)", () => {
    const r = ok(matchMajor(profileFrom({ "academic.math": 35 }), DATA_SCIENCE_DNA, opts));
    expect(r.finalScore).toBeCloseTo(r.rawScore * (1 - r.penalty), 9);
  });

  it("hai cổng cùng thủng thì phạt cộng dồn", () => {
    const r = ok(
      matchMajor(
        profileFrom({ "academic.math": 30, "ability.analytical": 20 }),
        DATA_SCIENCE_DNA,
        opts
      )
    );
    expect(r.penalty).toBeCloseTo(SOFT_GATE_PENALTY.HIGH * 2, 9);
  });

  it("phạt không bao giờ vượt trần cấu hình", () => {
    const r = ok(
      matchMajor(
        profileFrom({ "academic.math": 0, "ability.analytical": 0 }),
        DATA_SCIENCE_DNA,
        opts
      )
    );
    expect(r.penalty).toBeLessThanOrEqual(MAXIMUM_TOTAL_PENALTY);
  });
});

describe("HARD_GATE — ngành vẫn hiện ra kèm lý do", () => {
  const hardDna: MajorDna = {
    ...DATA_SCIENCE_DNA,
    criticalFactors: [
      {
        factorCode: "academic.math",
        minimumScore: 55,
        severity: "HIGH",
        gateType: "HARD_GATE",
      },
    ],
  };

  it("đánh dấu không đủ điều kiện nhưng vẫn trả về kết quả", () => {
    const r = ok(matchMajor(profileFrom({ "academic.math": 20 }), hardDna, opts));
    expect(r.eligible).toBe(false);
    expect(r.majorCode).toBe("DATA_SCIENCE");
    expect(r.criticalFactors[0].status).toBe("BELOW_THRESHOLD");
  });

  it("HARD_GATE không trừ điểm — đã loại rồi thì không phạt hai lần", () => {
    const r = ok(matchMajor(profileFrom({ "academic.math": 20 }), hardDna, opts));
    expect(r.penalty).toBe(0);
    expect(r.finalScore).toBeCloseTo(r.rawScore, 9);
  });

  it("đạt ngưỡng thì vẫn đủ điều kiện", () => {
    const r = ok(matchMajor(seedStrongProfile(), hardDna, opts));
    expect(r.eligible).toBe(true);
  });
});

describe("TEST CASE 07 (6.95) — hồ sơ chưa đủ đầy", () => {
  it("dưới ngưỡng thì từ chối, không trả điểm", () => {
    const out = matchMajor(profileFrom({}, 0.3), DATA_SCIENCE_DNA, opts);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toBe("PROFILE_INSUFFICIENT");
  });

  it("bật allowLimited thì chạy được nhưng confidence thấp", () => {
    const r = ok(matchMajor(profileFrom({}, 0.3), DATA_SCIENCE_DNA, { ...opts, allowLimited: true }));
    expect(r.confidence).toBeLessThan(0.8);
    expect(r.confidenceBreakdown.profileCompleteness).toBeCloseTo(0.3, 9);
  });
});

describe("TEST CASE 08 / 12 (6.96, 6.100) — phiên bản và chống giả mạo", () => {
  it("kết quả mang theo đủ năm dấu phiên bản", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    expect(r.versions.studentProfileVersion).toBe(1);
    expect(r.versions.majorDnaVersion).toBe(1);
    expect(r.versions.matchingConfigurationVersion).toBeGreaterThan(0);
    expect(r.versions.derivationRuleVersion).toBeGreaterThan(0);
    expect(r.versions.matchingEngineVersion).toContain("1.0.0");
  });

  it("DNA v2 tạo kết quả mới, kết quả cũ vẫn trỏ v1", () => {
    const v1 = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    const dnaV2: MajorDna = { ...DATA_SCIENCE_DNA, version: 2 };
    const v2 = ok(matchMajor(seedStrongProfile(), dnaV2, opts));

    expect(v1.versions.majorDnaVersion).toBe(1);
    expect(v2.versions.majorDnaVersion).toBe(2);
    expect(v1.inputHash).not.toBe(v2.inputHash);
  });

  it("cùng đầu vào cho cùng mã băm — tái lập được", () => {
    const a = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    const b = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    expect(a.inputHash).toBe(b.inputHash);
    expect(a.finalScore).toBeCloseTo(b.finalScore, 12);
  });

  it("máy chủ bỏ qua final_score máy khách gửi lên", () => {
    const { clean, removed } = stripClientScores({
      major_id: "DS001",
      final_score: 100,
      score: 99,
      band: "STRONG_MATCH",
      limit: 10,
    });
    expect(removed).toContain("final_score");
    expect(removed).toContain("score");
    expect(removed).toContain("band");
    expect(clean).toEqual({ major_id: "DS001", limit: 10 });
    expect("final_score" in clean).toBe(false);
  });

  it("điểm luôn do engine tính toán lại, không tin điểm giả mạo từ client", () => {
    const profile = profileFrom({ "academic.math": 35 });
    const forgedRequest = {
      ...profile,
      final_score: 100,
      score: 99,
      band: "STRONG_MATCH",
    };
    const { clean } = stripClientScores(forgedRequest);
    const r = ok(matchMajor(clean as StudentProfile, DATA_SCIENCE_DNA, opts));
    expect(r.finalScore).toBeCloseTo(r.rawScore * (1 - r.penalty), 9);
    expect(r.finalScore).not.toBe(100);
    expect(r.finalScore).not.toBe(99);
    expect(r.finalScore).toBeLessThan(85);
  });
});

describe("Trạng thái lỗi — PART 6.84", () => {
  it("DNA chưa PUBLISHED thì không chạy", () => {
    const draft: MajorDna = { ...DATA_SCIENCE_DNA, status: "DRAFT" };
    const out = matchMajor(seedStrongProfile(), draft, opts);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toBe("MAJOR_DNA_INSUFFICIENT");
  });

  it("mã yếu tố lạ bị từ chối chứ không lặng lẽ bỏ qua", () => {
    const bad: MajorDna = {
      ...DATA_SCIENCE_DNA,
      factors: {
        ...DATA_SCIENCE_DNA.factors,
        "khong.co.that": {
          factorCode: "khong.co.that",
          expectedScore: 50,
          importance: 50,
          minimumScore: null,
          requirementType: "SUPPORTING",
          direction: "POSITIVE",
          confidence: 0.5,
          explanation: "x",
        },
      },
    };
    const out = matchMajor(seedStrongProfile(), bad, opts);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toBe("INVALID_FACTOR");
  });

  it("critical factor trỏ tới yếu tố không tồn tại cũng bị từ chối", () => {
    const bad: MajorDna = {
      ...DATA_SCIENCE_DNA,
      criticalFactors: [
        { factorCode: "khong.co", minimumScore: 50, severity: "HIGH", gateType: "SOFT_GATE" },
      ],
    };
    const out = matchMajor(seedStrongProfile(), bad, opts);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toBe("INVALID_FACTOR");
  });
});

describe("Confidence — PART 6.50, 6.51", () => {
  it("bốn thành phần đúng công thức cấu hình", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    const b = r.confidenceBreakdown;
    const manual =
      0.35 * b.profileCompleteness +
      0.25 * b.groupCoverage +
      0.25 * b.majorDnaQuality +
      0.15 * b.criticalFactorCoverage;
    expect(b.matchingConfidence).toBeCloseTo(manual, 9);
    expect(r.confidence).toBeCloseTo(manual, 9);
  });

  it("confidence nằm trong 0–1", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    expect(r.confidence).toBeGreaterThan(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
  });

  it("coverage KHÔNG phải fit — hai con số khác nhau (6.40)", () => {
    const r = ok(matchMajor(profileFrom({ "academic.math": 10 }), DATA_SCIENCE_DNA, opts));
    const acad = r.groups.find((g) => g.group === "ACADEMIC")!;
    expect(acad.coverage).toBe(1);
    expect(acad.score).toBeLessThan(100);
  });

  it("nhóm RIASEC có trọng số thực nhỏ hơn trọng số gốc khi các nhóm khác đầy đủ (do bị nhân confidence)", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    const riasec = r.groups.find((g) => g.group === "RIASEC")!;
    expect(riasec.confidence).toBeCloseTo(0.82, 9);
    // Trọng số trước chuẩn hóa: 0.1 * 0.82 = 0.082. Tổng trọng số khả dụng = 0.982
    const expectedEffective = (0.1 * 0.82) / (0.9 + 0.1 * 0.82);
    expect(riasec.effectiveWeight).toBeCloseTo(expectedEffective, 6);
    expect(riasec.effectiveWeight).toBeLessThan(riasec.groupWeight);
  });
});

describe("Dải kết quả — PART 6.46, 6.47", () => {
  it("ranh giới lấy số thực, 79.99 chưa phải STRONG_MATCH", () => {
    expect(bandOf(80)).toBe("STRONG_MATCH");
    expect(bandOf(79.99)).toBe("GOOD_MATCH");
    expect(bandOf(65)).toBe("GOOD_MATCH");
    expect(bandOf(64.99)).toBe("EXPLORE");
    expect(bandOf(50)).toBe("EXPLORE");
    expect(bandOf(49.99)).toBe("LOW_MATCH");
  });

  it("không làm tròn trước khi trừ phạt (6.48)", () => {
    const r = ok(matchMajor(profileFrom({ "academic.math": 35 }), DATA_SCIENCE_DNA, opts));
    expect(Number.isInteger(r.finalScore)).toBe(false);
  });
});

describe("Nguyên liệu diễn giải — PART 6.54 → 6.57", () => {
  it("điểm mạnh xếp theo importance × similarity, không theo điểm thô", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    expect(r.strengths.length).toBeGreaterThan(0);
    expect(r.strengths.length).toBeLessThanOrEqual(5);
    for (const s of r.strengths) {
      expect(s.label).not.toBe(s.factor); // đã tra được nhãn tiếng Việt
      expect(s.reasonCode).toBeTruthy();
    }
  });

  it("yếu tố thủng ngưỡng được gắn mã BELOW_CRITICAL_THRESHOLD và đứng đầu", () => {
    const r = ok(matchMajor(profileFrom({ "academic.math": 30 }), DATA_SCIENCE_DNA, opts));
    expect(r.gaps.length).toBeGreaterThan(0);
    expect(r.gaps[0].factor).toBe("academic.math");
    expect(r.gaps[0].reasonCode).toBe("BELOW_CRITICAL_THRESHOLD");
  });

  it("hồ sơ trùng khít thì không có điểm cần củng cố nào", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    expect(r.gaps).toEqual([]);
  });

  it("mỗi dòng diễn giải đều kèm số — AI không phải tự nghĩ ra con số", () => {
    const r = ok(matchMajor(profileFrom({ "academic.math": 30 }), DATA_SCIENCE_DNA, opts));
    for (const g of r.gaps) {
      expect(typeof g.studentValue).toBe("number");
      expect(typeof g.majorExpected).toBe("number");
      expect(typeof g.gap).toBe("number");
    }
  });
});

describe("Xếp hạng — PART 6.61", () => {
  function fake(code: string, score: number, confidence: number): MatchResult {
    const base = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    return { ...base, majorCode: code, finalScore: score, confidence };
  }

  it("sắp giảm dần theo điểm cuối", () => {
    const out = rankResults([fake("B", 70, 0.9), fake("A", 80, 0.9), fake("C", 60, 0.9)]);
    expect(out.map((r) => r.majorCode)).toEqual(["A", "B", "C"]);
  });

  it("bằng điểm thì confidence cao hơn đứng trước", () => {
    const out = rankResults([fake("A", 70, 0.7), fake("B", 70, 0.95)]);
    expect(out[0].majorCode).toBe("B");
  });

  it("bằng cả điểm lẫn confidence thì xếp theo mã ngành", () => {
    const out = rankResults([fake("Z", 70, 0.9), fake("A", 70, 0.9)]);
    expect(out[0].majorCode).toBe("A");
  });

  it("cắt đúng Top N", () => {
    const out = rankResults([fake("A", 90, 0.9), fake("B", 80, 0.9), fake("C", 70, 0.9)], 2);
    expect(out).toHaveLength(2);
  });

  it("không đụng tới mảng gốc", () => {
    const input = [fake("B", 70, 0.9), fake("A", 80, 0.9)];
    rankResults(input);
    expect(input[0].majorCode).toBe("B");
  });
});

describe("TEST CASE 11 (6.99) — What-if", () => {
  const makeYeuProfile = () => profileFrom({ "academic.math": 50 });

  it("thay đổi một biến làm điểm đổi", () => {
    const yeu = makeYeuProfile();
    const out = whatIf(yeu, DATA_SCIENCE_DNA, { "academic.math": 80 }, opts);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.outcome.scenarioScore).not.toBe(out.outcome.originalScore);
    expect(out.outcome.scoreChange).toBeGreaterThan(0);
  });

  it("ghi lại biến đã đổi kèm giá trị cũ", () => {
    const yeu = makeYeuProfile();
    const out = whatIf(yeu, DATA_SCIENCE_DNA, { "academic.math": 80 }, opts);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.outcome.changedVariables).toEqual([
      { variable: "academic.math", from: 50, to: 80 },
    ]);
  });

  it("hồ sơ gốc KHÔNG bị sửa", () => {
    const yeu = makeYeuProfile();
    const truoc = yeu.factors["academic.math"];
    const out = whatIf(yeu, DATA_SCIENCE_DNA, { "academic.math": 80 }, opts);
    expect(out.ok).toBe(true);
    expect(yeu.factors["academic.math"]).toBe(truoc);
  });

  it("vượt ngưỡng cổng thì phạt biến mất", () => {
    const duoiNguong = profileFrom({ "academic.math": 30 });
    const before = ok(matchMajor(duoiNguong, DATA_SCIENCE_DNA, opts));
    const out = whatIf(duoiNguong, DATA_SCIENCE_DNA, { "academic.math": 90 }, opts);
    expect(before.penalty).toBeGreaterThan(0);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.outcome.scoreChange).toBeGreaterThan(0);
    expect(out.outcome.scenarioScore).toBeGreaterThan(out.outcome.originalScore);
  });
});

/* ------------------------------------------------------------------ */
/* Sàn trọng số — chặn điểm cao dựng từ dữ liệu quá mỏng               */
/* ------------------------------------------------------------------ */

describe("sàn trọng số nhóm", () => {
  it("chỉ còn một nhóm hợp lệ thì TỪ CHỐI chấm, không trả điểm 89/100", () => {
    // Đúng kịch bản đã phát hiện khi chạy thử: bảy câu tự chấm năng lực,
    // mọi nhóm khác thiếu dữ liệu, Ability được chuẩn hoá thành trọng số 1.
    const chiNangLuc: Record<string, number> = {};
    for (const key of Object.keys(DATA_SCIENCE_DNA.factors)) {
      if (key.startsWith("ability.") || key.startsWith("thinking.")) {
        chiNangLuc[key] = DATA_SCIENCE_DNA.factors[key].expectedScore;
      }
    }

    const out = matchMajor(
      makeProfile(chiNangLuc, { ...DATA_SCIENCE_DNA.riasec }, 0.4),
      DATA_SCIENCE_DNA,
      { ...opts, allowLimited: true }
    );

    expect(out.ok).toBe(false);
    if (!out.ok) {
      expect(out.error).toBe("PROFILE_INSUFFICIENT");
      expect(out.detail).toContain("% mô hình đủ dữ liệu");
    }
  });

  it("đủ nhóm thì chạy và báo rõ còn bao nhiêu phần mô hình dùng được", () => {
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    expect(r.usableWeightShare).toBeCloseTo(1, 9);
  });

  it("sàn tính trên trọng số GỐC, không tính trên trọng số đã chuẩn hoá", () => {
    // Sau chuẩn hoá thì tổng luôn bằng 1 dù còn mấy nhóm, nên nếu tính nhầm
    // trên đó thì sàn không bao giờ chặn được gì.
    const r = ok(matchMajor(seedStrongProfile(), DATA_SCIENCE_DNA, opts));
    const sauChuanHoa = r.groups.reduce((s, g) => s + g.effectiveWeight, 0);
    expect(sauChuanHoa).toBeCloseTo(1, 9);
    expect(r.usableWeightShare).toBeLessThanOrEqual(1);
  });

  it("allowLimited không mở được sàn này — nó bảo vệ chuyện khác", () => {
    const mong: Record<string, number> = { "ability.analytical": 90, "ability.logical": 90 };
    for (const opt of [{ ...opts }, { ...opts, allowLimited: true }]) {
      const out = matchMajor(
        makeProfile(mong, { ...DATA_SCIENCE_DNA.riasec }, 0.9),
        DATA_SCIENCE_DNA,
        opt
      );
      expect(out.ok).toBe(false);
    }
  });
});
