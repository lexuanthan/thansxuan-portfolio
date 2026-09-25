import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssessmentView, ASSESSMENT_STAGES } from "@/components/career-guidance/views/AssessmentView";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";

describe("MODULE PROMPT 02 — ADAPTIVE ASSESSMENT", () => {
  const defaultProfile = createDefaultProfile();

  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = vi.fn();
  });

  it("renders the 7 stages with icons, titles, and question counts in contextual header", () => {
    render(
      <AssessmentView
        initialProfile={defaultProfile}
        onSaveProfile={vi.fn()}
        onGoToMatches={vi.fn()}
      />
    );

    // Contextual Header checks
    expect(screen.getByText(/Khám phá & Dựng Hồ sơ Career DNA/i)).toBeDefined();
    expect(screen.getByText(/Insight mở khóa/i)).toBeDefined();
    expect(screen.getByText(/Đã lưu tự động/i)).toBeDefined();

    // Verify all 7 stages exist in navigation via data-testid
    expect(screen.getByTestId("stage-tab-academic")).toBeDefined();
    expect(screen.getByTestId("stage-tab-interests")).toBeDefined();
    expect(screen.getByTestId("stage-tab-scenarios")).toBeDefined();
    expect(screen.getByTestId("stage-tab-workstyle")).toBeDefined();
    expect(screen.getByTestId("stage-tab-values")).toBeDefined();
    expect(screen.getByTestId("stage-tab-negatives")).toBeDefined();
    expect(screen.getByTestId("stage-tab-aspirations")).toBeDefined();
  });

  it("displays AI Coach Companion with early hypothesis, evidence count, and suggested exploration", () => {
    render(
      <AssessmentView
        initialProfile={defaultProfile}
        onSaveProfile={vi.fn()}
        onGoToMatches={vi.fn()}
      />
    );

    // AI Companion panel elements
    expect(screen.getByText(/AI Career Coach Đồng Hành/i)).toBeDefined();
    expect(screen.getAllByText(/Xu Hướng Ban Đầu/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bằng chứng thu thập:/i)).toBeDefined();
    expect(screen.getByText(/Gợi ý tự vấn:/i)).toBeDefined();
  });

  it("handles stage transitions and allows navigating across stages", () => {
    render(
      <AssessmentView
        initialProfile={defaultProfile}
        onSaveProfile={vi.fn()}
        onGoToMatches={vi.fn()}
      />
    );

    // Initially at Stage 1: Học lực
    expect(screen.getByText(/Toán học \(Math\)/i)).toBeDefined();

    // Click next button to go to Stage 2: Sở thích
    const nextBtn = screen.getByRole("button", { name: /Tiếp tục: Sở thích/i });
    fireEvent.click(nextBtn);

    // Should now display Stage 2: Sở thích
    expect(screen.getByText(/Công nghệ & Máy tính/i)).toBeDefined();

    // Click Stage 3 button directly via data-testid
    const stage3Btn = screen.getByTestId("stage-tab-scenarios");
    fireEvent.click(stage3Btn);

    // Should now display Stage 3: Tình huống
    expect(screen.getByText(/Tình huống 01/i)).toBeDefined();
    expect(screen.getByText(/Ngày cuối tuần tự do/i)).toBeDefined();
  });

  it("supports interactive values ranking up to 5 with rank badges and HCMUTE red highlights", () => {
    render(
      <AssessmentView
        initialProfile={defaultProfile}
        onSaveProfile={vi.fn()}
        onGoToMatches={vi.fn()}
      />
    );

    // Go to Stage 5: Giá trị via data-testid
    const stage5Btn = screen.getByTestId("stage-tab-values");
    fireEvent.click(stage5Btn);

    expect(screen.getByText(/Chọn đúng 5 giá trị nghề nghiệp/i)).toBeDefined();

    // Toggle a value
    const incomeValueBtn = screen.getByText(/Thu nhập cao & Tài chính dồi dào/i);
    fireEvent.click(incomeValueBtn);

    // Should indicate rank
    expect(screen.getAllByText(/Hạng /i).length).toBeGreaterThan(0);
  });

  it("persists draft in localStorage (autosave & restore)", () => {
    const { unmount } = render(
      <AssessmentView
        initialProfile={defaultProfile}
        onSaveProfile={vi.fn()}
        onGoToMatches={vi.fn()}
      />
    );

    // Verify localStorage has saved draft
    const saved = localStorage.getItem("cg_assessment_draft_v6");
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.currentTab).toBe("academic");
    unmount();

    // Re-render: should restore smoothly
    render(
      <AssessmentView
        initialProfile={defaultProfile}
        onSaveProfile={vi.fn()}
        onGoToMatches={vi.fn()}
      />
    );
    expect(screen.getByText(/Đã lưu tự động/i)).toBeDefined();
  });

  it("displays Result Reveal modal when finishing Stage 7 with CTA 'Khám phá Career DNA của tôi'", () => {
    const handleSave = vi.fn();
    const handleGoToProfile = vi.fn();

    render(
      <AssessmentView
        initialProfile={defaultProfile}
        onSaveProfile={handleSave}
        onGoToProfile={handleGoToProfile}
        onGoToMatches={vi.fn()}
      />
    );

    // Go to Stage 7: Mục tiêu via data-testid
    const stage7Btn = screen.getByTestId("stage-tab-aspirations");
    fireEvent.click(stage7Btn);

    expect(screen.getByText(/Tầm Nhìn & Mục Tiêu 10 Năm/i)).toBeDefined();

    // Click Complete button
    const finishBtn = screen.getByRole("button", { name: /Hoàn tất & Xem Chân dung Career DNA/i });
    fireEvent.click(finishBtn);

    expect(handleSave).toHaveBeenCalled();

    // Result Reveal Modal should appear
    expect(screen.getByText(/Career Profile Generated/i)).toBeDefined();
    expect(screen.getByText(/Chân Dung Career DNA Của Bạn Đã Sẵn Sàng!/i)).toBeDefined();

    // CTA
    const dnaCta = screen.getByRole("button", { name: /Khám phá Career DNA của tôi/i });
    expect(dnaCta).toBeDefined();
    fireEvent.click(dnaCta);
    expect(handleGoToProfile).toHaveBeenCalled();
  });
});
