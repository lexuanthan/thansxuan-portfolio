import { describe, expect, it } from "vitest";
import { postSlugFromPath } from "@/lib/views";

describe("postSlugFromPath", () => {
  it("lấy đúng slug của trang bài viết", () => {
    expect(postSlugFromPath("/bai-viet/cong-cu-ai-mien-phi")).toBe("cong-cu-ai-mien-phi");
  });

  it("bỏ qua mọi trang không phải bài viết", () => {
    expect(postSlugFromPath("/")).toBeNull();
    expect(postSlugFromPath("/bai-viet")).toBeNull();
    expect(postSlugFromPath("/bai-viet/")).toBeNull();
    expect(postSlugFromPath("/du-an/abc")).toBeNull();
    expect(postSlugFromPath("/ai-tools/logo-composer")).toBeNull();
  });

  it("không nhận đường dẫn nhiều tầng", () => {
    // Nếu nhận, một trang con bất kỳ cũng cộng nhầm lượt xem cho bài viết
    expect(postSlugFromPath("/bai-viet/abc/def")).toBeNull();
  });

  it("cắt bỏ query và hash trước khi so khớp", () => {
    expect(postSlugFromPath("/bai-viet/abc?utm_source=fb")).toBe("abc");
    expect(postSlugFromPath("/bai-viet/abc#phan-2")).toBe("abc");
    expect(postSlugFromPath("/bai-viet/abc?a=1#b")).toBe("abc");
  });

  it("giải mã slug tiếng Việt đã bị mã hoá trong URL", () => {
    expect(postSlugFromPath("/bai-viet/c%C3%B4ng-ngh%E1%BB%87")).toBe("công-nghệ");
  });

  it("chuỗi phần trăm hỏng vẫn trả về được, không ném lỗi", () => {
    // decodeURIComponent("%E0%A4%A") ném URIError — nếu để lọt thì cả lượt
    // ghi nhận view sẽ hỏng chỉ vì một đường dẫn rác
    expect(() => postSlugFromPath("/bai-viet/%E0%A4%A")).not.toThrow();
    expect(postSlugFromPath("/bai-viet/%E0%A4%A")).toBe("%E0%A4%A");
  });

  it("dữ liệu rác không làm sập route", () => {
    expect(postSlugFromPath("")).toBeNull();
    expect(postSlugFromPath(null as unknown as string)).toBeNull();
    expect(postSlugFromPath(123 as unknown as string)).toBeNull();
  });
});
