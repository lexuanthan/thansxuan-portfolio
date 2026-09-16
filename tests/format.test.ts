import { describe, expect, it } from "vitest";
import {
  formatCount,
  formatDate,
  plainText,
  searchKey,
  stripDiacritics,
  truncate,
} from "@/lib/format";

describe("formatDate", () => {
  it("đổi chuỗi ISO sang cách viết tiếng Việt", () => {
    expect(formatDate("2025-09-12T10:24:00.000Z")).toBe("12 Tháng 9, 2025");
    expect(formatDate("2026-01-05")).toBe("5 Tháng 1, 2026");
  });

  it("không đệm số 0 ở đầu ngày", () => {
    expect(formatDate("2025-03-07")).toBe("7 Tháng 3, 2025");
  });

  it("dữ liệu thiếu hoặc hỏng trả chuỗi rỗng thay vì 'Invalid Date'", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
    expect(formatDate("hôm qua")).toBe("");
    expect(formatDate("2025-13-01")).toBe("");
  });
});

describe("formatCount", () => {
  it("giữ nguyên số nhỏ", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("rút gọn hàng nghìn", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(2500)).toBe("2.5k");
    expect(formatCount(18542)).toBe("19k");
  });

  it("rút gọn hàng triệu", () => {
    expect(formatCount(1_200_000)).toBe("1.2m");
  });

  it("dữ liệu rác quy về 0", () => {
    expect(formatCount(null)).toBe("0");
    expect(formatCount(Number.NaN)).toBe("0");
  });
});

describe("stripDiacritics", () => {
  it("bỏ hết dấu thanh và dấu mũ", () => {
    expect(stripDiacritics("Công nghệ sáng tạo")).toBe("Cong nghe sang tao");
    expect(stripDiacritics("Trường Đại học")).toBe("Truong Dai hoc");
  });

  it("xử lý riêng chữ đ vì NFD không tách được nó", () => {
    expect(stripDiacritics("đường")).toBe("duong");
    expect(stripDiacritics("Đà Nẵng")).toBe("Da Nang");
  });

  it("giữ nguyên chuỗi không dấu", () => {
    expect(stripDiacritics("AI tools 2026")).toBe("AI tools 2026");
  });
});

describe("searchKey", () => {
  it("cho phép tìm không cần gõ dấu", () => {
    expect(searchKey("Hướng dẫn tạo ứng dụng")).toBe("huong dan tao ung dung");
  });

  it("gộp khoảng trắng thừa và hạ chữ thường", () => {
    expect(searchKey("  Công   NGHỆ  ")).toBe("cong nghe");
  });

  it("chịu được null", () => {
    expect(searchKey(null)).toBe("");
    expect(searchKey(undefined)).toBe("");
  });

  it("khớp được khi người dùng gõ thiếu dấu", () => {
    const haystack = searchKey("Chia sẻ bộ công cụ AI hữu ích");
    expect(haystack.includes(searchKey("cong cu"))).toBe(true);
    expect(haystack.includes(searchKey("công cụ"))).toBe(true);
  });
});

describe("plainText", () => {
  it("bóc dấu in đậm để đoạn tóm tắt không lòi ra hai dấu sao", () => {
    expect(plainText("Tôi là **Lê Xuân Thân**, sinh năm 1992")).toBe(
      "Tôi là Lê Xuân Thân, sinh năm 1992"
    );
    expect(plainText("__nhấn mạnh__ kiểu khác")).toBe("nhấn mạnh kiểu khác");
  });

  it("bóc được nhiều cụm in đậm trong cùng một đoạn", () => {
    expect(plainText("**một** giữa **hai**")).toBe("một giữa hai");
  });

  it("dấu sao lẻ không bị nuốt mất", () => {
    expect(plainText("2 * 3 = 6")).toBe("2 * 3 = 6");
  });

  it("gộp xuống dòng thành một dòng vì đây là đoạn xem trước", () => {
    expect(plainText("dòng một\ndòng hai")).toBe("dòng một dòng hai");
  });

  it("chịu được dữ liệu rỗng", () => {
    expect(plainText(null)).toBe("");
    expect(plainText(undefined)).toBe("");
  });
});

describe("truncate", () => {
  it("giữ nguyên đoạn ngắn", () => {
    expect(truncate("Một câu ngắn", 140)).toBe("Một câu ngắn");
  });

  it("không chặt ngang giữa một từ", () => {
    const out = truncate("Trường Đại học Sư phạm Kỹ thuật Thành phố Hồ Chí Minh", 20);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(21);
    // Ký tự cuối trước dấu … không được là khoảng trắng
    expect(out.slice(-2, -1)).not.toBe(" ");
  });

  it("chịu được dữ liệu rỗng", () => {
    expect(truncate(null)).toBe("");
    expect(truncate(undefined)).toBe("");
  });
});
