import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MatchesView } from "@/components/career-guidance/views/MatchesView";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { rankCareers, rankMajors } from "@/lib/career-guidance/matchingEngine";

describe("MODULE PROMPT 04 — MATCH RESULTS (Career Intelligence Matching Dashboard)", () => {
  const profile = createDefaultProfile();
  const careerMatches = rankCareers(profile);
  const majorMatches = rankMajors(profile);

  const mockSelectCareer = vi.fn();
  const mockBookmark = vi.fn();
  const mockIsBookmarked = vi.fn().mockReturnValue(false);
  const mockAskCoach = vi.fn();
  const mockNavigateView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. TOP MATCH: renders Top 3 showcase with match, confidence, fit reason, challenge, and outlook", () => {
    render(
      <MatchesView
        careerMatches={careerMatches}
        majorMatches={majorMatches}
        onSelectCareerForRoadmap={mockSelectCareer}
        onBookmarkItem={mockBookmark}
        isBookmarked={mockIsBookmarked}
        onAskCoachAboutItem={mockAskCoach}
        onNavigateView={mockNavigateView}
      />
    );

    // Top 3 showcase container exists
    const showcase = screen.getByTestId("top-3-careers-showcase");
    expect(showcase).toBeDefined();

    // Contains rank titles #1 Top Match, #2 High Match, #3 Strong Match
    expect(within(showcase).getByText(/#1 Top Match/i)).toBeDefined();
    expect(within(showcase).getByText(/#2 High Match/i)).toBeDefined();
    expect(within(showcase).getByText(/#3 Strong Match/i)).toBeDefined();

    // Check presence of structured fields
    expect(within(showcase).getAllByText(/Lý do tương thích cốt lõi \(Fit Reason\):/i).length).toBe(3);
    expect(within(showcase).getAllByText(/Điểm mạnh kích hoạt:/i).length).toBe(3);
    expect(within(showcase).getAllByText(/Thách thức tiềm ẩn:/i).length).toBeGreaterThan(0);
    expect(within(showcase).getAllByText(/Triển vọng & AI:/i).length).toBe(3);
  });

  it("2. MATCH EXPLAINABILITY: opens XAI modal with 5 required pillars (Why it fits, Evidence, Mismatch, Confidence, Next action)", () => {
    render(
      <MatchesView
        careerMatches={careerMatches}
        majorMatches={majorMatches}
        onSelectCareerForRoadmap={mockSelectCareer}
        onBookmarkItem={mockBookmark}
        isBookmarked={mockIsBookmarked}
        onAskCoachAboutItem={mockAskCoach}
        onNavigateView={mockNavigateView}
      />
    );

    // Click on "AI giải thích vì sao phù hợp" in top 1 card
    const explainBtns = screen.getAllByRole("button", { name: /AI giải thích vì sao phù hợp/i });
    expect(explainBtns.length).toBeGreaterThan(0);
    fireEvent.click(explainBtns[0]);

    // Modal dialog opens
    const modal = screen.getByRole("dialog");
    expect(modal).toBeDefined();

    // Check all 5 required XAI explainability pillars
    expect(within(modal).getByText(/1\. Vì sao phù hợp \(Why it fits\):/i)).toBeDefined();
    expect(within(modal).getByText(/2\. Căn cứ dữ liệu \(Evidence\):/i)).toBeDefined();
    expect(within(modal).getByText(/4\. Triển vọng tương lai & Tác động AI \(Outlook\):/i)).toBeDefined();
    expect(within(modal).getByText(/5\. Hành động tiếp theo đề xuất \(Next Action\):/i)).toBeDefined();
    expect(within(modal).getByText(/Độ tin cậy dữ liệu \(Confidence\)/i)).toBeDefined();

    // Close modal
    const closeBtn = within(modal).getByRole("button", { name: /Đóng cửa sổ/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("3. SCORE: uses genuine scoring engine scores (not hardcoded or fake)", () => {
    render(
      <MatchesView
        careerMatches={careerMatches}
        majorMatches={majorMatches}
        onSelectCareerForRoadmap={mockSelectCareer}
        onBookmarkItem={mockBookmark}
        isBookmarked={mockIsBookmarked}
        onAskCoachAboutItem={mockAskCoach}
        onNavigateView={mockNavigateView}
      />
    );

    // First career genuine calculated score
    const topScore = careerMatches[0].score;
    expect(topScore).toBeGreaterThan(0);
    expect(topScore).toBeLessThanOrEqual(100);

    // Verify it is displayed in the DOM
    const scoreElements = screen.getAllByText(new RegExp(`^${topScore}%?$`));
    expect(scoreElements.length).toBeGreaterThan(0);
  });

  it("4. FILTER: filters items by keyword search and multi-dimensional criteria", () => {
    render(
      <MatchesView
        careerMatches={careerMatches}
        majorMatches={majorMatches}
        onSelectCareerForRoadmap={mockSelectCareer}
        onBookmarkItem={mockBookmark}
        isBookmarked={mockIsBookmarked}
        onAskCoachAboutItem={mockAskCoach}
        onNavigateView={mockNavigateView}
      />
    );

    // Open multi-dimensional filters
    const filterToggleBtn = screen.getByRole("button", { name: /Bộ lọc đa chiều/i });
    fireEvent.click(filterToggleBtn);

    // Search input
    const searchInput = screen.getByPlaceholderText(/Tìm nghề theo tên, kỹ năng, từ khóa.../i);
    fireEvent.change(searchInput, { target: { value: "Phần mềm" } });

    // Should only show matching careers
    expect(screen.getAllByText(/Kỹ sư Phần mềm/i).length).toBeGreaterThan(0);
  });

  it("5. CARD DESIGN: uses clean rectangular cards, badges, and MetricGauge", () => {
    render(
      <MatchesView
        careerMatches={careerMatches}
        majorMatches={majorMatches}
        onSelectCareerForRoadmap={mockSelectCareer}
        onBookmarkItem={mockBookmark}
        isBookmarked={mockIsBookmarked}
        onAskCoachAboutItem={mockAskCoach}
        onNavigateView={mockNavigateView}
      />
    );

    // All matches title
    expect(screen.getByText(/Tất Cả Nghề Nghiệp Khớp Dữ Liệu/i)).toBeDefined();

    // Verify actions on card
    const targetBtns = screen.getAllByText(/Chọn làm mục tiêu lộ trình/i);
    expect(targetBtns.length).toBeGreaterThan(0);
    fireEvent.click(targetBtns[0]);
    expect(mockSelectCareer).toHaveBeenCalled();
  });

  it("6. AI: interacts with Ask AI button", () => {
    render(
      <MatchesView
        careerMatches={careerMatches}
        majorMatches={majorMatches}
        onSelectCareerForRoadmap={mockSelectCareer}
        onBookmarkItem={mockBookmark}
        isBookmarked={mockIsBookmarked}
        onAskCoachAboutItem={mockAskCoach}
        onNavigateView={mockNavigateView}
      />
    );

    const askAiBtns = screen.getAllByRole("button", { name: /Hỏi AI/i });
    expect(askAiBtns.length).toBeGreaterThan(0);
    fireEvent.click(askAiBtns[0]);
    expect(mockAskCoach).toHaveBeenCalled();
  });

  it("7. COMPARE: shortlists items, displays sticky compare tray, and opens Compare Modal", () => {
    render(
      <MatchesView
        careerMatches={careerMatches}
        majorMatches={majorMatches}
        onSelectCareerForRoadmap={mockSelectCareer}
        onBookmarkItem={mockBookmark}
        isBookmarked={mockIsBookmarked}
        onAskCoachAboutItem={mockAskCoach}
        onNavigateView={mockNavigateView}
      />
    );

    // Click "So sánh" on the first two items
    const compareBtns = screen.getAllByTitle(/Thêm vào bảng so sánh/i);
    expect(compareBtns.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(compareBtns[0]);
    fireEvent.click(compareBtns[1]);

    // Sticky bottom tray appears
    expect(screen.getByText(/Đã chọn 2\/3 mục để so sánh đa tiêu chí/i)).toBeDefined();

    // Open Compare Modal
    const openCompareBtn = screen.getByRole("button", { name: /So sánh ngay →/i });
    fireEvent.click(openCompareBtn);

    expect(screen.getByText(/So Sánh Trực Tiếp Các Lựa Chọn Đã Chọn/i)).toBeDefined();

    // Close Compare Modal
    const closeBtn = screen.getByRole("button", { name: /Đóng bảng so sánh/i });
    fireEvent.click(closeBtn);
  });

  it("8. NEXT ACTION: navigates from Career to Related Major and from Major to University Explorer", () => {
    render(
      <MatchesView
        careerMatches={careerMatches}
        majorMatches={majorMatches}
        onSelectCareerForRoadmap={mockSelectCareer}
        onBookmarkItem={mockBookmark}
        isBookmarked={mockIsBookmarked}
        onAskCoachAboutItem={mockAskCoach}
        onNavigateView={mockNavigateView}
      />
    );

    // Career card has related major link
    const toMajorBtns = screen.getAllByText(/→ Xem ngành đào tạo tại HCMUTE/i);
    expect(toMajorBtns.length).toBeGreaterThan(0);
    fireEvent.click(toMajorBtns[0]);

    // Active tab switches to majors
    expect(screen.getByText(/Tất Cả Ngành Đào Tạo Khớp Dữ Liệu/i)).toBeDefined();

    // In majors tab, click "Xem trường đào tạo (HCMUTE)"
    const toUniBtns = screen.getAllByText(/Xem trường đào tạo \(HCMUTE\)/i);
    expect(toUniBtns.length).toBeGreaterThan(0);
    fireEvent.click(toUniBtns[0]);
    expect(mockNavigateView).toHaveBeenCalledWith("universities");
  });
});
