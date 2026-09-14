import { describe, expect, it } from "vitest";
import { formatBytes, safeFileName, MAX_UPLOAD_BYTES } from "@/lib/media";

describe("safeFileName", () => {
  it("bỏ dấu tiếng Việt và giữ đuôi file", () => {
    expect(safeFileName("Ảnh Dự Án.PNG")).toMatch(/^anh-du-an-[a-z0-9]+\.png$/);
  });

  it("chuyển đuôi file về chữ thường", () => {
    expect(safeFileName("photo.JPEG")).toMatch(/\.jpeg$/);
  });

  it("dùng đuôi bin khi tên file không có phần mở rộng", () => {
    expect(safeFileName("khong-co-duoi")).toMatch(/^khong-co-duoi-[a-z0-9]+\.bin$/);
  });

  it("không sinh trùng tên cho cùng một file", () => {
    const a = safeFileName("anh.png");
    const b = safeFileName("anh.png");
    expect(a).not.toBe(b);
  });

  it("tên file toàn ký tự lạ vẫn cho ra tên hợp lệ", () => {
    expect(safeFileName("!!!.png")).toMatch(/^file-[a-z0-9]+\.png$/);
  });

  it("kết quả chỉ chứa ký tự an toàn cho storage", () => {
    const name = safeFileName("Ảnh #1 (bản final) & cũ.WEBP");
    expect(name).toMatch(/^[a-z0-9.-]+$/);
  });
});

describe("formatBytes", () => {
  it("xử lý giá trị 0", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("hiển thị byte không có phần thập phân", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("đổi sang KB và MB", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
  });

  it("giới hạn upload là 8 MB", () => {
    expect(formatBytes(MAX_UPLOAD_BYTES)).toBe("8.0 MB");
  });
});
