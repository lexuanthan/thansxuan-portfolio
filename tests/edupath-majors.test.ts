import { describe, it, expect, vi } from "vitest";
import {
  MAJORS_DATABASE,
  calculateEduPathRecommendations,
  EduPathFormData
} from "../src/data/majorsDatabase";
import { openPrintWindow, downloadHtmlFile } from "../src/lib/reportGenerator";

describe("EduPath Multi-Major Compatibility Algorithm", () => {
  it("chứa đầy đủ 12 nhóm ngành cốt lõi", () => {
    expect(MAJORS_DATABASE).toHaveLength(12);
    const codes = MAJORS_DATABASE.map((m) => m.code);
    expect(codes).toContain("7480108"); // AI & Data
    expect(codes).toContain("7480103"); // Kỹ thuật phần mềm
    expect(codes).toContain("7480201"); // CNTT
    expect(codes).toContain("7340101"); // QTKD
    expect(codes).toContain("7340115"); // Marketing
    expect(codes).toContain("7340201"); // Tài chính ngân hàng
    expect(codes).toContain("7340301"); // Kế toán kiểm toán
    expect(codes).toContain("7720101"); // Y đa khoa
    expect(codes).toContain("7210403"); // Thiết kế UI/UX
    expect(codes).toContain("7140201"); // Sư phạm
    expect(codes).toContain("7380107"); // Luật kinh tế
    expect(codes).toContain("7520130"); // Cơ điện tử & Tự động hóa
  });

  it("ưu tiên nhóm ngành CNTT & Phần mềm cho học sinh giỏi Toán, Tin, thích Lập trình", () => {
    const techStudent: EduPathFormData = {
      subjects: {
        math: { score: 9.5, trend: "up", interest: 5 },
        literature: { score: 6.0, trend: "stable", interest: 2 },
        english: { score: 8.5, trend: "up", interest: 4 },
        physics: { score: 8.0, trend: "up", interest: 4 },
        chemistry: { score: 6.5, trend: "stable", interest: 2 },
        biology: { score: 6.0, trend: "stable", interest: 2 },
        history: { score: 6.0, trend: "stable", interest: 2 },
        geography: { score: 6.5, trend: "stable", interest: 2 },
        informatics: { score: 9.8, trend: "up", interest: 5 },
        technology: { score: 8.5, trend: "stable", interest: 4 }
      },
      abilities: {
        problemSolving: 5,
        logic: 5,
        creativity: 4,
        communication: 3,
        teamwork: 4,
        independent: 5
      },
      interests: ["Công nghệ", "Lập trình", "Dữ liệu", "AI"],
      values: ["Thu nhập tốt", "Sáng tạo", "Công nghệ"],
      dislikedFields: [],
      selfLearningRating: 5
    };

    const results = calculateEduPathRecommendations(techStudent);
    expect(results).toHaveLength(12);

    // Top 1 và Top 2 phải thuộc nhóm Máy tính & CNTT
    const top1 = results[0];
    const top2 = results[1];
    expect(["7480108", "7480103", "7480201"]).toContain(top1.code);
    expect(["7480108", "7480103", "7480201"]).toContain(top2.code);
    expect(top1.matchPercentage).toBeGreaterThanOrEqual(85);
    expect(top1.strengthNote).toContain("Toán");
    expect(top1.strengthNote).toContain("Tin học");
  });

  it("ưu tiên Y Đa khoa cho học sinh giỏi Sinh, Hóa và có lý tưởng cứu người", () => {
    const medicalStudent: EduPathFormData = {
      subjects: {
        math: { score: 8.8, trend: "up", interest: 4 },
        literature: { score: 7.0, trend: "stable", interest: 3 },
        english: { score: 8.0, trend: "stable", interest: 4 },
        physics: { score: 7.5, trend: "stable", interest: 3 },
        chemistry: { score: 9.6, trend: "up", interest: 5 },
        biology: { score: 9.8, trend: "up", interest: 5 },
        history: { score: 6.0, trend: "stable", interest: 2 },
        geography: { score: 6.0, trend: "stable", interest: 2 },
        informatics: { score: 6.5, trend: "stable", interest: 2 },
        technology: { score: 6.0, trend: "stable", interest: 2 }
      },
      abilities: {
        problemSolving: 5,
        logic: 4,
        creativity: 3,
        communication: 4,
        teamwork: 4,
        independent: 5
      },
      interests: ["Y học", "Chăm sóc sức khỏe", "Cứu người", "Sinh học"],
      values: ["Cống hiến xã hội", "Vị thế xã hội", "Việc làm ổn định"],
      dislikedFields: ["Lập trình / Code"],
      selfLearningRating: 4
    };

    const results = calculateEduPathRecommendations(medicalStudent);
    const top1 = results[0];
    expect(top1.code).toBe("7720101"); // Y đa khoa & Khoa học Sức khỏe
    expect(top1.matchPercentage).toBeGreaterThanOrEqual(85);
    expect(top1.strengthNote).toContain("Sinh học");
  });

  it("áp dụng cơ chế phạt khi học sinh đánh dấu ngành không thích (dislikedFields)", () => {
    const studentWithDislike: EduPathFormData = {
      subjects: {
        math: { score: 9.0, trend: "up", interest: 5 },
        literature: { score: 7.0, trend: "stable", interest: 3 },
        english: { score: 8.0, trend: "stable", interest: 4 },
        physics: { score: 8.5, trend: "stable", interest: 4 },
        chemistry: { score: 7.0, trend: "stable", interest: 3 },
        biology: { score: 6.0, trend: "stable", interest: 2 },
        history: { score: 6.0, trend: "stable", interest: 2 },
        geography: { score: 6.0, trend: "stable", interest: 2 },
        informatics: { score: 9.0, trend: "up", interest: 5 },
        technology: { score: 8.0, trend: "stable", interest: 4 }
      },
      abilities: {
        problemSolving: 4,
        logic: 5,
        creativity: 3,
        communication: 3,
        teamwork: 4,
        independent: 4
      },
      interests: ["Công nghệ"],
      values: ["Thu nhập tốt"],
      dislikedFields: ["Y tế / Sức khỏe", "Máy tính & CNTT"],
      selfLearningRating: 3
    };

    const results = calculateEduPathRecommendations(studentWithDislike);
    const itMajor = results.find((m) => m.code === "7480103");
    expect(itMajor).toBeDefined();
    // Bị phạt nên gap note phản ánh điều này
    expect(itMajor?.gapNote).toContain("ít yêu thích");
  });
});

describe("Report Generator Utilities", () => {
  it("không gây lỗi khi chạy ở môi trường không hỗ trợ pop-up hoặc headless", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    expect(() => openPrintWindow("Test", "<div>test</div>")).not.toThrow();
    expect(() => downloadHtmlFile("test", "<div>test</div>")).not.toThrow();
    openSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("gọi window.open khi có window object", () => {
    const mockDocument = {
      open: vi.fn(),
      write: vi.fn(),
      close: vi.fn()
    };
    const mockWindow = {
      document: mockDocument
    };
    const openSpy = vi.spyOn(window, "open").mockReturnValue(mockWindow as unknown as Window);

    openPrintWindow("Tiêu Đề Báo Cáo", "<p>Nội dung</p>");
    expect(openSpy).toHaveBeenCalled();
    expect(mockDocument.write).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("tạo thẻ a để tải file HTML khi URL.createObjectURL khả dụng", () => {
    const createObjectURLMock = vi.fn().mockReturnValue("blob:http://localhost/test");
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    downloadHtmlFile("TestFile", "<p>Content</p>");
    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();

    clickSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
