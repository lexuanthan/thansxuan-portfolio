import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { CareerExplorerView } from "@/components/career-guidance/views/CareerExplorerView";
import { MajorExplorerView } from "@/components/career-guidance/views/MajorExplorerView";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { rankCareers, rankMajors } from "@/lib/career-guidance/matchingEngine";

describe("MODULE PROMPT 05 — CAREER & MAJOR EXPLORER", () => {
  const profile = createDefaultProfile();
  const careerMatches = rankCareers(profile);
  const majorMatches = rankMajors(profile);

  const mockSelectCareer = vi.fn();
  const mockAskCoach = vi.fn();
  const mockBookmark = vi.fn();
  const mockIsBookmarked = vi.fn().mockReturnValue(false);
  const mockNavigateView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("A. CAREER EXPLORER", () => {
    it("1. Career Card: renders job title, cluster, match, salary range, demand trend, AI exposure, work style, education requirement", () => {
      render(
        <CareerExplorerView
          careerMatches={careerMatches}
          profile={profile}
          onSelectCareerForRoadmap={mockSelectCareer}
          onAskCoachAboutItem={mockAskCoach}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onNavigateView={mockNavigateView}
        />
      );

      // Main header
      expect(screen.getByText(/Khám Phá Chi Tiết Nghề Nghiệp \(Career Explorer\)/i)).toBeDefined();

      // Card 1 specifications
      const firstCareer = careerMatches[0].career;
      expect(screen.getByText(firstCareer.name)).toBeDefined();
      expect(screen.getAllByText(firstCareer.industry_name).length).toBeGreaterThan(0);
      expect(screen.getByText(`${careerMatches[0].score}% Khớp`)).toBeDefined();
      expect(screen.getAllByText(/Mức lương VN:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Nhu cầu tuyển dụng:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Tác động AI:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Học vấn yêu cầu:/i).length).toBeGreaterThan(0);
    });

    it("2. Career Detail Modal: opens with role overview, daily work, skills, environment, growth, future outlook, WHY THIS FITS YOU, CHALLENGES", () => {
      render(
        <CareerExplorerView
          careerMatches={careerMatches}
          profile={profile}
          onSelectCareerForRoadmap={mockSelectCareer}
          onAskCoachAboutItem={mockAskCoach}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onNavigateView={mockNavigateView}
        />
      );

      // Open detail modal
      const detailBtns = screen.getAllByRole("button", { name: /Xem chi tiết nghề/i });
      expect(detailBtns.length).toBeGreaterThan(0);
      fireEvent.click(detailBtns[0]);

      const modal = screen.getByRole("dialog");
      expect(modal).toBeDefined();

      // 8 Required Sections
      expect(within(modal).getByText(/1\. Tổng quan vai trò \(Role Overview\)/i)).toBeDefined();
      expect(within(modal).getByText(/2\. Công việc hằng ngày \(Daily Work\)/i)).toBeDefined();
      expect(within(modal).getByText(/3\. Kỹ năng & Năng lực yêu cầu \(Skills\)/i)).toBeDefined();
      expect(within(modal).getByText(/4\. Môi trường & Phong cách làm việc \(Environment\)/i)).toBeDefined();
      expect(within(modal).getByText(/5\. Nấc thang thăng tiến \(Growth & Progression\)/i)).toBeDefined();
      expect(within(modal).getByText(/6\. Triển vọng tương lai & Lợi thế con người \(Future Outlook\)/i)).toBeDefined();
      expect(within(modal).getByText(/7\. WHY THIS FITS YOU/i)).toBeDefined();
      expect(within(modal).getByText(/8\. CHALLENGES/i)).toBeDefined();

      // Close modal
      const closeBtns = within(modal).getAllByRole("button", { name: /Đóng/i });
      fireEvent.click(closeBtns[0]);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("3. Discovery: search, filter, and compare shortlist for careers", () => {
      render(
        <CareerExplorerView
          careerMatches={careerMatches}
          profile={profile}
          onSelectCareerForRoadmap={mockSelectCareer}
          onAskCoachAboutItem={mockAskCoach}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onNavigateView={mockNavigateView}
        />
      );

      // Search
      const searchInput = screen.getByPlaceholderText(/Tìm theo tên nghề, kỹ năng.../i);
      fireEvent.change(searchInput, { target: { value: "Phần mềm" } });
      expect(screen.getAllByText(/Kỹ sư Phần mềm/i).length).toBeGreaterThan(0);

      // Clear search
      fireEvent.change(searchInput, { target: { value: "" } });

      // Compare
      const compareBtns = screen.getAllByTitle(/Thêm vào so sánh/i);
      expect(compareBtns.length).toBeGreaterThanOrEqual(2);
      fireEvent.click(compareBtns[0]);
      fireEvent.click(compareBtns[1]);

      expect(screen.getByText(/Đã chọn 2\/3 nghề để so sánh/i)).toBeDefined();
    });

    it("4. Empty State: explains assessment is needed if recommendations are absent", () => {
      render(
        <CareerExplorerView
          careerMatches={[]} // Empty matches
          onSelectCareerForRoadmap={mockSelectCareer}
          onAskCoachAboutItem={mockAskCoach}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onNavigateView={mockNavigateView}
        />
      );

      const emptyState = screen.getByTestId("career-explorer-empty-state");
      expect(emptyState).toBeDefined();
      expect(within(emptyState).getByText(/Chưa có dữ liệu đánh giá cá nhân/i)).toBeDefined();

      // CTA navigates to assessment
      const ctaBtn = within(emptyState).getByRole("button", { name: /Làm bài đánh giá ngay/i });
      fireEvent.click(ctaBtn);
      expect(mockNavigateView).toHaveBeenCalledWith("assessment");
    });
  });

  describe("B. MAJOR EXPLORER", () => {
    it("5. Major DNA: renders core subjects, math intensity, workload/difficulty, and career paths", () => {
      render(
        <MajorExplorerView
          majorMatches={majorMatches}
          profile={profile}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onAskCoachAboutItem={mockAskCoach}
          onNavigateView={mockNavigateView}
        />
      );

      // Main header
      expect(screen.getByText(/Khám Phá Ngành Đào Tạo Đại Học \(Major Explorer\)/i)).toBeDefined();

      // Verify Major DNA specs on card
      expect(screen.getAllByText(/Tổ hợp môn:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Cường độ Toán:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Độ khó CT:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Điểm chuẩn TB:/i).length).toBeGreaterThan(0);
    });

    it("6. Major Detail Modal: renders Major DNA, WHY THIS FITS YOU, and WHAT MAY CHALLENGE YOU", () => {
      render(
        <MajorExplorerView
          majorMatches={majorMatches}
          profile={profile}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onAskCoachAboutItem={mockAskCoach}
          onNavigateView={mockNavigateView}
        />
      );

      // Open Major DNA modal
      const dnaBtns = screen.getAllByRole("button", { name: /Xem Major DNA/i });
      expect(dnaBtns.length).toBeGreaterThan(0);
      fireEvent.click(dnaBtns[0]);

      const modal = screen.getByRole("dialog");
      expect(modal).toBeDefined();

      // Major DNA specs
      expect(within(modal).getByText(/Bản Đồ Năng Lực Học Thuật \(Major DNA\)/i)).toBeDefined();
      expect(within(modal).getByText(/Cường độ Toán/i)).toBeDefined();
      expect(within(modal).getByText(/Lập trình \/ Kỹ thuật/i)).toBeDefined();
      expect(within(modal).getByText(/Tổ hợp môn & Khối kiến thức cốt lõi \(Core Subjects\)/i)).toBeDefined();
      expect(within(modal).getByText(/Cơ hội việc làm sau tốt nghiệp \(Career Paths\)/i)).toBeDefined();

      // Two Required Elements
      expect(within(modal).getByText(/WHY THIS FITS YOU/i)).toBeDefined();
      expect(within(modal).getByText(/WHAT MAY CHALLENGE YOU/i)).toBeDefined();

      // Close modal
      const closeBtns = within(modal).getAllByRole("button", { name: /Đóng/i });
      fireEvent.click(closeBtns[0]);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("7. Major Empty State: explains assessment requirement when recommendations are absent", () => {
      render(
        <MajorExplorerView
          majorMatches={[]}
          onBookmarkItem={mockBookmark}
          isBookmarked={mockIsBookmarked}
          onAskCoachAboutItem={mockAskCoach}
          onNavigateView={mockNavigateView}
        />
      );

      const emptyState = screen.getByTestId("major-explorer-empty-state");
      expect(emptyState).toBeDefined();
      expect(within(emptyState).getByText(/Chưa có dữ liệu xếp hạng ngành cá nhân hóa/i)).toBeDefined();

      const ctaBtn = within(emptyState).getByRole("button", { name: /Làm bài đánh giá ngay/i });
      fireEvent.click(ctaBtn);
      expect(mockNavigateView).toHaveBeenCalledWith("assessment");
    });
  });
});
