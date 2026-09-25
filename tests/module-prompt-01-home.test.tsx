import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LandingView, SmartNextAction } from "@/components/career-guidance/views/LandingView";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";

describe("MODULE PROMPT 01 — OVERVIEW / HOME", () => {
  const defaultProfile = createDefaultProfile();

  it("renders State 1 (Chưa có dữ liệu / Landing mode) with headline, explanation, and CTAs", () => {
    const handleStart = vi.fn();
    const handleExploreDemo = vi.fn();
    const handleOpenCoach = vi.fn();
    const handleSelectUserType = vi.fn();

    render(
      <LandingView
        onStartAssessment={handleStart}
        onExploreDemo={handleExploreDemo}
        onOpenCoach={handleOpenCoach}
        onSelectUserType={handleSelectUserType}
        currentUserType="high_school"
        profile={undefined}
      />
    );

    // Headline
    expect(screen.getByText(/Khám phá bản thân/i)).toBeDefined();
    expect(screen.getByText(/Kiến tạo tương lai/i)).toBeDefined();

    // Primary & Secondary CTAs
    const startBtn = screen.getByText(/Bắt đầu hành trình \(Khám phá & Dựng Hồ sơ\)/i);
    expect(startBtn).toBeDefined();
    fireEvent.click(startBtn);
    expect(handleStart).toHaveBeenCalled();

    const demoBtn = screen.getByText(/Xem hồ sơ mẫu/i);
    expect(demoBtn).toBeDefined();

    // AI Companion Presentation
    expect(screen.getByText(/AI Career Coach HCMUTE/i)).toBeDefined();

    // 4 Persona cards
    expect(screen.getByText(/Học sinh THPT/i)).toBeDefined();
    expect(screen.getByText(/Sinh viên Đại học/i)).toBeDefined();
    expect(screen.getByText(/Sắp \/ Vừa tốt nghiệp/i)).toBeDefined();
    expect(screen.getByText(/Người chuyển nghề/i)).toBeDefined();

    // 6 Core Questions
    expect(screen.getByText(/6 Câu hỏi cốt lõi mà nền tảng giải quyết/i)).toBeDefined();
    expect(screen.getByText(/Tôi là ai\?/i)).toBeDefined();
  });

  it("renders State 2 (Personal Career Command Center) for returning users with 5-level hierarchy", () => {
    const handleNavigate = vi.fn();
    const handleStart = vi.fn();
    const handleOpenCoach = vi.fn();

    render(
      <LandingView
        onStartAssessment={handleStart}
        onExploreDemo={vi.fn()}
        onOpenCoach={handleOpenCoach}
        onSelectUserType={vi.fn()}
        currentUserType="university_student"
        profile={defaultProfile}
        onNavigateView={handleNavigate}
        userXp={350}
        completedSteps={["assessment", "profile", "matches"]}
      />
    );

    // Welcome message
    expect(screen.getByText(/Chào mừng bạn quay lại/i)).toBeDefined();

    // Priority 1: SmartNextAction
    expect(
      screen.getByText(/Bạn đã hoàn thành Career DNA\. Tiếp theo hãy khám phá 5 nhóm nghề phù hợp nhất\./i)
    ).toBeDefined();
    const matchesBtn = screen.getByText(/Xem kết quả khớp/i);
    expect(matchesBtn).toBeDefined();
    fireEvent.click(matchesBtn);
    expect(handleNavigate).toHaveBeenCalledWith("matches");

    // Priority 2: Insight quan trọng nhất
    expect(screen.getByText(/Tín hiệu Định hướng & Chân dung Năng lực Cốt lõi/i)).toBeDefined();
    expect(screen.getByText(/Thế mạnh cốt lõi/i)).toBeDefined();
    expect(screen.getByText(/Điểm mù cần lưu ý/i)).toBeDefined();

    // Priority 3: Top recommendation (Career Match & Major Match)
    expect(screen.getByText(/Cặp Đôi So Khớp Nghề Nghiệp & Ngành Đào Tạo Tương Thích Nhất/i)).toBeDefined();
    expect(screen.getByText(/Nghề Tương Thích #1/i)).toBeDefined();
    expect(screen.getByText(/Ngành Đào Tạo Tương Thích #1/i)).toBeDefined();

    // Priority 4: Progress
    expect(screen.getByText(/Hành trình 10 Chặng Nghề/i)).toBeDefined();
    expect(screen.getByText(/Mức độ hoàn thiện Hồ sơ/i)).toBeDefined();
    expect(screen.getByText(/Cấp độ nhận thức/i)).toBeDefined();

    // Priority 5: Saved items & HCMUTE AI recommendation
    expect(screen.getByText(/Mục Đã Lưu & Bàn Làm Việc/i)).toBeDefined();
    expect(screen.getByText(/Khuyến Nghị Từ Ban Cố Vấn HCMUTE/i)).toBeDefined();
  });

  it("SmartNextAction adapts dynamically according to user progress", () => {
    const handleStart = vi.fn();
    const handleNav = vi.fn();

    // Case A: Fresh user
    const { unmount } = render(
      <SmartNextAction
        profile={undefined}
        onStartAssessment={handleStart}
        onNavigateView={handleNav}
      />
    );
    expect(screen.getByText(/Khởi động Khám phá Bản thân/i)).toBeDefined();
    const startCta = screen.getByText(/Bắt đầu hành trình \(Khám phá & Dựng Hồ sơ\)/i);
    fireEvent.click(startCta);
    expect(handleStart).toHaveBeenCalled();
    unmount();

    // Case B: Active Roadmap
    const mockRoadmap = {
      target_career_id: "ai_engineer",
      target_career_name: "Kỹ sư Trí tuệ Nhân tạo",
      created_at: new Date().toISOString(),
      stages: []
    };

    render(
      <SmartNextAction
        profile={defaultProfile}
        roadmap={mockRoadmap}
        onNavigateView={handleNav}
      />
    );
    expect(
      screen.getByText(/Bạn đang theo đuổi lộ trình Kỹ sư Trí tuệ Nhân tạo\. Tiếp theo hãy hoàn thành các nhiệm vụ tuần này\./i)
    ).toBeDefined();
    const roadmapCta = screen.getByText(/Tiếp tục thực hiện lộ trình/i);
    fireEvent.click(roadmapCta);
    expect(handleNav).toHaveBeenCalledWith("roadmap");
  });

  it("allows switching between Command Center and Landing mode with viewMode pill", () => {
    render(
      <LandingView
        onStartAssessment={vi.fn()}
        onExploreDemo={vi.fn()}
        onOpenCoach={vi.fn()}
        onSelectUserType={vi.fn()}
        currentUserType="university_student"
        profile={defaultProfile}
      />
    );

    // Initial mode is Command Center for profile with data
    expect(screen.getAllByText(/Personal Career Command Center/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Chào mừng bạn quay lại/i)).toBeDefined();

    // Switch to Landing mode
    const landingToggle = screen.getByText(/Trang Giới thiệu \(Landing\)/i);
    fireEvent.click(landingToggle);

    // Should now display Landing State with Headline
    expect(screen.getByText(/Khám phá bản thân/i)).toBeDefined();
    expect(screen.getByText(/Kiến tạo tương lai/i)).toBeDefined();

    // Switch back to Command Center
    const ccToggle = screen.getByText(/Trung tâm chỉ huy \(Command Center\)/i);
    fireEvent.click(ccToggle);
    expect(screen.getByText(/Chào mừng bạn quay lại/i)).toBeDefined();
  });
});
