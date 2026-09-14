import { describe, expect, it } from "vitest";
import {
  DEFAULT_STEPS,
  FREE_NEURONS_PER_DAY,
  MAX_PROMPT_LENGTH,
  MAX_STEPS,
  MIN_STEPS,
  estimateFreeImagesPerDay,
  estimateNeurons,
  normalizePrompt,
  normalizeSteps,
} from "@/lib/ai/prompt";

describe("normalizePrompt", () => {
  it("cắt khoảng trắng thừa và gộp nhiều dấu cách", () => {
    expect(normalizePrompt("  sinh viên   tình   nguyện  ")).toBe(
      "sinh viên tình nguyện"
    );
  });

  it("gộp cả xuống dòng thành một dấu cách", () => {
    expect(normalizePrompt("dòng một\n\ndòng hai")).toBe("dòng một dòng hai");
  });

  it("chặn độ dài theo giới hạn của model", () => {
    const long = "a".repeat(MAX_PROMPT_LENGTH + 500);
    expect(normalizePrompt(long)).toHaveLength(MAX_PROMPT_LENGTH);
  });

  it("dữ liệu không phải chuỗi trả về rỗng thay vì làm sập route", () => {
    expect(normalizePrompt(null)).toBe("");
    expect(normalizePrompt(undefined)).toBe("");
    expect(normalizePrompt(123)).toBe("");
    expect(normalizePrompt({ prompt: "hack" })).toBe("");
    expect(normalizePrompt([])).toBe("");
  });

  it("giữ nguyên tiếng Việt có dấu", () => {
    expect(normalizePrompt("Trường Đại học Sư phạm Kỹ thuật")).toBe(
      "Trường Đại học Sư phạm Kỹ thuật"
    );
  });
});

describe("normalizeSteps", () => {
  it("giữ giá trị hợp lệ", () => {
    expect(normalizeSteps(4)).toBe(4);
    expect(normalizeSteps(8)).toBe(8);
    expect(normalizeSteps(1)).toBe(1);
  });

  it("kẹp về khoảng model cho phép", () => {
    expect(normalizeSteps(99)).toBe(MAX_STEPS);
    expect(normalizeSteps(0)).toBe(MIN_STEPS);
    expect(normalizeSteps(-5)).toBe(MIN_STEPS);
  });

  it("làm tròn số lẻ", () => {
    expect(normalizeSteps(4.6)).toBe(5);
    expect(normalizeSteps("3")).toBe(3);
  });

  it("giá trị vô nghĩa rơi về mặc định", () => {
    expect(normalizeSteps("abc")).toBe(DEFAULT_STEPS);
    expect(normalizeSteps(null)).toBe(DEFAULT_STEPS);
    expect(normalizeSteps(undefined)).toBe(DEFAULT_STEPS);
    expect(normalizeSteps(Number.NaN)).toBe(DEFAULT_STEPS);
    expect(normalizeSteps(Infinity)).toBe(DEFAULT_STEPS);
  });
});

describe("estimateNeurons", () => {
  it("tính đúng theo đơn giá Cloudflare cho ảnh 1024×1024", () => {
    // 4 ô × 4,8 + 4 bước × 9,6 = 19,2 + 38,4 = 57,6
    expect(estimateNeurons(4)).toBeCloseTo(57.6, 5);
  });

  it("nhiều bước hơn thì tốn hơn", () => {
    expect(estimateNeurons(8)).toBeGreaterThan(estimateNeurons(4));
  });

  it("số bước vô nghĩa vẫn cho ra con số dùng được", () => {
    expect(estimateNeurons(Number.NaN)).toBeCloseTo(57.6, 5);
  });
});

describe("estimateFreeImagesPerDay", () => {
  it("ước lượng khớp hạn mức miễn phí", () => {
    // 10000 / 57,6 ≈ 173
    expect(estimateFreeImagesPerDay(4)).toBe(173);
  });

  it("không bao giờ vượt quá hạn mức thật", () => {
    for (const steps of [1, 2, 4, 8]) {
      const n = estimateFreeImagesPerDay(steps);
      expect(n * estimateNeurons(steps)).toBeLessThanOrEqual(FREE_NEURONS_PER_DAY);
    }
  });

  it("bước càng nhiều thì số ảnh miễn phí càng ít", () => {
    expect(estimateFreeImagesPerDay(8)).toBeLessThan(estimateFreeImagesPerDay(1));
  });
});
