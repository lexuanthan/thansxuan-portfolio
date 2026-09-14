import { describe, expect, it } from "vitest";
import { COLOR_PRESETS, STATUS_COLORS, statusClassName } from "@/lib/types";

describe("COLOR_PRESETS", () => {
  it("không có giá trị trùng nhau", () => {
    const values = COLOR_PRESETS.map((c) => c.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it("mọi preset đều là cặp class gradient hợp lệ của Tailwind", () => {
    for (const c of COLOR_PRESETS) {
      expect(c.value).toMatch(/^from-[a-z]+-\d{2,3} to-[a-z]+-\d{2,3}$/);
      expect(c.label.length).toBeGreaterThan(0);
    }
  });
});

describe("statusClassName", () => {
  it("trả đúng class cho từng màu đã khai báo", () => {
    for (const s of STATUS_COLORS) {
      expect(statusClassName(s.value)).toBe(s.className);
    }
  });

  it("giá trị lạ rơi về màu xám thay vì chuỗi rỗng", () => {
    const fallback = statusClassName("mau-khong-ton-tai");
    expect(fallback).toBe("bg-gray-100 border-gray-400 text-gray-800");
    expect(statusClassName("")).toBe(fallback);
  });

  it("luôn trả về chuỗi có cả background, border và text", () => {
    for (const value of ["green", "tím", "", "blue"]) {
      const cls = statusClassName(value);
      expect(cls).toMatch(/\bbg-/);
      expect(cls).toMatch(/\bborder-/);
      expect(cls).toMatch(/\btext-/);
    }
  });
});
