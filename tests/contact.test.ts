import { describe, expect, it } from "vitest";
import {
  MAX_CONTENT,
  MAX_NAME,
  looksLikeBot,
  normalizeContact,
  validateContact,
} from "@/lib/contact";

describe("normalizeContact", () => {
  it("cắt khoảng trắng thừa và hạ email về chữ thường", () => {
    const out = normalizeContact({
      name: "  Lê   Xuân  Thân ",
      email: "  LeXuanThan@Gmail.COM ",
      subject: " Hợp tác ",
      content: " Xin chào anh ",
    });

    expect(out.name).toBe("Lê Xuân Thân");
    expect(out.email).toBe("lexuanthan@gmail.com");
    expect(out.subject).toBe("Hợp tác");
    expect(out.content).toBe("Xin chào anh");
  });

  it("giữ lại xuống dòng trong nội dung nhưng gom bớt dòng trống", () => {
    const out = normalizeContact({
      content: "Đoạn một\n\n\n\nĐoạn hai\nDòng kế",
    });
    expect(out.content).toBe("Đoạn một\n\nĐoạn hai\nDòng kế");
  });

  it("chặn độ dài để không ai nhét được tiểu thuyết vào database", () => {
    const out = normalizeContact({
      name: "a".repeat(MAX_NAME + 50),
      content: "b".repeat(MAX_CONTENT + 500),
    });
    expect(out.name).toHaveLength(MAX_NAME);
    expect(out.content).toHaveLength(MAX_CONTENT);
  });

  it("dữ liệu không phải chuỗi trả về rỗng thay vì làm sập route", () => {
    const out = normalizeContact({ name: 123, email: null, content: {} });
    expect(out).toEqual({ name: "", email: "", subject: "", content: "" });
    expect(normalizeContact(null).name).toBe("");
    expect(normalizeContact(undefined).email).toBe("");
  });
});

describe("validateContact", () => {
  const ok = {
    name: "Lê Xuân Thân",
    email: "than@example.com",
    subject: "Chào",
    content: "Mình muốn trao đổi về việc hợp tác nội dung.",
  };

  it("dữ liệu hợp lệ không báo lỗi nào", () => {
    expect(validateContact(ok)).toEqual([]);
  });

  it("thiếu tên thì báo đúng ô đó", () => {
    const errors = validateContact({ ...ok, name: "A" });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("name");
  });

  it("bắt các dạng email sai", () => {
    for (const email of ["than", "than@", "@example.com", "than@example", "a b@c.com"]) {
      const errors = validateContact({ ...ok, email });
      expect(errors.some((e) => e.field === "email")).toBe(true);
    }
  });

  it("chấp nhận email có dấu chấm và dấu cộng", () => {
    for (const email of ["le.xuan.than@gmail.com", "than+web@example.co.uk"]) {
      expect(validateContact({ ...ok, email })).toEqual([]);
    }
  });

  it("nội dung quá ngắn bị chặn", () => {
    const errors = validateContact({ ...ok, content: "hi" });
    expect(errors.some((e) => e.field === "content")).toBe(true);
  });

  it("gom đủ mọi lỗi trong một lần thay vì bắt sửa từng cái", () => {
    expect(validateContact({ name: "", email: "x", subject: "", content: "" })).toHaveLength(3);
  });
});

describe("looksLikeBot", () => {
  it("ô bẫy để trống là người thật", () => {
    expect(looksLikeBot("")).toBe(false);
    expect(looksLikeBot("   ")).toBe(false);
    expect(looksLikeBot(undefined)).toBe(false);
  });

  it("ô bẫy có chữ là máy tự động điền", () => {
    expect(looksLikeBot("http://spam.example")).toBe(true);
  });
});
