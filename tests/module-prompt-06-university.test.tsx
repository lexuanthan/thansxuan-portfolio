import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { UniversityExplorerView } from "@/components/career-guidance/views/UniversityExplorerView";
import { CompareView } from "@/components/career-guidance/views/CompareView";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { matchUniversities } from "@/lib/career-guidance/universityMatching";
import { rankCareers, rankMajors } from "@/lib/career-guidance/matchingEngine";

describe("MODULE PROMPT 06 — UNIVERSITY MATCHING & COMPARISON", () => {
  const profile = createDefaultProfile();
  const careerMatches = rankCareers(profile);
  const majorMatches = rankMajors(profile);

  const mockBookmark = vi.fn();
  const mockIsBookmarked = vi.fn().mockReturnValue(false);
  const mockAskCoach = vi.fn();
  const mockNavigateView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. UNIVERSITY FIT & 2. CARD", () => {
    it("1. University Card displays all 8 criteria: logo, university name, location, match, tuition, admission, program, scholarship", () => {
      render(
        <UniversityExplorerView
          profile={profile}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onAskCoachAboutItem={mockAskCoach}
          onNavigateView={mockNavigateView}
        />
      );

      // Verify Header
      expect(screen.getByText(/Hệ Thống Khám Phá & So Khớp Trường Đại Học/i)).toBeDefined();

      // Card 1: Check HCMUTE
      expect(screen.getAllByText(/HCMUTE/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TP. Hồ Chí Minh/i).length).toBeGreaterThan(0);

      // Match % & 7-Fit preview
      expect(screen.getAllByText(/Phù hợp hồ sơ/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Học thuật/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Xét tuyển/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Tài chính/i).length).toBeGreaterThan(0);

      // Tuition & Admission
      expect(screen.getAllByText(/Học phí trung bình:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Điểm chuẩn tham khảo:/i).length).toBeGreaterThan(0);

      // Program & Scholarship
      expect(screen.getAllByText(/Ngành đào tạo trọng điểm:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Học bổng:/i).length).toBeGreaterThan(0);
    });

    it("2. Detail Modal contains fit breakdown (7 dimensions), admission compatibility, tuition, scholarship, campus, program, career opportunity", () => {
      render(
        <UniversityExplorerView
          profile={profile}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onAskCoachAboutItem={mockAskCoach}
          onNavigateView={mockNavigateView}
        />
      );

      // Click "Xem chi tiết 7 trục" on the first card
      const detailButtons = screen.getAllByRole("button", { name: /Xem chi tiết 7 trục/i });
      fireEvent.click(detailButtons[0]);

      // Check modal open
      const modal = screen.getByRole("dialog");
      expect(modal).toBeDefined();

      // 1. Fit breakdown (7 dimensions)
      expect(within(modal).getByText(/Fit Breakdown • 7 Chiều Tương Thích Khoa Học/i)).toBeDefined();
      expect(within(modal).getByText(/Overall Fit \(Tổng thể\)/i)).toBeDefined();
      expect(within(modal).getByText(/Academic Fit \(Học thuật\)/i)).toBeDefined();
      expect(within(modal).getByText(/Admission Fit \(Xét tuyển\)/i)).toBeDefined();
      expect(within(modal).getByText(/Financial Fit \(Tài chính\)/i)).toBeDefined();
      expect(within(modal).getByText(/Location Fit \(Địa điểm\)/i)).toBeDefined();
      expect(within(modal).getByText(/Career Fit \(Nghề nghiệp\)/i)).toBeDefined();
      expect(within(modal).getByText(/Environment Fit \(Môi trường\)/i)).toBeDefined();

      // 2. Admission compatibility
      expect(within(modal).getByText(/Khả năng trúng tuyển & Phương thức xét tuyển:/i)).toBeDefined();

      // 3. Tuition & 4. Scholarship
      expect(within(modal).getByText(/Học phí & Chi phí đào tạo:/i)).toBeDefined();
      expect(within(modal).getByText(/Chính sách học bổng:/i)).toBeDefined();

      // 5. Campus & 6. Program & 7. Career opportunity
      expect(within(modal).getByText(/Khuôn viên & Cơ sở vật chất \(Campus\):/i)).toBeDefined();
      expect(within(modal).getByText(/Chương trình đào tạo & Kiểm định quốc tế \(Program\):/i)).toBeDefined();
      expect(within(modal).getByText(/Cơ hội việc làm & Đối tác doanh nghiệp \(Career Opportunity\):/i)).toBeDefined();

      // Close modal
      const closeButtons = within(modal).getAllByRole("button", { name: /Đóng/i });
      fireEvent.click(closeButtons[0]);
    });
  });

  describe("4. COMPARE & 5. AI ANALYSIS & 6. LANGUAGE & 7. RESPONSIVE", () => {
    it("3. Comparison Workspace: sticky header, 8 rows, highlight difference toggle, AI analysis CTA", () => {
      render(
        <UniversityExplorerView
          profile={profile}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onAskCoachAboutItem={mockAskCoach}
          onNavigateView={mockNavigateView}
        />
      );

      // Click "Mở Workspace So Sánh"
      const openWorkspaceBtn = screen.getByRole("button", { name: /Mở Workspace So Sánh/i });
      fireEvent.click(openWorkspaceBtn);

      const workspace = screen.getByRole("dialog");
      expect(workspace).toBeDefined();

      // Check header
      expect(within(workspace).getByText(/Comparison Decision Workspace/i)).toBeDefined();
      expect(within(workspace).getByText(/Bàn Cân So Sánh Các Trường Đại Học/i)).toBeDefined();

      // Check Difference Highlight Toggle
      const highlightToggle = within(workspace).getByLabelText(/Làm nổi bật điểm khác biệt/i);
      expect(highlightToggle).toBeDefined();

      // Check 8 comparison rows in the workspace
      expect(within(workspace).getAllByText(/1\. University Fit/i).length).toBeGreaterThan(0);
      expect(within(workspace).getAllByText(/2\. Xét tuyển & Điểm chuẩn/i).length).toBeGreaterThan(0);
      expect(within(workspace).getAllByText(/3\. Học phí tham khảo/i).length).toBeGreaterThan(0);
      expect(within(workspace).getAllByText(/4\. Vị trí & Khu vực/i).length).toBeGreaterThan(0);
      expect(within(workspace).getAllByText(/5\. Chính sách học bổng/i).length).toBeGreaterThan(0);
      expect(within(workspace).getAllByText(/6\. Chương trình & Kiểm định/i).length).toBeGreaterThan(0);
      expect(within(workspace).getAllByText(/7\. Môi trường & Cơ sở vật chất/i).length).toBeGreaterThan(0);
      expect(within(workspace).getAllByText(/8\. Cơ hội việc làm & Đối tác/i).length).toBeGreaterThan(0);

      // Check AI Analysis CTA
      const aiBtn = within(workspace).getByRole("button", { name: /AI phân tích điểm khác biệt quan trọng/i });
      expect(aiBtn).toBeDefined();

      // Click AI Analysis CTA
      fireEvent.click(aiBtn);

      // Check AI Analysis Modal opens
      expect(screen.getAllByText(/AI Phân Tích Điểm Khác Biệt Quan Trọng/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Ma trận đánh đổi \(Trade-off Analysis\):/i)).toBeDefined();

      // Strictly verify language: "trường phù hợp hơn với hồ sơ hiện tại"
      expect(screen.getAllByText(/trường phù hợp hơn với hồ sơ hiện tại/i).length).toBeGreaterThan(0);
    });

    it("4. CompareView tab supports university comparison with 8 rows, mobile stacked layout, and correct terminology", () => {
      render(
        <CompareView
          careerMatches={careerMatches}
          majorMatches={majorMatches}
          profile={profile}
          onAskCoachAboutItem={mockAskCoach}
          onNavigateView={mockNavigateView}
        />
      );

      // Should be in "So sánh Trường ĐH" tab
      expect(screen.getByRole("button", { name: /So sánh Trường ĐH/i })).toBeDefined();

      // Verify the 8 rows in table
      expect(screen.getAllByText(/1\. Độ phù hợp 7 chiều \(Fit Breakdown\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/2\. Xét tuyển & Điểm chuẩn \(Admission\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/3\. Học phí tham khảo \(Tuition\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/4\. Địa điểm & Cơ sở \(Location\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/5\. Chính sách học bổng \(Scholarship\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/6\. Chương trình đào tạo \(Curriculum\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/7\. Môi trường & Cơ sở vật chất \(Environment\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/8\. Cơ hội nghề nghiệp \(Career\)/i).length).toBeGreaterThan(0);

      // Verify Mobile Stacked layout description is present
      expect(screen.getAllByText(/Chế độ so sánh xếp chồng \(Stacked Compare\)/i).length).toBeGreaterThan(0);

      // Verify AI Analysis CTA button in CompareView
      const aiBtn = screen.getByRole("button", { name: /AI phân tích điểm khác biệt quan trọng/i });
      fireEvent.click(aiBtn);

      // Check language in AI modal: "trường phù hợp hơn với hồ sơ hiện tại"
      expect(screen.getAllByText(/trường phù hợp hơn với hồ sơ hiện tại/i).length).toBeGreaterThan(0);
    });
  });
});
