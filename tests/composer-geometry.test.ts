import { describe, expect, it } from "vitest";
import {
  angleFromPointer,
  clamp,
  clamp01,
  createId,
  fitContain,
  fitCover,
  normalizeAngle,
  scaleFromPointer,
  snapAngle,
  snapToCenter,
  toRelative,
  wrapText,
} from "@/lib/composer/geometry";

const RECT = { left: 100, top: 50, width: 800, height: 400 };

describe("clamp", () => {
  it("giữ giá trị trong khoảng", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it("NaN rơi về giá trị nhỏ nhất thay vì lan ra cả bố cục", () => {
    expect(clamp(Number.NaN, 2, 10)).toBe(2);
  });

  it("clamp01 giới hạn 0..1", () => {
    expect(clamp01(1.7)).toBe(1);
    expect(clamp01(-0.4)).toBe(0);
  });
});

describe("toRelative", () => {
  it("đổi toạ độ chuột sang tỉ lệ trong khung", () => {
    expect(toRelative(100, 50, RECT)).toEqual({ x: 0, y: 0 });
    expect(toRelative(900, 450, RECT)).toEqual({ x: 1, y: 1 });
    expect(toRelative(500, 250, RECT)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("khung rỗng không gây chia cho 0", () => {
    expect(toRelative(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual({
      x: 0,
      y: 0,
    });
  });
});

describe("scaleFromPointer", () => {
  const center = { x: 0.5, y: 0.5 };

  it("kéo ra xa gấp đôi thì kích thước gấp đôi", () => {
    const next = scaleFromPointer({
      center,
      startPointer: { x: 0.6, y: 0.5 },
      pointer: { x: 0.7, y: 0.5 },
      startWidth: 0.2,
      rect: RECT,
    });
    expect(next).toBeCloseTo(0.4, 5);
  });

  it("kéo vào gần thì nhỏ lại", () => {
    const next = scaleFromPointer({
      center,
      startPointer: { x: 0.7, y: 0.5 },
      pointer: { x: 0.6, y: 0.5 },
      startWidth: 0.4,
      rect: RECT,
    });
    expect(next).toBeCloseTo(0.2, 5);
  });

  it("không cho nhỏ quá mức hoặc lớn vô hạn", () => {
    const tiny = scaleFromPointer({
      center,
      startPointer: { x: 0.9, y: 0.5 },
      pointer: { x: 0.5, y: 0.5 },
      startWidth: 0.3,
      rect: RECT,
    });
    expect(tiny).toBeGreaterThanOrEqual(0.02);

    const huge = scaleFromPointer({
      center,
      startPointer: { x: 0.51, y: 0.5 },
      pointer: { x: 5, y: 0.5 },
      startWidth: 1,
      rect: RECT,
    });
    expect(huge).toBeLessThanOrEqual(4);
  });

  it("bấm ngay tâm không làm kích thước nhảy loạn", () => {
    const next = scaleFromPointer({
      center,
      startPointer: { x: 0.5, y: 0.5 },
      pointer: { x: 0.9, y: 0.9 },
      startWidth: 0.25,
      rect: RECT,
    });
    expect(next).toBe(0.25);
  });
});

describe("góc xoay", () => {
  const center = { x: 0.5, y: 0.5 };

  it("0 độ là hướng thẳng lên", () => {
    // Khung cao 400px, rộng 800px — đi lên 0.25 tỉ lệ = 100px
    const deg = angleFromPointer(center, { x: 0.5, y: 0.25 }, RECT);
    expect(deg).toBeCloseTo(0, 5);
  });

  it("kéo sang phải là 90 độ", () => {
    const deg = angleFromPointer(center, { x: 0.75, y: 0.5 }, RECT);
    expect(deg).toBeCloseTo(90, 5);
  });

  it("normalizeAngle đưa về 0..360", () => {
    expect(normalizeAngle(-90)).toBe(270);
    expect(normalizeAngle(450)).toBe(90);
    expect(normalizeAngle(360)).toBe(0);
  });

  it("snapAngle hút về bội số 15 khi đủ gần", () => {
    expect(snapAngle(43)).toBe(45);
    expect(snapAngle(90.5)).toBe(90);
  });

  it("snapAngle giữ nguyên khi ở xa mốc", () => {
    expect(snapAngle(52)).toBeCloseTo(52, 5);
  });
});

describe("snapToCenter", () => {
  it("hút về 0.5 khi kéo gần đường giữa", () => {
    expect(snapToCenter(0.505)).toEqual({ value: 0.5, snapped: true });
  });

  it("giữ nguyên khi ở xa", () => {
    expect(snapToCenter(0.6)).toEqual({ value: 0.6, snapped: false });
  });
});

describe("fitCover / fitContain", () => {
  it("cover phủ kín khung, có thể tràn", () => {
    const r = fitCover(2, 1000, 1000);
    expect(r.height).toBe(1000);
    expect(r.width).toBe(2000);
  });

  it("contain nằm trọn trong khung", () => {
    const r = fitContain(2, 1000, 1000);
    expect(r.width).toBe(1000);
    expect(r.height).toBe(500);
  });

  it("ảnh cùng tỉ lệ với khung thì hai cách cho kết quả như nhau", () => {
    expect(fitCover(1.5, 1200, 800)).toEqual(fitContain(1.5, 1200, 800));
  });
});

describe("wrapText", () => {
  // Giả lập: mỗi ký tự rộng 10px
  const measure = (s: string) => s.length * 10;

  it("ngắt dòng theo bề rộng tối đa", () => {
    expect(wrapText("aaa bbb ccc", 70, measure)).toEqual(["aaa bbb", "ccc"]);
  });

  it("giữ nguyên dấu xuống dòng người dùng gõ", () => {
    expect(wrapText("dòng một\ndòng hai", 1000, measure)).toEqual([
      "dòng một",
      "dòng hai",
    ]);
  });

  it("giữ dòng trống giữa hai đoạn", () => {
    expect(wrapText("a\n\nb", 1000, measure)).toEqual(["a", "", "b"]);
  });

  it("từ dài hơn cả dòng vẫn được xuống dòng riêng thay vì mất", () => {
    const lines = wrapText("x sieuuuudaiiii y", 50, measure);
    expect(lines).toContain("sieuuuudaiiii");
    expect(lines.join(" ")).toContain("y");
  });

  it("chuỗi rỗng trả về một dòng rỗng", () => {
    expect(wrapText("", 100, measure)).toEqual([""]);
  });

  it("gộp khoảng trắng thừa", () => {
    expect(wrapText("a    b", 1000, measure)).toEqual(["a b"]);
  });
});

describe("createId", () => {
  it("không trùng nhau", () => {
    const ids = new Set(Array.from({ length: 200 }, () => createId()));
    expect(ids.size).toBe(200);
  });

  it("dùng tiền tố được truyền vào", () => {
    expect(createId("img")).toMatch(/^img_/);
  });
});
