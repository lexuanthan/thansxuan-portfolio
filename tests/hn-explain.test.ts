import { describe, expect, it } from "vitest";
import { aiInputContract, explainResult, explainSummary } from "@/lib/huongnghiep/explain";
import { matchMajor } from "@/lib/huongnghiep/engine";
import { DATA_SCIENCE_DNA, makeProfile, seedStrongProfile } from "@/lib/huongnghiep/seed";
import type { MatchResult } from "@/lib/huongnghiep/types";

const NOW = () => "2026-01-01T00:00:00.000Z";

function run(overrides: Record<string, number> = {}, completeness = 0.95): MatchResult {
  const base = seedStrongProfile();
  const profile = makeProfile(
    { ...base.factors, ...overrides },
    { ...DATA_SCIENCE_DNA.riasec },
    completeness
  );
  const out = matchMajor(profile, DATA_SCIENCE_DNA, { now: NOW, allowLimited: true });
  if (!out.ok) throw new Error(`${out.error}: ${out.detail}`);
  return out.result;
}

function textOf(result: MatchResult): string {
  return explainResult(result)
    .map((b) => b.text)
    .join(" ");
}

describe("explainResult — tất định", () => {
  it("cùng kết quả luôn ra cùng đoạn chữ", () => {
    const r = run();
    expect(explainResult(r)).toEqual(explainResult(r));
    expect(explainSummary(r)).toBe(explainSummary(r));
  });

  it("luôn có đúng một khối mở đầu", () => {
    const blocks = explainResult(run());
    expect(blocks.filter((b) => b.kind === "HEADLINE")).toHaveLength(1);
    expect(blocks[0].kind).toBe("HEADLINE");
  });

  it("nêu tên ngành và điểm cuối", () => {
    const r = run();
    const head = explainResult(r)[0].text;
    expect(head).toContain("Khoa học dữ liệu");
    expect(head).toContain(String(Math.round(r.finalScore)));
  });

  it("nói về điểm mạnh khi có", () => {
    const blocks = explainResult(run());
    expect(blocks.some((b) => b.kind === "STRENGTH")).toBe(true);
  });
});

describe("giọng văn — PART 5.19, 6.62", () => {
  const forbidden = [
    "tốt nhất",
    "phù hợp nhất",
    "bạn nên học",
    "chắc chắn",
    "tính cách",
    "MBTI",
    "xác suất",
    "đảm bảo",
    "thành công",
  ];

  it("không dùng từ ngữ khẳng định hay phán xét", () => {
    const scenarios: Record<string, number>[] = [
      {},
      { "academic.math": 30 },
      { "ability.analytical": 20 },
    ];
    for (const scenario of scenarios) {
      const text = textOf(run(scenario)).toLowerCase();
      for (const bad of forbidden) {
        expect(text).not.toContain(bad);
      }
    }
  });

  it("nói 'mức tương thích' chứ không xếp hạng ngành", () => {
    expect(textOf(run()).toLowerCase()).toContain("mức tương thích");
  });

  it("nói 'hồ sơ hiện tại' để gắn kết quả vào một thời điểm", () => {
    expect(textOf(run()).toLowerCase()).toContain("hồ sơ hiện tại");
  });
});

describe("cổng chặn được nói kèm số", () => {
  it("dưới ngưỡng thì nêu rõ điểm hiện tại, ngưỡng và khoảng còn thiếu", () => {
    const text = textOf(run({ "academic.math": 30 }));
    expect(text).toContain("30/100");
    expect(text).toContain("55/100");
    expect(text).toContain("còn cách");
  });

  it("sát ngưỡng thì nhắc nhẹ, không báo động", () => {
    const text = textOf(run({ "academic.math": 57 }));
    expect(text).toContain("vừa đủ");
    expect(text).not.toContain("còn cách");
  });

  it("thiếu dữ liệu thì nói là chưa tính, không nói là kém", () => {
    const base = seedStrongProfile();
    const factors = { ...base.factors };
    delete factors["academic.math"];
    const profile = makeProfile(factors, { ...DATA_SCIENCE_DNA.riasec }, 0.95);
    const out = matchMajor(profile, DATA_SCIENCE_DNA, { now: NOW });
    if (!out.ok) throw new Error(out.error);

    const text = textOf(out.result);
    expect(text).toContain("chưa có dữ liệu");
    expect(text).toContain("chưa được tính");
  });

  it("HARD_GATE được nói rõ là điều kiện bắt buộc", () => {
    const hardDna = {
      ...DATA_SCIENCE_DNA,
      criticalFactors: [
        {
          factorCode: "academic.math",
          minimumScore: 55,
          severity: "HIGH" as const,
          gateType: "HARD_GATE" as const,
        },
      ],
    };
    const base = seedStrongProfile();
    const profile = makeProfile(
      { ...base.factors, "academic.math": 20 },
      { ...DATA_SCIENCE_DNA.riasec },
      0.95
    );
    const out = matchMajor(profile, hardDna, { now: NOW });
    if (!out.ok) throw new Error(out.error);

    expect(out.result.eligible).toBe(false);
    expect(textOf(out.result)).toContain("điều kiện bắt buộc");
  });
});

describe("cảnh báo dữ liệu mỏng — PART 6.52", () => {
  /**
   * Hồ sơ mỏng thật: ít yếu tố nên coverage cũng thấp theo.
   *
   * Lưu ý về công thức của tài liệu: completeness chỉ chiếm 0.35, nên một hồ
   * sơ khai 0% mà dữ liệu vẫn kín vẫn cho confidence 0.63 — trên ngưỡng 0.6.
   * Cảnh báo chỉ thật sự bật khi coverage tụt theo, và trong luồng thật thì
   * hai thứ đó đi cùng nhau.
   */
  function sparse(): MatchResult {
    // Giữ ba nhóm nặng ký (Academic, Interest, Ability) để qua được sàn trọng
    // số, nhưng mỗi nhóm chỉ điền 3/4, và hồ sơ mới khai 10%.
    const base = seedStrongProfile();
    const factors: Record<string, number> = {};
    for (const prefix of ["academic.", "interest.", "ability.", "thinking."]) {
      const keys = Object.keys(base.factors).filter((k) => k.startsWith(prefix));
      keys.slice(0, Math.ceil(keys.length * 0.75)).forEach((k) => {
        factors[k] = base.factors[k];
      });
    }
    const profile = makeProfile(factors, { ...DATA_SCIENCE_DNA.riasec }, 0.1);
    const out = matchMajor(profile, DATA_SCIENCE_DNA, { now: NOW, allowLimited: true });
    if (!out.ok) throw new Error(`${out.error}: ${out.detail}`);
    return out.result;
  }

  it("hồ sơ mỏng thì confidence xuống dưới ngưỡng và phải nói ra", () => {
    const r = sparse();
    expect(r.usableWeightShare).toBeGreaterThanOrEqual(0.5);
    expect(r.confidence).toBeLessThan(0.6);
    expect(textOf(r)).toContain("chưa đầy đủ");
  });

  it("completeness một mình không kéo nổi confidence xuống dưới ngưỡng", () => {
    // Ghi lại tính chất này của công thức để lần sau đổi trọng số thì biết
    const r = run({}, 0);
    expect(r.confidenceBreakdown.profileCompleteness).toBe(0);
    expect(r.confidence).toBeGreaterThan(0.6);
  });

  it("confidence cao thì không cảnh báo thừa", () => {
    const text = textOf(run());
    expect(text).not.toContain("chưa đầy đủ");
  });

  it("không bao giờ nói kết quả 'chính xác bao nhiêu phần trăm'", () => {
    expect(textOf(run({}, 0.2))).not.toContain("chính xác");
  });
});

describe("aiInputContract — hợp đồng với lớp AI", () => {
  it("chỉ đưa ra những gì AI được phép đọc", () => {
    const c = aiInputContract(run());
    expect(Object.keys(c).sort()).toEqual(
      ["band", "blocks", "confidence", "forbidden", "major", "score"].sort()
    );
  });

  it("không lộ câu trả lời gốc hay dữ liệu định danh", () => {
    const json = JSON.stringify(aiInputContract(run()));
    expect(json).not.toContain("profileId");
    expect(json).not.toContain("studentId");
    expect(json).not.toContain("answers");
  });

  it("kèm danh sách điều AI không được làm", () => {
    const c = aiInputContract(run());
    expect(c.forbidden.length).toBeGreaterThan(3);
    expect(c.forbidden.join(" ")).toContain("không được đổi điểm");
  });

  it("điểm đưa cho AI là số nguyên đã làm tròn, AI không tự làm tròn lấy", () => {
    const c = aiInputContract(run());
    expect(Number.isInteger(c.score)).toBe(true);
  });
});
