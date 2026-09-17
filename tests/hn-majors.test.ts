import { describe, expect, it } from "vitest";
import { DEV_MAJORS, dnaCoveredWeight, unusableMajors } from "@/lib/huongnghiep/majors";
import { DATA_SCIENCE_DNA, makeProfile, seedStrongProfile } from "@/lib/huongnghiep/seed";
import { matchMajors } from "@/lib/huongnghiep/engine";
import { FACTOR_BY_ID } from "@/lib/huongnghiep/config";
import { RIASEC_KEYS } from "@/lib/huongnghiep/types";

const NOW = () => "2026-01-01T00:00:00.000Z";
const ALL = [DATA_SCIENCE_DNA, ...DEV_MAJORS];

describe("kho ngành phát triển", () => {
  it("có đủ số ngành để bảng kết quả nói lên điều gì đó", () => {
    expect(ALL.length).toBeGreaterThanOrEqual(8);
  });

  it("mã ngành và mã định danh không trùng nhau", () => {
    expect(new Set(ALL.map((m) => m.majorCode)).size).toBe(ALL.length);
    expect(new Set(ALL.map((m) => m.majorId)).size).toBe(ALL.length);
  });

  it("mọi mã yếu tố đều có trong danh mục — sai một chữ là engine từ chối cả ngành", () => {
    for (const m of ALL) {
      for (const code of Object.keys(m.factors)) {
        expect(FACTOR_BY_ID.has(code)).toBe(true);
      }
      for (const c of m.criticalFactors) {
        expect(FACTOR_BY_ID.has(c.factorCode)).toBe(true);
      }
    }
  });

  it("mọi giá trị nằm trong thang 0–100 và minimum ≤ expected (DNA-V04)", () => {
    for (const m of ALL) {
      for (const f of Object.values(m.factors)) {
        expect(f.expectedScore).toBeGreaterThanOrEqual(0);
        expect(f.expectedScore).toBeLessThanOrEqual(100);
        expect(f.importance).toBeGreaterThanOrEqual(0);
        expect(f.importance).toBeLessThanOrEqual(100);
        if (f.minimumScore !== null) {
          expect(f.minimumScore).toBeLessThanOrEqual(f.expectedScore);
        }
      }
    }
  });

  it("mọi ngành có đủ sáu chiều RIASEC (DNA-V05)", () => {
    for (const m of ALL) {
      for (const k of RIASEC_KEYS) expect(typeof m.riasec[k]).toBe("number");
    }
  });

  it("critical factor nào cũng phải được khai trong DNA của chính ngành đó", () => {
    for (const m of ALL) {
      for (const c of m.criticalFactors) {
        expect(c.factorCode in m.factors).toBe(true);
      }
    }
  });

  it("dữ liệu phát triển phải gắn đúng nguồn Level 5", () => {
    for (const m of DEV_MAJORS) {
      expect(m.provenance.sourceType).toBe("DEVELOPMENT_ASSUMPTION");
      // dnaQuality chiếm 25% công thức confidence nên nó phải kéo độ tin xuống
      expect(m.dnaQuality).toBeLessThan(0.7);
    }
  });

  it("V1.0 không dùng HARD_GATE trên dữ liệu phát triển (5.28, 6.31)", () => {
    for (const m of DEV_MAJORS) {
      for (const c of m.criticalFactors) expect(c.gateType).toBe("SOFT_GATE");
    }
  });
});

describe("đủ điều kiện dùng trong so khớp — PART 5.59", () => {
  it("mọi ngành đều khai đủ nhóm nặng ký để engine chấm được", () => {
    expect(unusableMajors(ALL)).toEqual([]);
    for (const m of ALL) expect(dnaCoveredWeight(m)).toBeGreaterThanOrEqual(0.5);
  });

  it("phát hiện được ngành khai thiếu", () => {
    const thieu = {
      ...DEV_MAJORS[0],
      majorCode: "THIEU",
      factors: { "environment.office": DEV_MAJORS[0].factors["environment.office"] ?? Object.values(DEV_MAJORS[0].factors)[0] },
      riasec: {},
    };
    expect(dnaCoveredWeight(thieu)).toBeLessThan(0.5);
  });
});

describe("matchMajors — PART 6.73", () => {
  it("xếp hạng giảm dần theo điểm cuối", () => {
    const { ranked } = matchMajors(seedStrongProfile(), ALL, 10, { now: NOW });
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].finalScore).toBeGreaterThanOrEqual(ranked[i].finalScore);
    }
  });

  it("cắt đúng Top N", () => {
    expect(matchMajors(seedStrongProfile(), ALL, 3, { now: NOW }).ranked).toHaveLength(3);
  });

  it("hồ sơ dựng theo DNA Khoa học dữ liệu thì ngành đó đứng đầu", () => {
    const { ranked } = matchMajors(seedStrongProfile(), ALL, 10, { now: NOW });
    expect(ranked[0].majorCode).toBe("DATA_SCIENCE");
  });

  it("ngành bị từ chối được báo kèm lý do, không bị giấu đi", () => {
    const mong = makeProfile(
      { "ability.analytical": 90, "ability.logical": 90 },
      { ...DATA_SCIENCE_DNA.riasec },
      0.9
    );
    const { ranked, skipped } = matchMajors(mong, ALL, 10, { now: NOW });
    expect(ranked).toHaveLength(0);
    expect(skipped).toHaveLength(ALL.length);
    for (const s of skipped) {
      expect(s.majorName.length).toBeGreaterThan(0);
      expect(s.detail.length).toBeGreaterThan(0);
    }
  });

  it("điểm các ngành khác nhau — nếu bằng hết thì mô hình không phân biệt được gì", () => {
    const { ranked } = matchMajors(seedStrongProfile(), ALL, 10, { now: NOW });
    const scores = ranked.map((r) => Math.round(r.finalScore));
    expect(new Set(scores).size).toBeGreaterThan(3);
    expect(ranked[0].finalScore - ranked[ranked.length - 1].finalScore).toBeGreaterThan(10);
  });
});
