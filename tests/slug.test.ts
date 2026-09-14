import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("bỏ dấu tiếng Việt", () => {
    expect(slugify("Lê Xuân Thân")).toBe("le-xuan-than");
    expect(slugify("Chiến lược thương hiệu")).toBe("chien-luoc-thuong-hieu");
  });

  it("đổi đ và Đ thành d", () => {
    expect(slugify("Đường phố")).toBe("duong-pho");
    expect(slugify("đổi mới sáng tạo")).toBe("doi-moi-sang-tao");
  });

  it("gộp ký tự đặc biệt và khoảng trắng thành một gạch ngang", () => {
    expect(slugify("  Hello   World!!  ")).toBe("hello-world");
    expect(slugify("AI & Branding — 2026")).toBe("ai-branding-2026");
  });

  it("không để lại gạch ngang ở đầu hoặc cuối", () => {
    expect(slugify("---xin chào---")).toBe("xin-chao");
    expect(slugify("!!!")).toBe("");
  });

  it("cắt theo maxLength mà không để lại gạch ngang thừa", () => {
    expect(slugify("abcde fgh", 6)).toBe("abcde");
    expect(slugify("a".repeat(100), 10)).toBe("a".repeat(10));
  });

  it("chuỗi rỗng trả về chuỗi rỗng", () => {
    expect(slugify("")).toBe("");
  });

  it("kết quả luôn an toàn cho URL", () => {
    const inputs = [
      "Dự án #1: Nhận diện thương hiệu",
      "Video/Script (bản nháp)",
      "100% Sáng tạo",
    ];
    for (const input of inputs) {
      expect(slugify(input)).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
