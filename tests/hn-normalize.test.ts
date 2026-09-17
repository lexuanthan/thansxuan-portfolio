import { describe, expect, it } from "vitest";
import {
  canonicalJson,
  clampScore,
  computeCompleteness,
  emptyRiasec,
  hollandCode,
  isMissing,
  normalizeAcademicScore,
  normalizeLikert,
  normalizeLikertReversed,
  normalizeRiasec,
  rescale,
  stableHash,
  toNumber,
} from "@/lib/huongnghiep/normalize";

describe("isMissing — phân biệt 'chưa trả lời' với 'trả lời bằng 0'", () => {
  it("coi null, undefined và chuỗi rỗng là thiếu", () => {
    expect(isMissing(null)).toBe(true);
    expect(isMissing(undefined)).toBe(true);
    expect(isMissing("")).toBe(true);
    expect(isMissing("   ")).toBe(true);
    expect(isMissing(Number.NaN)).toBe(true);
    expect(isMissing(Number.POSITIVE_INFINITY)).toBe(true);
  });

  it("KHÔNG coi số 0 là thiếu — đây là cả một câu trả lời", () => {
    expect(isMissing(0)).toBe(false);
    expect(isMissing("0")).toBe(false);
    expect(isMissing(false)).toBe(false);
  });
});

describe("toNumber — không lặp lại cái bẫy Number(null) === 0", () => {
  it("dữ liệu thiếu trả null chứ không trả 0", () => {
    expect(toNumber(null)).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber("")).toBeNull();
    expect(toNumber("  ")).toBeNull();
    expect(toNumber([])).toBeNull();
    expect(toNumber({})).toBeNull();
    expect(toNumber(true)).toBeNull();
  });

  it("đọc được số thật và chuỗi số", () => {
    expect(toNumber(7)).toBe(7);
    expect(toNumber(0)).toBe(0);
    expect(toNumber("8.5")).toBe(8.5);
    expect(toNumber(" 9 ")).toBe(9);
  });

  it("chấp nhận dấu phẩy thập phân kiểu Việt Nam", () => {
    expect(toNumber("8,5")).toBe(8.5);
  });

  it("chuỗi không phải số trả null", () => {
    expect(toNumber("giỏi")).toBeNull();
    expect(toNumber("8 điểm")).toBeNull();
  });
});

describe("rescale", () => {
  it("quy về 0–100 theo hai đầu thang", () => {
    expect(rescale(5, 0, 10)).toBe(50);
    expect(rescale(0, 0, 10)).toBe(0);
    expect(rescale(10, 0, 10)).toBe(100);
  });

  it("thang khai sai trả null thay vì chia cho 0", () => {
    expect(rescale(5, 10, 10)).toBeNull();
    expect(rescale(5, 10, 0)).toBeNull();
  });

  it("thiếu dữ liệu trả null", () => {
    expect(rescale(null, 0, 10)).toBeNull();
  });
});

describe("clampScore", () => {
  it("ép về đúng khoảng", () => {
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(140)).toBe(100);
    expect(clampScore(63)).toBe(63);
  });
});

describe("normalizeAcademicScore", () => {
  it("quy thang 10 về thang 100", () => {
    expect(normalizeAcademicScore(8, "TEN")).toBe(80);
    expect(normalizeAcademicScore("6,5", "TEN")).toBe(65);
  });

  it("giữ nguyên thang 100", () => {
    expect(normalizeAcademicScore(72, "HUNDRED")).toBe(72);
  });

  it("quy GPA 4.0", () => {
    expect(normalizeAcademicScore(3.2, "GPA4")).toBeCloseTo(80, 6);
  });

  it("điểm 0 là điểm thật, không phải dữ liệu thiếu", () => {
    expect(normalizeAcademicScore(0, "TEN")).toBe(0);
  });

  it("điểm ngoài thang trả null để lộ lỗi nhập liệu thay vì làm tròn", () => {
    expect(normalizeAcademicScore(12, "TEN")).toBeNull();
    expect(normalizeAcademicScore(-1, "TEN")).toBeNull();
    expect(normalizeAcademicScore(4.5, "GPA4")).toBeNull();
  });

  it("đọc điểm chữ, không phân biệt hoa thường", () => {
    expect(normalizeAcademicScore("A", "LETTER")).toBe(92);
    expect(normalizeAcademicScore("b+", "LETTER")).toBe(84);
    expect(normalizeAcademicScore(" F ", "LETTER")).toBe(20);
  });

  it("điểm chữ lạ trả null", () => {
    expect(normalizeAcademicScore("G", "LETTER")).toBeNull();
    expect(normalizeAcademicScore(8, "LETTER")).toBeNull();
  });
});

describe("normalizeLikert", () => {
  it("thang 1–5 trải đủ từ 0 tới 100", () => {
    expect(normalizeLikert(1)).toBe(0);
    expect(normalizeLikert(3)).toBe(50);
    expect(normalizeLikert(5)).toBe(100);
  });

  it("mức thấp nhất phải ra 0 — chia cho 5 thì nó ra 20 và không ai chạm được đáy", () => {
    expect(normalizeLikert(1)).not.toBe(20);
  });

  it("câu trả lời ngoài thang trả null", () => {
    expect(normalizeLikert(0)).toBeNull();
    expect(normalizeLikert(6)).toBeNull();
  });

  it("câu đảo chiều được lật lại", () => {
    expect(normalizeLikertReversed(1)).toBe(100);
    expect(normalizeLikertReversed(5)).toBe(0);
    expect(normalizeLikertReversed(3)).toBe(50);
  });

  it("thiếu dữ liệu trả null ở cả hai chiều", () => {
    expect(normalizeLikert(null)).toBeNull();
    expect(normalizeLikertReversed(null)).toBeNull();
  });
});

describe("normalizeRiasec", () => {
  it("quy sáu chiều theo điểm tối đa có thể đạt", () => {
    const { vector, missing } = normalizeRiasec(
      { R: 20, I: 10, A: 0, S: 5, E: 15, C: 20 },
      20
    );
    expect(vector.R).toBe(100);
    expect(vector.I).toBe(50);
    expect(vector.A).toBe(0);
    expect(missing).toEqual([]);
  });

  it("không chia theo chiều cao nhất của bản thân — hồ sơ mờ nhạt phải nhìn ra là mờ nhạt", () => {
    const nhat = normalizeRiasec({ R: 4, I: 3, A: 2, S: 2, E: 3, C: 2 }, 20).vector;
    const dam = normalizeRiasec({ R: 20, I: 15, A: 10, S: 10, E: 15, C: 10 }, 20).vector;
    expect(nhat.R).toBe(20);
    expect(dam.R).toBe(100);
    expect(nhat.R).not.toBe(dam.R);
  });

  it("chiều thiếu dữ liệu được ghi tên lại chứ không lặng lẽ thành 0", () => {
    const { vector, missing } = normalizeRiasec({ R: 10, I: null, A: "" }, 20);
    expect(vector.I).toBe(0);
    expect(missing).toContain("I");
    expect(missing).toContain("A");
    expect(missing).toContain("S");
    expect(missing).not.toContain("R");
  });

  it("điểm tối đa bằng 0 thì coi như thiếu hết, không chia cho 0", () => {
    const { missing } = normalizeRiasec({ R: 5 }, 0);
    expect(missing).toHaveLength(6);
  });
});

describe("hollandCode", () => {
  it("lấy ba chiều trội xếp giảm dần", () => {
    expect(hollandCode({ R: 90, I: 80, A: 70, S: 10, E: 20, C: 30 })).toBe("RIA");
  });

  it("vector rỗng vẫn trả ra chuỗi ba ký tự chứ không ném lỗi", () => {
    expect(hollandCode(emptyRiasec())).toHaveLength(3);
  });
});

describe("computeCompleteness", () => {
  it("đếm đúng phần đã khai và phần còn trống", () => {
    const out = computeCompleteness(
      { a: 5, b: null, c: "", d: 0 },
      ["a", "b", "c", "d"]
    );
    expect(out.answered).toBe(2);
    expect(out.required).toBe(4);
    expect(out.value).toBe(0.5);
    expect(out.missing).toEqual(["b", "c"]);
  });

  it("câu trả lời bằng 0 vẫn được tính là đã khai", () => {
    const out = computeCompleteness({ a: 0 }, ["a"]);
    expect(out.value).toBe(1);
    expect(out.missing).toEqual([]);
  });

  it("không có câu bắt buộc nào thì trả 0 chứ không chia cho 0", () => {
    const out = computeCompleteness({}, []);
    expect(out.value).toBe(0);
    expect(Number.isFinite(out.value)).toBe(true);
  });
});

describe("canonicalJson & stableHash — để tái lập được kết quả cũ", () => {
  it("thứ tự khoá không làm đổi chuỗi", () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }));
  });

  it("thứ tự phần tử trong mảng thì có làm đổi — mảng vốn có thứ tự", () => {
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));
  });

  it("cùng nội dung ra cùng mã băm", () => {
    const a = { riasec: { R: 80, I: 60 }, factors: { "apt.math": 70 } };
    const b = { factors: { "apt.math": 70 }, riasec: { I: 60, R: 80 } };
    expect(stableHash(a)).toBe(stableHash(b));
  });

  it("đổi một con số là đổi mã băm", () => {
    expect(stableHash({ x: 70 })).not.toBe(stableHash({ x: 71 }));
  });

  it("mã băm luôn đủ tám ký tự hex", () => {
    for (const v of [null, 0, "", { a: 1 }, [1, 2, 3]]) {
      expect(stableHash(v)).toMatch(/^[0-9a-f]{8}$/);
    }
  });

  it("lồng sâu và giá trị undefined không làm sập", () => {
    expect(() =>
      stableHash({ a: { b: { c: [1, { d: undefined, e: null }] } } })
    ).not.toThrow();
  });
});
