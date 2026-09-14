import { describe, expect, it } from "vitest";
import {
  FALLBACK_ABOUT,
  FALLBACK_AI_TOOLS,
  FALLBACK_PROJECTS,
  FALLBACK_SETTINGS,
} from "@/lib/fallback";
import { COLOR_PRESETS, STATUS_COLORS } from "@/lib/types";

/**
 * Dữ liệu dự phòng là thứ website hiển thị khi Supabase lỗi.
 * Nếu nó sai cấu trúc thì trang public sẽ vỡ đúng vào lúc tệ nhất.
 */

describe("FALLBACK_PROJECTS", () => {
  it("có đủ 6 project và id không trùng", () => {
    expect(FALLBACK_PROJECTS).toHaveLength(6);
    const ids = FALLBACK_PROJECTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mọi project đều published và có tiêu đề, mô tả", () => {
    for (const p of FALLBACK_PROJECTS) {
      expect(p.published).toBe(true);
      expect(p.title.trim().length).toBeGreaterThan(0);
      expect((p.description ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  it("tags luôn là mảng — trang Portfolio gọi .map trên nó", () => {
    for (const p of FALLBACK_PROJECTS) {
      expect(Array.isArray(p.tags)).toBe(true);
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });

  it("màu card nằm trong danh sách preset để Tailwind sinh được class", () => {
    const allowed = new Set(COLOR_PRESETS.map((c) => c.value));
    for (const p of FALLBACK_PROJECTS) {
      expect(allowed.has(p.color)).toBe(true);
    }
  });
});

describe("FALLBACK_AI_TOOLS", () => {
  it("có đủ 6 tool, đều published", () => {
    expect(FALLBACK_AI_TOOLS).toHaveLength(6);
    for (const t of FALLBACK_AI_TOOLS) {
      expect(t.published).toBe(true);
      expect(t.icon.length).toBeGreaterThan(0);
    }
  });

  it("status_color nằm trong danh sách đã khai báo", () => {
    const allowed = new Set(STATUS_COLORS.map((s) => s.value));
    for (const t of FALLBACK_AI_TOOLS) {
      expect(allowed.has(t.status_color)).toBe(true);
    }
  });

  it("màu card nằm trong danh sách preset", () => {
    const allowed = new Set(COLOR_PRESETS.map((c) => c.value));
    for (const t of FALLBACK_AI_TOOLS) {
      expect(allowed.has(t.color)).toBe(true);
    }
  });
});

describe("FALLBACK_ABOUT", () => {
  it("skills, journey, core_values đều là mảng không rỗng", () => {
    expect(Array.isArray(FALLBACK_ABOUT.skills)).toBe(true);
    expect(Array.isArray(FALLBACK_ABOUT.journey)).toBe(true);
    expect(Array.isArray(FALLBACK_ABOUT.core_values)).toBe(true);
    expect(FALLBACK_ABOUT.skills.length).toBeGreaterThan(0);
    expect(FALLBACK_ABOUT.journey.length).toBeGreaterThan(0);
    expect(FALLBACK_ABOUT.core_values.length).toBeGreaterThan(0);
  });

  it("mỗi nhóm skill có items là mảng", () => {
    for (const g of FALLBACK_ABOUT.skills) {
      expect(Array.isArray(g.items)).toBe(true);
      expect(g.category.trim().length).toBeGreaterThan(0);
    }
  });

  it("mỗi mốc journey có đủ year, title, desc", () => {
    for (const j of FALLBACK_ABOUT.journey) {
      expect(j.year.trim().length).toBeGreaterThan(0);
      expect(j.title.trim().length).toBeGreaterThan(0);
      expect(j.desc.trim().length).toBeGreaterThan(0);
    }
  });

  it("bio chia thành nhiều đoạn bằng dòng trống", () => {
    expect((FALLBACK_ABOUT.bio ?? "").split(/\n{2,}/).length).toBeGreaterThan(1);
  });
});

describe("FALLBACK_SETTINGS", () => {
  it("social là object để Footer đọc được bằng key", () => {
    expect(typeof FALLBACK_SETTINGS.social).toBe("object");
    expect(FALLBACK_SETTINGS.social).not.toBeNull();
  });

  it("có brand_name và hero_title để navbar, footer không trống", () => {
    expect((FALLBACK_SETTINGS.brand_name ?? "").length).toBeGreaterThan(0);
    expect((FALLBACK_SETTINGS.hero_title ?? "").length).toBeGreaterThan(0);
  });
});
