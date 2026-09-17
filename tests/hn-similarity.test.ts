import { describe, expect, it } from "vitest";
import {
  coverageOf,
  factorSimilarity,
  gateAdjustment,
  groupFit,
  normalizeWeights,
  riasecCorrelation,
  riasecCosine,
  riasecCoverage,
  riasecDifferentiation,
  riasecEuclidean,
  riasecFit,
} from "@/lib/huongnghiep/similarity";

describe("factorSimilarity — PART 6.15", () => {
  it("TEST CASE 01 (6.89) — khớp hoàn toàn thì similarity = 100", () => {
    expect(factorSimilarity(90, 90)).toBe(100);
  });

  it("TEST CASE 02 (6.90) — student 30 / major 90 thì similarity = 40", () => {
    expect(factorSimilarity(30, 90)).toBe(40);
  });

  it("TEST CASE 03 (6.91) — thiếu dữ liệu thì loại khỏi phép tính, KHÔNG coi là 0", () => {
    expect(factorSimilarity(null, 90)).toBeNull();
    expect(factorSimilarity(undefined, 90)).toBeNull();
    expect(factorSimilarity(90, null)).toBeNull();
    // Phải là null chứ không phải 0 — 0 nghĩa là lệch hết cỡ, khác hẳn "chưa trả lời"
    expect(factorSimilarity(null, 90)).not.toBe(0);
  });

  it("theo đúng công thức 1 − |s − m| / 100", () => {
    expect(factorSimilarity(85, 90)).toBe(95);
    expect(factorSimilarity(100, 0)).toBe(0);
    expect(factorSimilarity(0, 0)).toBe(100);
  });

  it("đối xứng — lệch lên hay lệch xuống cùng mức thì cùng điểm", () => {
    expect(factorSimilarity(70, 80)).toBe(factorSimilarity(90, 80));
  });

  it("NEUTRAL không đóng góp điểm (5.32)", () => {
    expect(factorSimilarity(90, 90, "NEUTRAL")).toBeNull();
  });

  it("NEGATIVE lật giá trị học sinh trước khi so", () => {
    // Học sinh 20, ngành đặc trưng 80, hướng ngược → (100−20)=80 khớp 80 → 100
    expect(factorSimilarity(20, 80, "NEGATIVE")).toBe(100);
    // Học sinh 80 lật thành 20, lệch 60 so với mức đặc trưng 80 → còn 40
    expect(factorSimilarity(80, 80, "NEGATIVE")).toBe(40);
  });

  it("giá trị rác trả null thay vì ném lỗi", () => {
    expect(factorSimilarity(Number.NaN, 90)).toBeNull();
    expect(factorSimilarity(90, Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("groupFit — PART 6.18", () => {
  it("tính theo Σ(similarity × importance) / Σ(importance)", () => {
    // Ví dụ 6.19: Math 90×95, Informatics 95×80, English 100×50
    const out = groupFit([
      { similarity: 90, importance: 95 },
      { similarity: 95, importance: 80 },
      { similarity: 100, importance: 50 },
    ]);
    const expected = (90 * 95 + 95 * 80 + 100 * 50) / (95 + 80 + 50);
    expect(out).toBeCloseTo(expected, 9);
  });

  it("yếu tố importance cao kéo điểm nhóm mạnh hơn yếu tố importance thấp", () => {
    const nangKy = groupFit([
      { similarity: 40, importance: 95 },
      { similarity: 100, importance: 10 },
    ]);
    const nheKy = groupFit([
      { similarity: 40, importance: 10 },
      { similarity: 100, importance: 95 },
    ]);
    expect(nangKy).toBeLessThan(nheKy as number);
  });

  it("không có yếu tố nào tính được thì trả null, không trả 0", () => {
    expect(groupFit([])).toBeNull();
    expect(groupFit([{ similarity: 90, importance: 0 }])).toBeNull();
  });

  it("importance = 0 bị loại khỏi cả tử số lẫn mẫu số", () => {
    const a = groupFit([
      { similarity: 50, importance: 80 },
      { similarity: 100, importance: 0 },
    ]);
    expect(a).toBe(50);
  });
});

describe("coverageOf — PART 6.39, 6.40", () => {
  it("đếm theo importance chứ không đếm đầu yếu tố", () => {
    // Thiếu một yếu tố importance 95 nặng hơn thiếu ba yếu tố importance 10
    expect(coverageOf(100, 195)).toBeCloseTo(100 / 195, 9);
  });

  it("đủ dữ liệu thì bằng 1", () => {
    expect(coverageOf(180, 180)).toBe(1);
  });

  it("không có gì để đòi hỏi thì bằng 0, không chia cho 0", () => {
    expect(coverageOf(0, 0)).toBe(0);
    expect(Number.isFinite(coverageOf(10, 0))).toBe(true);
  });

  it("luôn nằm trong 0–1", () => {
    expect(coverageOf(200, 100)).toBe(1);
    expect(coverageOf(-5, 100)).toBe(0);
  });
});

describe("riasecCosine — PART 6.25, 6.26", () => {
  it("TEST CASE 06 (6.94) — hai vector giống hệt nhau thì fit ≈ 100", () => {
    const v = { R: 50, I: 80, A: 30, S: 40, E: 70, C: 60 };
    expect(riasecCosine(v, { ...v })).toBeCloseTo(100, 6);
  });

  it("cosine so hướng chứ không so độ lớn — nhân đôi cả vector vẫn ra 100", () => {
    const a = { R: 20, I: 40, A: 10, S: 20, E: 30, C: 25 };
    const b = { R: 40, I: 80, A: 20, S: 40, E: 60, C: 50 };
    expect(riasecCosine(a, b)).toBeCloseTo(100, 6);
  });

  it("hai hướng khác hẳn nhau thì điểm thấp hơn rõ rệt", () => {
    const nghienCuu = { R: 10, I: 95, A: 10, S: 10, E: 10, C: 20 };
    const xaHoi = { R: 10, I: 10, A: 20, S: 95, E: 60, C: 20 };
    const giong = riasecCosine(nghienCuu, { ...nghienCuu }) as number;
    const khac = riasecCosine(nghienCuu, xaHoi) as number;
    expect(khac).toBeLessThan(giong);
    expect(khac).toBeLessThan(60);
  });

  it("thiếu bất kỳ chiều nào ở một phía thì trả null (INSUFFICIENT)", () => {
    const full = { R: 50, I: 80, A: 30, S: 40, E: 70, C: 60 };
    expect(riasecCosine({ R: 50, I: 80 }, full)).toBeNull();
    expect(riasecCosine(full, { R: 50, I: null, A: 30, S: 40, E: 70, C: 60 })).toBeNull();
  });

  it("vector toàn 0 không có hướng để so — trả null chứ không chia cho 0", () => {
    const zero = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const full = { R: 50, I: 80, A: 30, S: 40, E: 70, C: 60 };
    expect(riasecCosine(zero, full)).toBeNull();
  });

  it("riasecCoverage đếm số chiều có ở cả hai phía", () => {
    const full = { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 };
    expect(riasecCoverage(full, full)).toBe(1);
    expect(riasecCoverage({ R: 1, I: 1, A: 1 }, full)).toBeCloseTo(0.5, 9);
  });
});

describe("gateAdjustment — PART 6.44, 6.45", () => {
  it("TEST CASE 10 (6.98) — tổng phạt 45% bị chặn ở trần 30%", () => {
    const out = gateAdjustment([0.15, 0.15, 0.1, 0.05], 0.3);
    expect(out.penalty).toBeCloseTo(0.3, 9);
    expect(out.adjustment).toBeCloseTo(0.7, 9);
  });

  it("dưới trần thì cộng bình thường", () => {
    const out = gateAdjustment([0.15, 0.08], 0.3);
    expect(out.penalty).toBeCloseTo(0.23, 9);
    expect(out.adjustment).toBeCloseTo(0.77, 9);
  });

  it("không có phạt thì hệ số bằng 1", () => {
    expect(gateAdjustment([], 0.3).adjustment).toBe(1);
    expect(gateAdjustment([0, 0], 0.3).adjustment).toBe(1);
  });

  it("cộng trước rồi mới chặn, không chặn từng cái rồi cộng", () => {
    // Chặn từng cái trước sẽ ra 0.3+0.3 = 0.6; đúng phải là 0.3
    expect(gateAdjustment([0.5, 0.5], 0.3).penalty).toBeCloseTo(0.3, 9);
  });
});

describe("normalizeWeights — PART 6.41", () => {
  it("bỏ một nhóm thì các nhóm còn lại được chuẩn hoá về tổng 1", () => {
    const out = normalizeWeights({ a: 0.2, b: 0.25, c: 0.1 });
    const sum = Object.values(out).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1, 9);
  });

  it("giữ nguyên tỉ lệ tương đối giữa các nhóm còn lại", () => {
    const out = normalizeWeights({ a: 0.2, b: 0.1 });
    expect(out.a / out.b).toBeCloseTo(2, 9);
  });

  it("không nhóm nào còn lại thì trả object rỗng, không chia cho 0", () => {
    expect(normalizeWeights({})).toEqual({});
    expect(normalizeWeights({ a: 0 })).toEqual({});
  });
});

/* ------------------------------------------------------------------ */
/* Ba cách đo RIASEC — chọn theo bằng chứng, không theo mặc định       */
/* ------------------------------------------------------------------ */

describe("so sánh ba cách đo RIASEC", () => {
  const kyThuat = { R: 85, I: 70, A: 30, S: 35, E: 40, C: 60 };
  const xaHoi = { R: 25, I: 40, A: 55, S: 90, E: 70, C: 40 };
  const nganhCoKhi = { R: 92, I: 70, A: 30, S: 25, E: 40, C: 60 };
  const deuTay = { R: 40, I: 42, A: 38, S: 41, E: 39, C: 40 };

  it("cả ba đều cho điểm cao khi hồ sơ trùng khít ngành", () => {
    for (const fn of [riasecCosine, riasecEuclidean, riasecCorrelation]) {
      expect(fn(kyThuat, nganhCoKhi) as number).toBeGreaterThan(75);
    }
  });

  it("cosine gần như không phân biệt được hồ sơ lệch hẳn nhau", () => {
    const hop = riasecCosine(kyThuat, nganhCoKhi) as number;
    const lech = riasecCosine(xaHoi, nganhCoKhi) as number;
    // Lệch hoàn toàn mà vẫn trên 70 điểm — đó là vấn đề
    expect(lech).toBeGreaterThan(65);
    expect(hop - lech).toBeLessThan(35);
  });

  it("tương quan hồ sơ phân biệt rõ hơn hẳn", () => {
    const hop = riasecCorrelation(kyThuat, nganhCoKhi) as number;
    const lech = riasecCorrelation(xaHoi, nganhCoKhi) as number;
    expect(lech).toBeLessThan(25);
    expect(hop - lech).toBeGreaterThan(70);
  });

  it("cosine cho hồ sơ 'đều tay' điểm cao với mọi ngành — lý do phải bỏ nó", () => {
    expect(riasecCosine(deuTay, nganhCoKhi) as number).toBeGreaterThan(85);
    expect(riasecCosine(deuTay, { R: 30, I: 35, A: 60, S: 95, E: 45, C: 50 }) as number)
      .toBeGreaterThan(85);
  });

  it("euclid giữ được độ lớn: hứng thú cao đều khác hứng thú thấp đều", () => {
    const thap = { R: 40, I: 42, A: 38, S: 41, E: 39, C: 40 };
    const cao = { R: 80, I: 82, A: 78, S: 81, E: 79, C: 80 };
    expect(riasecEuclidean(thap, nganhCoKhi)).not.toBe(riasecEuclidean(cao, nganhCoKhi));
  });

  it("tương quan bỏ qua độ lớn — đó chính là điểm yếu cần cổng phân hoá chặn", () => {
    const thap = { R: 40, I: 42, A: 38, S: 41, E: 39, C: 40 };
    const cao = { R: 80, I: 82, A: 78, S: 81, E: 79, C: 80 };
    expect(riasecCorrelation(thap, nganhCoKhi)).toBeCloseTo(
      riasecCorrelation(cao, nganhCoKhi) as number,
      6
    );
  });

  it("riasecFit chọn đúng cách đo theo cấu hình", () => {
    expect(riasecFit(kyThuat, nganhCoKhi, "COSINE")).toBe(riasecCosine(kyThuat, nganhCoKhi));
    expect(riasecFit(kyThuat, nganhCoKhi, "EUCLIDEAN")).toBe(riasecEuclidean(kyThuat, nganhCoKhi));
    expect(riasecFit(kyThuat, nganhCoKhi, "CORRELATION")).toBe(
      riasecCorrelation(kyThuat, nganhCoKhi)
    );
  });

  it("thiếu chiều thì cả ba cùng trả null", () => {
    for (const fn of [riasecCosine, riasecEuclidean, riasecCorrelation]) {
      expect(fn({ R: 50, I: 80 }, nganhCoKhi)).toBeNull();
    }
  });
});

describe("riasecDifferentiation — khái niệm của chính lý thuyết Holland", () => {
  it("hồ sơ có kiểu rõ cho độ lệch lớn", () => {
    expect(riasecDifferentiation({ R: 85, I: 70, A: 30, S: 35, E: 40, C: 60 }))
      .toBeGreaterThan(15);
  });

  it("hồ sơ phẳng cho độ lệch gần 0", () => {
    expect(riasecDifferentiation({ R: 40, I: 42, A: 38, S: 41, E: 39, C: 40 }))
      .toBeLessThan(3);
  });

  it("không phụ thuộc mức cao thấp chung — chỉ đo độ trải", () => {
    const thap = riasecDifferentiation({ R: 20, I: 60, A: 20, S: 20, E: 20, C: 20 });
    const cao = riasecDifferentiation({ R: 50, I: 90, A: 50, S: 50, E: 50, C: 50 });
    expect(thap).toBeCloseTo(cao, 9);
  });

  it("dữ liệu rỗng hoặc một chiều thì trả 0, không ném lỗi", () => {
    expect(riasecDifferentiation({})).toBe(0);
    expect(riasecDifferentiation({ R: 50 })).toBe(0);
  });
});
