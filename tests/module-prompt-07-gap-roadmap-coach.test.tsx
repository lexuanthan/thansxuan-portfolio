import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SkillGapView } from "@/components/career-guidance/views/SkillGapView";
import { RoadmapView } from "@/components/career-guidance/views/RoadmapView";
import { AiCoachView } from "@/components/career-guidance/views/AiCoachView";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";
import { rankCareers, rankMajors } from "@/lib/career-guidance/matchingEngine";
import { generatePersonalRoadmap, PROGRESSION_STAGES, TIME_HORIZONS, optimizeRoadmapWithAI } from "@/lib/career-guidance/roadmapEngine";
import { analyzeSkillGaps } from "@/lib/career-guidance/skillGapEngine";

describe("MODULE PROMPT 07 — GAP ANALYSIS, ROADMAP & AI COACH", () => {
  const defaultProfile = createDefaultProfile();
  const topCareers = rankCareers(defaultProfile);
  const topMajors = rankMajors(defaultProfile);
  const targetCareer = CAREERS_DATA[0];
  const initialRoadmap = generatePersonalRoadmap(targetCareer, defaultProfile);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("A. GAP ANALYSIS", () => {
    it("renders CURRENT PROFILE vs TARGET ROLE comparison banner", () => {
      render(
        <SkillGapView
          profile={defaultProfile}
          targetCareer={targetCareer}
          onNavigateView={vi.fn()}
        />
      );

      // Verify Profile vs Target Role banner
      expect(screen.getByText(/CURRENT PROFILE/i)).toBeDefined();
      expect(screen.getByText(/TARGET ROLE/i)).toBeDefined();
      expect(screen.getAllByText(targetCareer.name).length).toBeGreaterThan(0);
    });

    it("supports 7 gap categories and provides category filter tabs", () => {
      render(
        <SkillGapView
          profile={defaultProfile}
          targetCareer={targetCareer}
          onNavigateView={vi.fn()}
        />
      );

      // Check category tab buttons exist
      const tabs = screen.getAllByRole("button");
      expect(tabs.length).toBeGreaterThan(7);

      // Test filtering by skills
      const skillsTab = screen.getByRole("button", { name: /Kỹ năng kỹ thuật/i });
      fireEvent.click(skillsTab);
      expect(skillsTab.className).toContain("bg-brand-600");
    });

    it("displays current, target, priority, effort, evidence and CTA 'Thêm vào lộ trình' for each gap", () => {
      render(
        <SkillGapView
          profile={defaultProfile}
          targetCareer={targetCareer}
          onNavigateView={vi.fn()}
        />
      );

      // Verify current vs target indicators
      expect(screen.getAllByText(/Hiện tại/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Mục tiêu/i).length).toBeGreaterThan(0);

      // Verify effort & evidence displays
      expect(screen.getAllByText(/Thời lượng ước tính/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Căn cứ/i).length).toBeGreaterThan(0);

      // Verify CTA "Thêm vào lộ trình"
      const addButtons = screen.getAllByText(/Thêm vào lộ trình/i);
      expect(addButtons.length).toBeGreaterThan(0);

      // Clicking CTA should show feedback state
      fireEvent.click(addButtons[0]);
      expect(screen.getAllByText(/Đã thêm/i).length).toBeGreaterThan(0);
    });
  });

  describe("B. ROADMAP — CAREER PROGRESSION MAP & NODES", () => {
    it("renders as a Career Progression Map instead of a simple flat list", () => {
      render(
        <RoadmapView
          profile={defaultProfile}
          currentRoadmap={initialRoadmap}
          onUpdateRoadmap={vi.fn()}
          onAskCoachAboutItem={vi.fn()}
        />
      );

      // Progression stage sequence: Discover → Learn → Build → Practice → Experience → Validate → Apply
      expect(screen.getAllByText(/Discover/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Learn/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Build/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Practice/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Experience/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Validate/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Apply/i).length).toBeGreaterThan(0);
    });

    it("displays node details: task, duration, status, dependency, and outcome", () => {
      render(
        <RoadmapView
          profile={defaultProfile}
          currentRoadmap={initialRoadmap}
          onUpdateRoadmap={vi.fn()}
          onAskCoachAboutItem={vi.fn()}
        />
      );

      // Verify node headers and metadata
      expect(screen.getAllByText(/Node 01/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Thời lượng:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Dependency/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Outcome/i).length).toBeGreaterThan(0);

      // Verify status indicators
      expect(screen.getAllByText(/In Progress|Completed|Pending|Locked/i).length).toBeGreaterThan(0);
    });
  });

  describe("C. TIME HORIZON", () => {
    it("renders the 5 required time horizons: 30 days, 90 days, 6 months, 12 months, 1–3 years", () => {
      render(
        <RoadmapView
          profile={defaultProfile}
          currentRoadmap={initialRoadmap}
          onUpdateRoadmap={vi.fn()}
          onAskCoachAboutItem={vi.fn()}
        />
      );

      // 5 Time horizons
      expect(screen.getByRole("button", { name: /30 days/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /90 days/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /6 months/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /12 months/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /1–3 years/i })).toBeDefined();

      // Switching horizon updates active stage tasks
      const tab90d = screen.getByRole("button", { name: /90 days/i });
      fireEvent.click(tab90d);
      expect(screen.getByText(/Chặng 2: 90 Ngày Tăng Tốc/i)).toBeDefined();
    });
  });

  describe("D. AI ROADMAP OPTIMIZATION", () => {
    it("provides 'AI tối ưu lộ trình' CTA and opens optimization modal", () => {
      const onUpdateRoadmap = vi.fn();
      render(
        <RoadmapView
          profile={defaultProfile}
          currentRoadmap={initialRoadmap}
          onUpdateRoadmap={onUpdateRoadmap}
          onAskCoachAboutItem={vi.fn()}
        />
      );

      const aiOptimizeBtn = screen.getByRole("button", { name: /AI tối ưu lộ trình/i });
      fireEvent.click(aiOptimizeBtn);

      // Modal appears
      expect(screen.getByText(/AI Tối Ưu Hóa Lộ Trình Cá Nhân/i)).toBeDefined();
      expect(screen.getAllByText(/Thời gian khả dụng/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Khoảng trống năng lực/i)).toBeDefined();

      // Execute optimization
      const confirmBtn = screen.getByRole("button", { name: /Áp dụng tối ưu hóa ngay/i });
      fireEvent.click(confirmBtn);

      expect(onUpdateRoadmap).toHaveBeenCalled();
    });

    it("engine optimizeRoadmapWithAI recalculates tasks based on available hours and gaps", () => {
      const { optimizedRoadmap, optimizationSummary, pacingPill } = optimizeRoadmapWithAI(initialRoadmap, 10, defaultProfile);
      expect(optimizedRoadmap.stages.length).toBe(5);
      expect(optimizedRoadmap.stages[0].tasks.length).toBeGreaterThan(0);
      expect(optimizedRoadmap.stages[0].tasks[0].estimated_effort).toBeDefined();
      expect(optimizationSummary).toBeDefined();
      expect(pacingPill).toBeDefined();
    });
  });

  describe("E. AI COACH — CONTEXTUAL ACTIONS", () => {
    it("renders the 5 contextual action triggers: Giải thích, So sánh, Lập kế hoạch, Gợi ý cải thiện, Đánh giá lựa chọn", () => {
      render(
        <AiCoachView
          profile={defaultProfile}
          topCareers={topCareers}
          topMajors={topMajors}
          roadmap={initialRoadmap}
        />
      );

      // Verify all 5 contextual action buttons are rendered via test IDs
      expect(screen.getByTestId("action-explain")).toBeDefined();
      expect(screen.getByTestId("action-compare")).toBeDefined();
      expect(screen.getByTestId("action-plan")).toBeDefined();
      expect(screen.getByTestId("action-improve")).toBeDefined();
      expect(screen.getByTestId("action-evaluate")).toBeDefined();
    });

    it("triggers contextual action message and sends structured action_type", async () => {
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          reply: "Đây là giải thích chi tiết về mức độ phù hợp của bạn.",
          reasoning_summary: "Đối soát ma trận liên kết giữa đặc tính Career DNA và yêu cầu nghề nghiệp.",
          evidence: ["Điểm mạnh tư duy logic", "Chỉ số hứng thú Holland Codes"],
          uncertainty: "Cần kiểm chứng qua dự án thực tế."
        })
      });

      render(
        <AiCoachView
          profile={defaultProfile}
          topCareers={topCareers}
          topMajors={topMajors}
          roadmap={initialRoadmap}
        />
      );

      const explainBtn = screen.getByTestId("action-explain");
      fireEvent.click(explainBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/ai/career-coach",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining('"action_type":"explain"')
          })
        );
      });
    });
  });

  describe("F. AI PANEL VISUAL SYSTEM", () => {
    it("features HCMUTE brand elements, light premium design, and minimal radius", () => {
      const { container } = render(
        <AiCoachView
          profile={defaultProfile}
          topCareers={topCareers}
          topMajors={topMajors}
          roadmap={initialRoadmap}
        />
      );

      // Header has subtle HCMUTE red accent ribbon and blue highlights
      expect(container.innerHTML).toContain("border-t-[#D9232E]");
      expect(container.innerHTML).toContain("text-[#004098]");
      expect(container.innerHTML).toContain("HCMUTE CAREER DECISION INTELLIGENCE");

      // Verify minimal radius (rounded-[6px] or rounded-[8px] instead of large pills)
      expect(container.innerHTML).toContain("rounded-[8px]");
      expect(container.innerHTML).toContain("rounded-[6px]");
    });
  });

  describe("G. TRUST & EXPLAINABILITY", () => {
    it("displays reasoning summary, evidence, and uncertainty without overconfident conclusions", () => {
      render(
        <AiCoachView
          profile={defaultProfile}
          topCareers={topCareers}
          topMajors={topMajors}
          roadmap={initialRoadmap}
        />
      );

      // Initial welcome message renders Trust block
      expect(screen.getByText(/Tóm tắt suy luận/i)).toBeDefined();
      expect(screen.getByText(/Căn cứ dữ liệu thực chứng/i)).toBeDefined();
      expect(screen.getByText(/Giới hạn & Điểm cần kiểm chứng/i)).toBeDefined();

      // Humble, calibrated disclaimer
      expect(screen.getByText(/Nguyên tắc HCMUTE AI: Định hướng khách quan, không kết luận tuyệt đối hóa/i)).toBeDefined();
    });
  });
});
