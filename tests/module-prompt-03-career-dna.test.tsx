import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileView } from "@/components/career-guidance/views/ProfileView";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";

describe("MODULE PROMPT 03 — CAREER DNA (Personal Career Identity Profile)", () => {
  const profile = createDefaultProfile();
  const mockGoToMatches = vi.fn();
  const mockGoToRoadmap = vi.fn();
  const mockGoToCoach = vi.fn();
  const mockRetakeAssessment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. HERO: displays Career DNA label, Career Identity Archetype, and 3-5 key traits", () => {
    render(
      <ProfileView
        profile={profile}
        onGoToMatches={mockGoToMatches}
        onGoToRoadmap={mockGoToRoadmap}
        onGoToCoach={mockGoToCoach}
        onRetakeAssessment={mockRetakeAssessment}
      />
    );

    // Hero Career DNA & Identity
    expect(screen.getByText(/^CAREER DNA$/i)).toBeDefined();
    expect(screen.getByText(/Personal Career Identity Profile/i)).toBeDefined();
    expect(screen.getByText(new RegExp(profile.profile_archetype.title, "i"))).toBeDefined();

    // 3-5 Key Traits
    expect(screen.getByText(/Các đặc trưng cốt lõi \(Core Traits\)/i)).toBeDefined();
    expect(screen.getByText(/Tư duy Hệ thống & Kiến trúc/i)).toBeDefined();
    expect(screen.getAllByText(/Giải quyết Vấn đề Thực tiễn/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Làm việc Độc lập Tự chủ/i)).toBeDefined();
    expect(screen.getAllByText(/Làm chủ Công nghệ Kỹ thuật/i).length).toBeGreaterThan(0);
  });

  it("2. VISUALS: renders Radar chart, Trait clusters, and switches between Dimensions & Spectrum", () => {
    render(
      <ProfileView
        profile={profile}
        onGoToMatches={mockGoToMatches}
        onGoToRoadmap={mockGoToRoadmap}
        onGoToCoach={mockGoToCoach}
        onRetakeAssessment={mockRetakeAssessment}
      />
    );

    // Radar chart title (backward compatibility preserved)
    expect(screen.getByText(/8 Trục Năng Lực Career DNA/i)).toBeDefined();

    // Trait Clusters
    expect(screen.getByText(/Cụm Năng Lực Hội Tụ \(Trait Clusters\)/i)).toBeDefined();
    expect(screen.getByText(/Cụm Kỹ Thuật & Phân Tích/i)).toBeDefined();
    expect(screen.getByText(/Cụm Sáng Tạo & Tự Chủ/i)).toBeDefined();
    expect(screen.getByText(/Cụm Lãnh Đạo & Điều Phối/i)).toBeDefined();

    // Switch between 10 Core Dimensions and Style Spectrum
    const spectrumTabBtn = screen.getByRole("button", { name: /Phổ Phong cách/i });
    fireEvent.click(spectrumTabBtn);
    expect(screen.getByText(/Phổ Phong Cách Làm Việc Tự Nhiên \(Spectrum\)/i)).toBeDefined();
    expect(screen.getAllByText(/Lý thuyết & Nghiên cứu/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Thực hành & Ứng dụng/i).length).toBeGreaterThan(0);

    // Switch back to Dimensions
    const dimensionsTabBtn = screen.getByRole("button", { name: /10 Năng lực \(0–100\)/i });
    fireEvent.click(dimensionsTabBtn);
    expect(screen.getByText(/10 Trục Năng Lực Cốt Lõi \(Core Dimensions\)/i)).toBeDefined();
  });

  it("3. CORE DIMENSIONS: renders all 10 core dimensions with scores", () => {
    render(
      <ProfileView
        profile={profile}
        onGoToMatches={mockGoToMatches}
        onGoToRoadmap={mockGoToRoadmap}
        onGoToCoach={mockGoToCoach}
        onRetakeAssessment={mockRetakeAssessment}
      />
    );

    expect(screen.getAllByText(/Analytical/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Creative/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Social/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Structure/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Autonomy/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Technology/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Leadership/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Collaboration/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Problem Solving/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Learning Orientation/i).length).toBeGreaterThan(0);
  });

  it("4. INSIGHT CARDS: renders 4 structured cards with Title, Meaning, Evidence, and Implication", () => {
    render(
      <ProfileView
        profile={profile}
        onGoToMatches={mockGoToMatches}
        onGoToRoadmap={mockGoToRoadmap}
        onGoToCoach={mockGoToCoach}
        onRetakeAssessment={mockRetakeAssessment}
      />
    );

    expect(screen.getByText(/Các Insight Nhận Thức Then Chốt \(Key Career Insights\)/i)).toBeDefined();
    expect(screen.getByText(/Tư duy xây dựng hệ thống cao/i)).toBeDefined();
    expect(screen.getByText(/Động lực nội tại từ thực hành & chuyển hóa công nghệ/i)).toBeDefined();

    // Verification of 4-level structure labels
    const meanings = screen.getAllByText(/Ý nghĩa cốt lõi \(Meaning\):/i);
    expect(meanings.length).toBeGreaterThanOrEqual(4);

    const evidences = screen.getAllByText(/Căn cứ dữ liệu \(Evidence\):/i);
    expect(evidences.length).toBeGreaterThanOrEqual(4);

    const implications = screen.getAllByText(/Tác động định hướng \(Implication\):/i);
    expect(implications.length).toBeGreaterThanOrEqual(4);
  });

  it("5. STRENGTHS & ENVIRONMENT: renders 4 pillars (Top strengths, Natural work style, Preferred environment, Key values)", () => {
    render(
      <ProfileView
        profile={profile}
        onGoToMatches={mockGoToMatches}
        onGoToRoadmap={mockGoToRoadmap}
        onGoToCoach={mockGoToCoach}
        onRetakeAssessment={mockRetakeAssessment}
      />
    );

    expect(screen.getByText(/4 Trụ Cột Thành Công Nghề Nghiệp/i)).toBeDefined();
    expect(screen.getByText(/Điểm mạnh hàng đầu \(Top Strengths\)/i)).toBeDefined();
    expect(screen.getByText(/Phong cách làm việc tự nhiên \(Natural Work Style\)/i)).toBeDefined();
    expect(screen.getByText(/Môi trường làm việc lý tưởng \(Preferred Environment\)/i)).toBeDefined();
    expect(screen.getByText(/Hệ giá trị cốt lõi \(Key Values\)/i)).toBeDefined();
  });

  it("6. WATCH-OUT: constructive framing as 'Điểm cần lưu ý' / 'Vùng cần phát triển' (not 'điểm yếu')", () => {
    render(
      <ProfileView
        profile={profile}
        onGoToMatches={mockGoToMatches}
        onGoToRoadmap={mockGoToRoadmap}
        onGoToCoach={mockGoToCoach}
        onRetakeAssessment={mockRetakeAssessment}
      />
    );

    // Assert that constructive title is used
    expect(screen.getByText(/Điểm cần lưu ý & Vùng cần phát triển \(Watch-Out & Growth Areas\)/i)).toBeDefined();
    expect(screen.getByText(/Khuynh hướng cầu toàn kỹ thuật \(Analysis Paralysis\)/i)).toBeDefined();
    expect(screen.getByText(/Truyền đạt liên ngành & Thuyết phục phi kỹ thuật/i)).toBeDefined();

    // Assert that 'điểm yếu' is NOT present in document
    expect(screen.queryByText(/^điểm yếu$/i)).toBeNull();
  });

  it("7. CTAs: primary 'Xem nghề phù hợp', secondary 'AI giải thích Career DNA', and interactive AI modal", () => {
    render(
      <ProfileView
        profile={profile}
        onGoToMatches={mockGoToMatches}
        onGoToRoadmap={mockGoToRoadmap}
        onGoToCoach={mockGoToCoach}
        onRetakeAssessment={mockRetakeAssessment}
      />
    );

    // Primary CTA
    const primaryCtas = screen.getAllByRole("button", { name: /Xem nghề phù hợp/i });
    expect(primaryCtas.length).toBeGreaterThan(0);
    fireEvent.click(primaryCtas[0]);
    expect(mockGoToMatches).toHaveBeenCalled();

    // Secondary CTA
    const aiExplainBtns = screen.getAllByRole("button", { name: /AI giải thích Career DNA/i });
    expect(aiExplainBtns.length).toBeGreaterThan(0);

    // Open AI explanation modal
    fireEvent.click(aiExplainBtns[0]);
    expect(screen.getByText(/AI Career Coach • Giải Mã Career DNA/i)).toBeDefined();
    expect(screen.getByText(/Khối ngành HCMUTE tương thích tự nhiên nhất/i)).toBeDefined();

    // Click coach CTA inside modal
    const coachInModalBtn = screen.getByRole("button", { name: /Trò chuyện trực tiếp với AI Coach/i });
    fireEvent.click(coachInModalBtn);
    expect(mockGoToCoach).toHaveBeenCalled();
  });
});
