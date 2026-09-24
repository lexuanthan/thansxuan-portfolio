import { describe, expect, it } from "vitest";
import {
  ARCHETYPES,
  CORE_VALUE_OPTIONS,
  generateBrandStrategy,
  suggestArchetypeFromValues,
} from "@/lib/brand-strategy/engine";
import type { BrandInput } from "@/lib/brand-strategy/types";

describe("Brand Strategy Engine", () => {
  it("chứa đầy đủ 12 hình mẫu tâm lý Carl Jung", () => {
    const keys = Object.keys(ARCHETYPES);
    expect(keys).toHaveLength(12);
    expect(keys).toContain("creator");
    expect(keys).toContain("sage");
    expect(keys).toContain("hero");
    expect(keys).toContain("outlaw");
    expect(keys).toContain("explorer");
    expect(keys).toContain("magician");
    expect(keys).toContain("lover");
    expect(keys).toContain("everyman");
    expect(keys).toContain("caregiver");
    expect(keys).toContain("jester");
    expect(keys).toContain("ruler");
    expect(keys).toContain("innocent");
  });

  it("gợi ý hình mẫu phù hợp dựa trên các giá trị cốt lõi", () => {
    expect(suggestArchetypeFromValues(["Sáng tạo", "Đổi mới"])).toBe("creator");
    expect(suggestArchetypeFromValues(["Đáng tin cậy", "Trí tuệ"])).toBe("sage");
    expect(suggestArchetypeFromValues(["Dũng cảm", "Nhiệt huyết"])).toBe("hero");
    expect(suggestArchetypeFromValues(["Đột phá"])).toBe("outlaw");
    expect(suggestArchetypeFromValues(["Vui vẻ"])).toBe("jester");
  });

  it("sinh ra ma trận chiến lược thương hiệu và AI system prompt hoàn chỉnh", () => {
    const input: BrandInput = {
      brandName: "Lê Xuân Thân Tech Lab",
      industry: "Công nghệ & Quản trị Thương hiệu",
      targetAudience: "Nhà sáng lập, Marketer và Chuyên viên nội dung",
      mission: "Ứng dụng AI để tối ưu hóa truyền thông thương hiệu và nhân đôi năng suất",
      coreValues: ["Sáng tạo", "Đổi mới", "Trí tuệ"],
      archetypeId: "creator",
      formality: 3,
      humor: 2,
      emotion: 4,
      assertiveness: 4,
    };

    const result = generateBrandStrategy(input);

    expect(result.archetype.id).toBe("creator");
    expect(result.taglineSuggestions.length).toBeGreaterThanOrEqual(3);
    expect(result.positioningStatement).toContain("Lê Xuân Thân Tech Lab");
    expect(result.voiceRules).toHaveLength(3);
    expect(result.contentPillars).toHaveLength(4);
    expect(result.viralHooks.length).toBeGreaterThanOrEqual(4);

    // Kiểm tra AI System Prompt
    expect(result.aiSystemPrompt).toContain("Lê Xuân Thân Tech Lab");
    expect(result.aiSystemPrompt).toContain("Người Sáng Tạo");
    expect(result.aiSystemPrompt).toContain("BỘ QUY TẮC PHÁT NGÔN");

    // Kiểm tra tài liệu Markdown
    expect(result.fullMarkdownDoc).toContain("# HỒ SƠ CHIẾN LƯỢC THƯƠNG HIỆU & BRAND VOICE AI");
    expect(result.fullMarkdownDoc).toContain("Lê Xuân Thân Tech Lab");
  });

  it("xử lý an toàn khi đầu vào trống hoặc giá trị mặc định", () => {
    const emptyInput: BrandInput = {
      brandName: "",
      industry: "",
      targetAudience: "",
      mission: "",
      coreValues: [],
      archetypeId: "sage",
      formality: 3,
      humor: 3,
      emotion: 3,
      assertiveness: 3,
    };

    const result = generateBrandStrategy(emptyInput);
    expect(result.positioningStatement).toBeDefined();
    expect(result.aiSystemPrompt).toBeDefined();
    expect(result.fullMarkdownDoc).toBeDefined();
  });
});
